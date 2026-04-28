import asyncio
import uuid
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.v1 import community as community_api
from app.api.v1.community import (
    _compact_title,
    _fallback_tip,
    _parse_tip_response,
    _report_hint,
)
from app.services.request_cooldown_store import close_request_cooldown_store


def test_compact_title_trims_and_limits_to_15_chars():
    title = _compact_title("  明天 先给对方发一句真实近况再看看回应  ")

    assert title == "明天先给对方发一句真实近况再看"
    assert len(title) == 15


def test_fallback_tip_prefers_focus_mapping():
    tip = _fallback_tip(
        pair_type="bestfriend",
        focus_items=["increase_shared_checkins"],
        risk_summary={"current_level": "none", "trend": "watch"},
    )

    assert tip["title"] == "先补一次联系"
    assert "明天" in tip["description"]


def test_report_hint_picks_best_available_summary():
    hint = _report_hint(
        {
            "change_summary": "最近互动回暖了一点，建议先保持轻量联系。",
            "suggestion": "这条不该优先命中",
        }
    )

    assert hint == "最近互动回暖了一点，建议先保持轻量联系。"


def test_parse_tip_response_falls_back_when_json_invalid():
    fallback = {
        "title": "先做一个小动作",
        "description": "明天先做一步最轻的小动作。",
        "content": "明天先做一步最轻的小动作。",
        "source": "rule",
    }

    parsed = _parse_tip_response("这不是合法 JSON", fallback)

    assert parsed == fallback


def test_generate_ai_tip_rate_limits_repeated_requests(monkeypatch):
    asyncio.run(close_request_cooldown_store())
    user_id = uuid.uuid4()

    async def override_current_user():
        return SimpleNamespace(id=user_id)

    async def override_get_db():
        yield object()

    async def fake_resolve_tip_pair(*_args, **_kwargs):
        return None, "solo"

    async def fake_generate_personalized_tip(*_args, **_kwargs):
        return {
            "title": "先做一件小事",
            "description": "明天先完成一步最轻的小动作。",
            "content": "明天先完成一步最轻的小动作。",
            "source": "ai",
        }

    monkeypatch.setattr(community_api, "_resolve_tip_pair", fake_resolve_tip_pair)
    monkeypatch.setattr(community_api, "_generate_personalized_tip", fake_generate_personalized_tip)

    app = FastAPI()
    app.include_router(community_api.router)
    app.dependency_overrides[community_api.get_current_user] = override_current_user
    app.dependency_overrides[community_api.get_db] = override_get_db

    try:
        with TestClient(app, raise_server_exceptions=False) as client:
            responses = [
                client.post("/community/tips/generate", params={"pair_type": "solo"})
                for _ in range(3)
            ]

        assert [response.status_code for response in responses[:2]] == [200, 200]
        assert responses[2].status_code == 429, responses[2].text
        assert "秒后再试" in responses[2].json()["detail"]
    finally:
        asyncio.run(close_request_cooldown_store())

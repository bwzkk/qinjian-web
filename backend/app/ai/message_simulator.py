"""Message simulation helpers for pre-send relationship coaching."""

import asyncio
import json

from app.ai import chat_completion
from app.ai.policy import compose_relationship_system_prompt
from app.core.config import settings
from app.services.display_labels import risk_level_label, translate_inline_codes
from app.services.relationship_algorithms import build_message_preview_baseline

# Frontend AI requests are capped at 60s; surface timeout before the client aborts.
SIMULATION_TIMEOUT_SECONDS = 55


SIMULATION_SYSTEM_PROMPT = compose_relationship_system_prompt("""你是亲密关系沟通教练。你的任务不是判断谁对谁错，而是帮助用户在发消息前，预演对方可能的感受、识别误读风险，并给出更安全但不失真诚的表达改写。

请结合提供的关系画像、风险状态和当前草稿，输出一个务实、克制、可执行的判断。不要用治疗式大段安慰，也不要夸张吓人。严格输出 JSON。"""
)


SIMULATION_PROMPT = """请根据以下关系上下文和结构化判断，预演这条消息可能带来的影响。

【关系上下文】
{context_json}

【用户准备发出的原话】
{draft}

【结构化判断（请以此为边界，不要把低风险写成高风险，也不要把高风险轻描淡写）】
{evidence_json}

请输出 JSON（不要包含其他文字）：
{{
  "partner_view": "对方最可能的第一感受或理解（40字内）",
  "likely_impact": "这条话发出去后，互动最可能出现的走向（50字内）",
  "risk_level": "low/medium/high",
  "risk_reason": "为什么存在这个风险（50字内）",
  "safer_rewrite": "在保留用户真实意思前提下，更稳、更容易听进去的改写版本（120字内）",
  "suggested_tone": "建议采用的语气，如温和/直接但不指责/先确认再表达需求",
  "conversation_goal": "这条消息真正更适合达成的目标（30字内）",
  "do_list": ["建议做法1", "建议做法2"],
  "avoid_list": ["避免做法1", "避免做法2"]
}}"""


def _parse_json(text: str, fallback: dict) -> dict:
    try:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(cleaned)
    except (json.JSONDecodeError, IndexError):
        fallback["raw_response"] = text
        return fallback


def _clean_string(value: object, limit: int) -> str | None:
    if not isinstance(value, str):
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    return cleaned[:limit]


def _clean_list(value: object, *, limit: int = 2, item_limit: int = 24) -> list[str]:
    if not isinstance(value, list):
        return []
    cleaned: list[str] = []
    for item in value:
        text = _clean_string(item, item_limit)
        if text and text not in cleaned:
            cleaned.append(text)
        if len(cleaned) >= limit:
            break
    return cleaned


def _merge_risk_level(ai_value: object, baseline_value: str) -> str:
    ai_level = str(ai_value or "").strip().lower()
    if ai_level not in {"low", "medium", "high", "severe"}:
        return baseline_value
    return ai_level if {"low": 1, "medium": 2, "high": 3, "severe": 4}[ai_level] >= {"low": 1, "medium": 2, "high": 3}[baseline_value] else baseline_value


def _merge_preview_payload(candidate: dict, fallback: dict, draft: str) -> dict:
    merged = dict(fallback)
    for field, limit in (
        ("partner_view", 40),
        ("likely_impact", 50),
        ("risk_reason", 50),
        ("safer_rewrite", 120),
        ("suggested_tone", 32),
        ("conversation_goal", 30),
    ):
        value = _clean_string(candidate.get(field), limit)
        if value:
            merged[field] = value

    for field in ("do_list", "avoid_list"):
        values = _clean_list(candidate.get(field))
        if values:
            merged[field] = values

    merged["risk_level"] = _merge_risk_level(
        candidate.get("risk_level"),
        str(fallback.get("risk_level") or "medium"),
    )
    for field in (
        "algorithm_version",
        "confidence",
        "decision_trace",
        "focus_labels",
        "risk_score",
        "baseline_delta",
        "fallback_reason",
        "shadow_result",
        "feedback_status",
    ):
        if candidate.get(field) is not None:
            merged[field] = candidate.get(field)
    if str(merged.get("safer_rewrite") or "").strip() == draft.strip():
        merged["safer_rewrite"] = fallback["safer_rewrite"]
    merged.pop("raw_error", None)
    merged.pop("raw_response", None)
    return merged


async def simulate_message_preview(draft: str, context: dict) -> dict:
    fallback = build_message_preview_baseline(draft, context)
    fallback.setdefault("fallback_reason", None)
    fallback.setdefault("shadow_result", None)
    prompt = SIMULATION_PROMPT.format(
        context_json=json.dumps(context, ensure_ascii=False),
        draft=draft.strip(),
        evidence_json=json.dumps(fallback.get("structured_evidence") or {}, ensure_ascii=False),
    )
    messages = [
        {"role": "system", "content": SIMULATION_SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]
    try:
        result = await asyncio.wait_for(
            chat_completion(settings.AI_TEXT_MODEL, messages, temperature=0.4),
            timeout=SIMULATION_TIMEOUT_SECONDS,
        )
        parsed = _parse_json(result, fallback)
        if parsed.get("raw_response"):
            payload = dict(fallback)
            payload["fallback_reason"] = "parse_error"
        else:
            payload = _merge_preview_payload(parsed, fallback, draft)
            payload["shadow_result"] = fallback
    except asyncio.TimeoutError:
        raise
    except Exception as exc:
        fallback["raw_error"] = exc.__class__.__name__
        fallback["fallback_reason"] = exc.__class__.__name__
        payload = fallback
    safer_rewrite = str(payload.get("safer_rewrite") or "").strip()
    if not safer_rewrite or safer_rewrite == draft.strip():
        payload["safer_rewrite"] = fallback["safer_rewrite"]
    payload["risk_level_label"] = risk_level_label(payload.get("risk_level"))
    payload["suggested_tone"] = translate_inline_codes(payload.get("suggested_tone", ""))
    payload["deviation_reasons"] = [
        translate_inline_codes(item) for item in payload.get("deviation_reasons", [])
    ]
    payload.setdefault("feedback_status", "pending_feedback")
    payload.setdefault("shadow_result", None)
    return payload

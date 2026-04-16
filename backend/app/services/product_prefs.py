"""Product preference helpers for client-side AI and privacy modes."""

from __future__ import annotations

from typing import Literal


PrivacyMode = Literal["cloud", "local_first"]
PreferredEntry = Literal["daily", "emergency", "reflection"]

DEFAULT_PRODUCT_PREFS: dict[str, object] = {
    "ai_assist_enabled": True,
    "privacy_mode": "cloud",
    "preferred_entry": "daily",
    "preferred_language": "zh",
    "tone_preference": "gentle",
    "response_length": "medium",
}

VALID_PRIVACY_MODES = {"cloud", "local_first"}
VALID_PREFERRED_ENTRIES = {"daily", "emergency", "reflection"}
VALID_PREFERRED_LANGUAGES = {"zh", "en", "mixed"}
VALID_TONE_PREFERENCES = {"gentle", "direct", "warm", "concise"}
VALID_RESPONSE_LENGTHS = {"short", "medium", "long"}


def normalize_product_prefs(raw: dict | None) -> dict[str, object]:
    payload = dict(DEFAULT_PRODUCT_PREFS)
    if not isinstance(raw, dict):
        return payload

    if isinstance(raw.get("ai_assist_enabled"), bool):
        payload["ai_assist_enabled"] = raw["ai_assist_enabled"]

    privacy_mode = str(raw.get("privacy_mode") or "").strip()
    if privacy_mode in VALID_PRIVACY_MODES:
        payload["privacy_mode"] = privacy_mode

    preferred_entry = str(raw.get("preferred_entry") or "").strip()
    if preferred_entry in VALID_PREFERRED_ENTRIES:
        payload["preferred_entry"] = preferred_entry

    preferred_language = str(raw.get("preferred_language") or "").strip()
    if preferred_language in VALID_PREFERRED_LANGUAGES:
        payload["preferred_language"] = preferred_language

    tone_preference = str(raw.get("tone_preference") or "").strip()
    if tone_preference in VALID_TONE_PREFERENCES:
        payload["tone_preference"] = tone_preference

    response_length = str(raw.get("response_length") or "").strip()
    if response_length in VALID_RESPONSE_LENGTHS:
        payload["response_length"] = response_length

    return payload


def resolve_privacy_mode(raw: dict | None) -> PrivacyMode:
    prefs = normalize_product_prefs(raw)
    mode = str(prefs.get("privacy_mode") or "cloud").strip()
    return "local_first" if mode == "local_first" else "cloud"

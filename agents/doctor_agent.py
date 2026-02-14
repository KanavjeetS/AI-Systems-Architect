"""
SYNAPSE-X — Doctor Agent (Healing Intelligence)
Audits all child-agent outputs, detects issues (missing logging, error handling,
security gaps), and applies healing patches to the generated code.
"""

from __future__ import annotations

import os
import re
import textwrap
from datetime import datetime, timezone
from typing import Any


# ── Issue detection rules ────────────────────────────────────────────────────

_ISSUE_RULES: list[dict[str, Any]] = [
    {
        "id": "MISSING_LOGGING",
        "severity": "warning",
        "description": "No logging import or logger instance detected",
        "pattern": r"import logging|logging\.getLogger",
        "must_match": True,
    },
    {
        "id": "NO_ERROR_HANDLING",
        "severity": "warning",
        "description": "No try/except blocks found — service may crash on errors",
        "pattern": r"\btry\b\s*:",
        "must_match": True,
    },
    {
        "id": "HARDCODED_SECRETS",
        "severity": "critical",
        "description": "Potential hardcoded secret or password detected",
        "pattern": r'(?i)(password|secret|api_key)\s*=\s*["\'][^"\']+["\']',
        "must_match": False,
    },
    {
        "id": "NO_INPUT_VALIDATION",
        "severity": "info",
        "description": "No Pydantic model used for request validation",
        "pattern": r"BaseModel|Field\(|validator",
        "must_match": True,
    },
    {
        "id": "NO_CORS",
        "severity": "info",
        "description": "CORS middleware not configured — may block frontend requests",
        "pattern": r"CORSMiddleware|add_middleware",
        "must_match": True,
    },
    {
        "id": "NO_RATE_LIMITING",
        "severity": "info",
        "description": "No rate limiting detected",
        "pattern": r"RateLimiter|slowapi|throttle",
        "must_match": True,
    },
]


def _detect_issues(code: str) -> list[dict[str, str]]:
    """Scan code string against issue rules and return findings."""
    issues: list[dict[str, str]] = []
    for rule in _ISSUE_RULES:
        found = bool(re.search(rule["pattern"], code))
        if rule["must_match"] and not found:
            issues.append({
                "id": rule["id"],
                "severity": rule["severity"],
                "description": rule["description"],
            })
        elif not rule["must_match"] and found:
            issues.append({
                "id": rule["id"],
                "severity": rule["severity"],
                "description": rule["description"],
            })
    return issues


# ── Healing patches ──────────────────────────────────────────────────────────

def _heal_missing_logging(code: str) -> str:
    """Inject logging if absent."""
    if "import logging" not in code:
        injection = textwrap.dedent("""\
            import logging

            logging.basicConfig(
                level=logging.INFO,
                format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
            )
            logger = logging.getLogger(__name__)

        """)
        # Insert after the first docstring or at the top
        if '"""' in code:
            end_doc = code.index('"""', code.index('"""') + 3) + 3
            code = code[: end_doc] + "\n" + injection + code[end_doc:]
        else:
            code = injection + code
    return code


def _heal_missing_error_handling(code: str) -> str:
    """Wrap endpoint bodies in try/except where missing."""
    if "try:" not in code:
        # Add a global exception handler for FastAPI
        handler = textwrap.dedent("""

            # ── Doctor Agent: Global Error Handler ──────────────────────────
            from fastapi.responses import JSONResponse

            @app.exception_handler(Exception)
            async def global_exception_handler(request, exc):
                logger.error(f"Unhandled error: {exc}", exc_info=True)
                return JSONResponse(
                    status_code=500,
                    content={"error": "Internal server error", "detail": str(exc)},
                )
        """)
        code += handler
    return code


def _heal_missing_cors(code: str) -> str:
    """Add CORS middleware if absent."""
    if "CORSMiddleware" not in code:
        cors_block = textwrap.dedent("""
            # ── Doctor Agent: CORS Middleware ────────────────────────────────
            from fastapi.middleware.cors import CORSMiddleware

            app.add_middleware(
                CORSMiddleware,
                allow_origins=["*"],
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"],
            )
        """)
        # Insert after the app = FastAPI(...) block
        match = re.search(r"(app\s*=\s*FastAPI\(.*?\))", code, re.DOTALL)
        if match:
            insert_pos = match.end()
            code = code[:insert_pos] + "\n" + cors_block + code[insert_pos:]
        else:
            code += cors_block
    return code


def _heal_hardcoded_secrets(code: str) -> str:
    """Replace hardcoded secrets with env-var lookups."""
    def _replacer(m: re.Match) -> str:  # type: ignore[type-arg]
        key_name = m.group(1).upper()
        return f'{m.group(1)} = os.getenv("{key_name}", "")'

    code = re.sub(
        r'(?i)(password|secret|api_key)\s*=\s*["\'][^"\']+["\']',
        _replacer,
        code,
    )
    if "import os" not in code:
        code = "import os\n" + code
    return code


_HEALERS: dict[str, Any] = {
    "MISSING_LOGGING": _heal_missing_logging,
    "NO_ERROR_HANDLING": _heal_missing_error_handling,
    "NO_CORS": _heal_missing_cors,
    "HARDCODED_SECRETS": _heal_hardcoded_secrets,
}


def _apply_healing(code: str, issues: list[dict[str, str]]) -> tuple[str, list[str]]:
    """Apply all available healing patches and return healed code + summary."""
    improvements: list[str] = []
    for issue in issues:
        healer = _HEALERS.get(issue["id"])
        if healer:
            code = healer(code)
            improvements.append(f"✅ Fixed {issue['id']}: {issue['description']}")
        else:
            improvements.append(f"⚠️  Advisory {issue['id']}: {issue['description']} (no auto-fix)")
    return code, improvements


# ── Optional LLM critique ───────────────────────────────────────────────────

def _llm_critique(code: str) -> list[str]:
    """If Gemini API key is available, perform LLM-based code critique."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return []
    try:
        import requests
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-pro:generateContent?key={api_key}"
        )
        payload = {
            "contents": [{
                "parts": [{
                    "text": (
                        "Review the following Python FastAPI code for bugs, "
                        "security issues, and improvements. Return a bullet list "
                        "of findings only.\n\n" + code[:3000]
                    ),
                }],
            }],
        }
        resp = requests.post(url, json=payload, timeout=30)
        resp.raise_for_status()
        text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        return [f"🤖 Gemini: {line.strip()}" for line in text.strip().split("\n") if line.strip()]
    except Exception:
        return []


# ── Public API ───────────────────────────────────────────────────────────────

def audit_and_heal(dev_output: dict[str, Any]) -> dict[str, Any]:
    """
    Audit the developer agent's output and apply healing patches.

    Returns:
        dict with: issues_detected, healed_code, improvement_summary, status
    """
    original_code: str = dev_output.get("service_code", "")

    # 1. Detect issues
    issues = _detect_issues(original_code)

    # 2. Apply healing
    healed_code, improvements = _apply_healing(original_code, issues)

    # 3. Optional LLM critique
    llm_findings = _llm_critique(original_code)
    if llm_findings:
        improvements.extend(llm_findings)

    return {
        "agent": "doctor_agent",
        "issues_detected": issues,
        "healed_code": healed_code,
        "improvement_summary": improvements,
        "stats": {
            "issues_found": len(issues),
            "issues_healed": sum(1 for i in issues if i["id"] in _HEALERS),
            "advisory_only": sum(1 for i in issues if i["id"] not in _HEALERS),
        },
        "status": {
            "success": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }

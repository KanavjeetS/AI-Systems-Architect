"""
SYNAPSE-X — Parent Agent (Cognitive Architect)
Ingests user prompts, performs intent analysis, decomposes requirements,
generates a task graph, and produces a child-agent spawning plan.
"""

from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from typing import Any

# ── Optional Gemini integration ──────────────────────────────────────────────
_GEMINI_AVAILABLE = False
try:
    import requests as _req

    _GEMINI_KEY = os.getenv("GEMINI_API_KEY")
    if _GEMINI_KEY:
        _GEMINI_AVAILABLE = True
except ImportError:
    _req = None  # type: ignore[assignment]


# ── Keyword → category mapping for rule-based fallback ───────────────────────
_CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "architecture": [
        "design", "architect", "structure", "schema", "database", "model",
        "plan", "system", "scalab", "pattern", "microservice",
    ],
    "backend": [
        "api", "endpoint", "server", "route", "rest", "graphql", "crud",
        "auth", "login", "register", "backend", "service", "function",
        "handler", "middleware", "fastapi", "flask", "django",
    ],
    "deployment": [
        "deploy", "docker", "ci", "cd", "pipeline", "kubernetes", "k8s",
        "aws", "gcp", "azure", "infra", "terraform", "helm", "nginx",
        "container", "cloud", "hosting",
    ],
}


def _classify_keywords(text: str) -> list[str]:
    """Return matching categories based on keyword scanning."""
    text_lower = text.lower()
    found: list[str] = []
    for category, keywords in _CATEGORY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            found.append(category)
    # If nothing matched, assume full-stack
    return found or ["architecture", "backend", "deployment"]


def _rule_based_decomposition(prompt: str) -> dict[str, Any]:
    """Deterministic fallback when no LLM API key is available."""
    categories = _classify_keywords(prompt)

    tasks: list[dict[str, Any]] = []
    task_id = 1

    if "architecture" in categories:
        tasks.append({
            "id": task_id,
            "category": "architecture",
            "title": "Design system architecture",
            "description": f"Analyze requirements from prompt and design the system architecture for: {prompt[:120]}",
            "assigned_agent": "parent",
            "priority": "high",
        })
        task_id += 1

    if "backend" in categories:
        tasks.append({
            "id": task_id,
            "category": "backend",
            "title": "Generate backend service code",
            "description": "Scaffold FastAPI application with CRUD endpoints, models, and route definitions.",
            "assigned_agent": "dev_agent",
            "priority": "high",
        })
        task_id += 1
        tasks.append({
            "id": task_id,
            "category": "backend",
            "title": "Create API route definitions",
            "description": "Define RESTful routes, request/response schemas, and validation logic.",
            "assigned_agent": "dev_agent",
            "priority": "medium",
        })
        task_id += 1

    if "deployment" in categories:
        tasks.append({
            "id": task_id,
            "category": "deployment",
            "title": "Generate Dockerfile",
            "description": "Create a multi-stage Dockerfile for containerised deployment.",
            "assigned_agent": "devops_agent",
            "priority": "medium",
        })
        task_id += 1
        tasks.append({
            "id": task_id,
            "category": "deployment",
            "title": "Create CI/CD pipeline config",
            "description": "Generate GitHub Actions / deployment script for automated builds.",
            "assigned_agent": "devops_agent",
            "priority": "low",
        })
        task_id += 1

    return {
        "prompt": prompt,
        "intent": f"Build a software system: {prompt[:80]}",
        "categories": categories,
        "task_graph": tasks,
        "spawning_plan": {
            "dev_agent": "backend" in categories,
            "devops_agent": "deployment" in categories,
            "doctor_agent": True,  # always audits
        },
    }


def _gemini_decomposition(prompt: str) -> dict[str, Any]:
    """Call Google Gemini API for intelligent prompt analysis."""
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-pro:generateContent?key={_GEMINI_KEY}"
    )
    system_instruction = (
        "You are an AI engineering architect. Given a user prompt, return ONLY "
        "valid JSON with keys: intent (string), categories (list of strings from "
        "[architecture, backend, deployment]), task_graph (list of objects with "
        "id, category, title, description, assigned_agent, priority)."
    )
    payload = {
        "contents": [{"parts": [{"text": f"{system_instruction}\n\nUser prompt: {prompt}"}]}],
    }
    try:
        resp = _req.post(url, json=payload, timeout=30)  # type: ignore[union-attr]
        resp.raise_for_status()
        text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        # Strip markdown fences if present
        text = re.sub(r"```json\s*", "", text)
        text = re.sub(r"```\s*$", "", text)
        data = json.loads(text)
        data["prompt"] = prompt
        data.setdefault("spawning_plan", {
            "dev_agent": True,
            "devops_agent": True,
            "doctor_agent": True,
        })
        return data
    except Exception:
        # Graceful fallback
        return _rule_based_decomposition(prompt)


# ── Public API ───────────────────────────────────────────────────────────────

def analyze(prompt: str) -> dict[str, Any]:
    """
    Main entry point for the Parent Agent.

    Returns a structured JSON-serialisable dict containing:
      - prompt, intent, categories
      - task_graph (list of task dicts)
      - spawning_plan
      - metadata (timestamp, engine used)
    """
    if _GEMINI_AVAILABLE:
        result = _gemini_decomposition(prompt)
        engine = "gemini"
    else:
        result = _rule_based_decomposition(prompt)
        engine = "rule-based"

    result["metadata"] = {
        "agent": "parent_agent",
        "engine": engine,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    return result

"""
SYNAPSE-X — Logs MCP Server
Stores and retrieves all agent outputs for observability and audit trails.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
import threading
import uuid


# ── Thread-safe in-memory log store ──────────────────────────────────────────
_lock = threading.Lock()
_logs: list[dict[str, Any]] = []


def store_log(
    agent: str,
    event: str,
    data: Any = None,
    level: str = "info",
) -> dict[str, Any]:
    """
    Store a structured log entry.

    Args:
        agent:  Name of the agent that produced the log.
        event:  Short event description.
        data:   Arbitrary payload (will be stored as-is).
        level:  Log severity — info / warning / error / debug.

    Returns:
        The stored log entry including its generated ID.
    """
    entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "agent": agent,
        "level": level,
        "event": event,
        "data": data,
    }
    with _lock:
        _logs.append(entry)
    return entry


def get_logs(
    agent: str | None = None,
    level: str | None = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    """
    Retrieve stored logs with optional filtering.

    Args:
        agent:  Filter by agent name.
        level:  Filter by log level.
        limit:  Max number of entries to return (newest first).

    Returns:
        List of matching log entries.
    """
    with _lock:
        results = list(_logs)

    if agent:
        results = [r for r in results if r["agent"] == agent]
    if level:
        results = [r for r in results if r["level"] == level]

    # Newest first
    results.sort(key=lambda x: x["timestamp"], reverse=True)
    return results[:limit]


def clear_logs() -> dict[str, Any]:
    """Clear all stored logs (useful for testing)."""
    with _lock:
        count = len(_logs)
        _logs.clear()
    return {"cleared": count}

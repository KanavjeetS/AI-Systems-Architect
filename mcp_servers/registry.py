"""
SYNAPSE-X — MCP Server Registry
Central registry of all MCP tool-servers, their connection status,
capabilities, and activity simulation for demo mode.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


# ── Live Registry ────────────────────────────────────────────────────────────
MCP_SERVERS: dict[str, dict[str, Any]] = {
    "git_mcp": {
        "name": "Git MCP",
        "status": "connected",
        "description": "Repository management",
        "capabilities": ["create_repo", "push_code", "list_commits"],
        "icon": "🐙",
        "invocations": 0,
        "last_used": None,
    },
    "logs_mcp": {
        "name": "Logs MCP",
        "status": "active",
        "description": "Execution observability",
        "capabilities": ["store_log", "get_logs", "clear_logs"],
        "icon": "📊",
        "invocations": 0,
        "last_used": None,
    },
    "deployment_mcp": {
        "name": "Deployment MCP",
        "status": "running",
        "description": "Infrastructure orchestration",
        "capabilities": ["provision_container", "deploy_service", "health_check"],
        "icon": "🚀",
        "invocations": 0,
        "last_used": None,
    },
    "healing_mcp": {
        "name": "Healing MCP",
        "status": "active",
        "description": "Code audit & vulnerability patching",
        "capabilities": ["audit_code", "apply_patch", "report_vulnerabilities"],
        "icon": "🩺",
        "invocations": 0,
        "last_used": None,
    },
}


def record_invocation(server_id: str) -> None:
    """Increment invocation count and update timestamp for an MCP server."""
    if server_id in MCP_SERVERS:
        MCP_SERVERS[server_id]["invocations"] += 1
        MCP_SERVERS[server_id]["last_used"] = datetime.now(timezone.utc).isoformat()


def get_registry_snapshot() -> dict[str, dict[str, Any]]:
    """Return a point-in-time snapshot of all MCP server statuses."""
    return {k: dict(v) for k, v in MCP_SERVERS.items()}


# ── Demo / Simulation Mode ──────────────────────────────────────────────────

def simulate_mcp_activity() -> list[str]:
    """
    Produce a list of simulated MCP activity strings.
    Used when live APIs are offline or for demo recordings.
    """
    return [
        "🐙 Git MCP: Repository initialized → synapse-x-org/project",
        "📊 Logs MCP: Execution metrics stored (12 events)",
        "🚀 Deployment MCP: Container launched on port 8000",
        "🩺 Healing MCP: 3 vulnerabilities patched automatically",
    ]

"""
SYNAPSE-X — GitHub MCP Server (Mock)
Simulates GitHub repository operations for the orchestration pipeline.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
import uuid


# ── In-memory mock store ─────────────────────────────────────────────────────
_repos: dict[str, dict[str, Any]] = {}
_commits: dict[str, list[dict[str, Any]]] = {}


def create_repo(name: str, description: str = "") -> dict[str, Any]:
    """Simulate creating a GitHub repository."""
    repo_id = str(uuid.uuid4())[:8]
    repo = {
        "id": repo_id,
        "name": name,
        "full_name": f"synapse-x-org/{name}",
        "description": description,
        "html_url": f"https://github.com/synapse-x-org/{name}",
        "clone_url": f"https://github.com/synapse-x-org/{name}.git",
        "private": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "created",
    }
    _repos[name] = repo
    _commits[name] = []
    return repo


def push_code(repo_name: str, files: dict[str, str], message: str = "Initial commit") -> dict[str, Any]:
    """Simulate pushing code to a repository."""
    if repo_name not in _repos:
        create_repo(repo_name, "Auto-created by SYNAPSE-X")

    commit_sha = uuid.uuid4().hex[:7]
    commit = {
        "sha": commit_sha,
        "message": message,
        "files_changed": list(files.keys()),
        "additions": sum(len(v.split("\n")) for v in files.values()),
        "deletions": 0,
        "author": "synapse-x-bot",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    _commits[repo_name].append(commit)
    return {
        "status": "pushed",
        "commit": commit,
        "repo_url": _repos[repo_name]["html_url"],
    }


def list_commits(repo_name: str) -> list[dict[str, Any]]:
    """Simulate listing commits for a repository."""
    return _commits.get(repo_name, [])

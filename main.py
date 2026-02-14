"""
SYNAPSE-X — FastAPI Control Plane
Exposes the orchestration pipeline as a REST API with a visual dashboard
and MCP visibility endpoints.
"""

from __future__ import annotations

import sys
import os
from pathlib import Path

# Ensure project root is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env before anything else touches env vars
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent / ".env")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Any

from orchestration.agent_router import run_pipeline
from mcp_servers.logs_mcp import get_logs
from mcp_servers.registry import get_registry_snapshot, simulate_mcp_activity

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="SYNAPSE-X",
    description=(
        "🧬 **Self-Organizing AI Engineering Organism (MVP)**\n\n"
        "Hierarchical multi-agent system with parent cognition, "
        "dynamic child spawning, doctor healing, MCP integrations, "
        "and tree-growth execution visualization."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files ─────────────────────────────────────────────────────────────
STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# ── Schemas ──────────────────────────────────────────────────────────────────
class BuildRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=3,
        description="Natural-language description of the system to build.",
        json_schema_extra={"example": "Build a todo app with user authentication"},
    )


class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "SYNAPSE-X"
    version: str = "0.1.0"


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def dashboard():
    """Serve the SYNAPSE-X visual dashboard."""
    index_path = STATIC_DIR / "index.html"
    return HTMLResponse(content=index_path.read_text(encoding="utf-8"))


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Health check — confirms the SYNAPSE-X control plane is running."""
    return HealthResponse()


@app.get("/mcp/status", tags=["MCP Visibility"])
async def get_mcp_status() -> dict[str, dict[str, Any]]:
    """
    📡 **Live MCP Server Registry**

    Returns current status, capabilities, and invocation counts
    for all registered MCP tool-servers.
    """
    return get_registry_snapshot()


@app.get("/mcp/simulate", tags=["MCP Visibility"])
async def get_mcp_simulation() -> list[str]:
    """
    🎭 **Demo Visibility Mode**

    Returns simulated MCP activity strings for demo recordings
    when live APIs are offline.
    """
    return simulate_mcp_activity()


@app.post("/build", tags=["Pipeline"])
async def build(request: BuildRequest) -> dict[str, Any]:
    """
    🚀 **Execute the full SYNAPSE-X orchestration pipeline.**

    Flow: Parent Agent → Dev Agent → DevOps Agent → Doctor Agent → GitHub Push → Logs

    Returns a unified JSON response containing outputs from every pipeline stage,
    plus `mcp_activity` showing all MCP tool invocations.
    """
    try:
        result = run_pipeline(request.prompt)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/logs", tags=["Observability"])
async def fetch_logs(
    agent: str | None = None,
    level: str | None = None,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """Retrieve pipeline execution logs with optional filtering."""
    return get_logs(agent=agent, level=level, limit=limit)

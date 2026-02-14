"""
SYNAPSE-X — Orchestration Router
Central pipeline that coordinates the full agent execution flow:
  Parent → Dev → DevOps → Doctor → Logs → Unified JSON Response
  With full MCP tool-call visibility at every stage.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from agents import parent_agent, dev_agent, devops_agent, doctor_agent
from mcp_servers import github_mcp, logs_mcp
from mcp_servers.registry import record_invocation, simulate_mcp_activity


def run_pipeline(prompt: str) -> dict[str, Any]:
    """
    Execute the full SYNAPSE-X orchestration pipeline.

    Flow:
        1. Parent agent analyses the prompt
        2. Dev agent generates backend code
        3. DevOps agent generates deployment artifacts
        4. Doctor agent audits and heals
        5. Results pushed to mock GitHub
        6. Everything logged via Logs MCP
        7. MCP activity tracked across all stages

    Args:
        prompt: The user's natural-language build request.

    Returns:
        Unified JSON response with all pipeline stage outputs + mcp_activity.
    """
    pipeline_start = datetime.now(timezone.utc)
    mcp_activity: list[str] = []

    # ── Stage 1: Parent Agent ────────────────────────────────────────────
    record_invocation("logs_mcp")
    logs_mcp.store_log("parent_agent", "pipeline_start", {"prompt": prompt})
    logs_mcp.store_log("logs_mcp", "mcp_tool_call", {
        "mcp_tool": "Logs MCP", "action": "Pipeline telemetry initialized",
    })
    mcp_activity.append("📊 Logs MCP: Pipeline telemetry initialized")

    parent_result = parent_agent.analyze(prompt)

    record_invocation("logs_mcp")
    logs_mcp.store_log("parent_agent", "analysis_complete", {
        "categories": parent_result.get("categories"),
        "task_count": len(parent_result.get("task_graph", [])),
    })
    logs_mcp.store_log("logs_mcp", "mcp_tool_call", {
        "mcp_tool": "Logs MCP", "action": "Parent Agent analysis stored",
    })
    mcp_activity.append("📊 Logs MCP: Parent Agent analysis stored")

    task_graph = parent_result.get("task_graph", [])
    spawning_plan = parent_result.get("spawning_plan", {})

    # ── Stage 2: Developer Agent ─────────────────────────────────────────
    dev_result: dict[str, Any] = {"agent": "dev_agent", "skipped": True}
    if spawning_plan.get("dev_agent", True):
        record_invocation("logs_mcp")
        logs_mcp.store_log("dev_agent", "spawned")
        dev_result = dev_agent.generate(prompt, task_graph)
        logs_mcp.store_log("dev_agent", "generation_complete", {
            "endpoints": dev_result["status"]["endpoints_created"],
        })
        logs_mcp.store_log("logs_mcp", "mcp_tool_call", {
            "mcp_tool": "Logs MCP", "action": "Dev Agent execution trace stored",
        })
        mcp_activity.append("📊 Logs MCP: Dev Agent execution trace stored")

    # ── Stage 3: DevOps Agent ────────────────────────────────────────────
    devops_result: dict[str, Any] = {"agent": "devops_agent", "skipped": True}
    if spawning_plan.get("devops_agent", True):
        record_invocation("logs_mcp")
        logs_mcp.store_log("devops_agent", "spawned")
        devops_result = devops_agent.generate(prompt, task_graph)
        logs_mcp.store_log("devops_agent", "generation_complete", {
            "files": devops_result["status"]["files_generated"],
        })

        # Deployment MCP invocation
        record_invocation("deployment_mcp")
        logs_mcp.store_log("deployment_mcp", "mcp_tool_call", {
            "mcp_tool": "Deployment MCP",
            "action": "Infrastructure provisioned (Dockerfile + CI/CD)",
        })
        mcp_activity.append("🚀 Deployment MCP: Infrastructure provisioned")
        mcp_activity.append("📊 Logs MCP: DevOps Agent execution trace stored")

    # ── Stage 4: Doctor Agent ────────────────────────────────────────────
    doctor_result: dict[str, Any] = {"agent": "doctor_agent", "skipped": True}
    if spawning_plan.get("doctor_agent", True) and not dev_result.get("skipped"):
        record_invocation("logs_mcp")
        record_invocation("healing_mcp")
        logs_mcp.store_log("doctor_agent", "audit_start")
        doctor_result = doctor_agent.audit_and_heal(dev_result)
        logs_mcp.store_log("doctor_agent", "healing_complete", {
            "issues_found": doctor_result["stats"]["issues_found"],
            "issues_healed": doctor_result["stats"]["issues_healed"],
        })

        # Healing MCP tool call log
        logs_mcp.store_log("healing_mcp", "mcp_tool_call", {
            "mcp_tool": "Healing MCP",
            "action": "Code vulnerabilities patched",
            "issues_healed": doctor_result["stats"]["issues_healed"],
        })
        mcp_activity.append(
            f"🩺 Healing MCP: {doctor_result['stats']['issues_healed']} vulnerabilities patched"
        )
        mcp_activity.append("📊 Logs MCP: Doctor Agent healing trace stored")

    # ── Stage 5: Mock GitHub Push ────────────────────────────────────────
    repo_name = prompt.split()[1] if len(prompt.split()) > 1 else "synapse-project"
    repo_name = "".join(c for c in repo_name if c.isalnum() or c == "-").lower() or "synapse-project"

    record_invocation("git_mcp")
    github_result = github_mcp.create_repo(repo_name, f"Generated from: {prompt[:80]}")
    logs_mcp.store_log("git_mcp", "mcp_tool_call", {
        "mcp_tool": "Git MCP", "action": "Repository created",
    })
    mcp_activity.append(f"🐙 Git MCP: Repository created → synapse-x-org/{repo_name}")

    push_files: dict[str, str] = {}
    if not dev_result.get("skipped"):
        code_to_push = doctor_result.get("healed_code") or dev_result.get("service_code", "")
        push_files["main.py"] = code_to_push
    if not devops_result.get("skipped"):
        push_files["Dockerfile"] = devops_result.get("dockerfile", "")
        push_files["deploy.sh"] = devops_result.get("deployment_script", "")
        push_files[".github/workflows/ci.yml"] = devops_result.get("ci_config", "")

    record_invocation("git_mcp")
    push_result = github_mcp.push_code(repo_name, push_files, "feat: initial scaffold by SYNAPSE-X")
    logs_mcp.store_log("git_mcp", "mcp_tool_call", {
        "mcp_tool": "Git MCP",
        "action": f"Code pushed — commit {push_result['commit']['sha']}",
    })
    mcp_activity.append(f"🐙 Git MCP: Code pushed — {push_result['commit']['sha']}")

    # ── Stage 6: Final log ───────────────────────────────────────────────
    pipeline_end = datetime.now(timezone.utc)
    duration = (pipeline_end - pipeline_start).total_seconds()
    record_invocation("logs_mcp")
    logs_mcp.store_log("orchestrator", "pipeline_complete", {"duration_seconds": duration})
    logs_mcp.store_log("logs_mcp", "mcp_tool_call", {
        "mcp_tool": "Logs MCP",
        "action": f"Full execution trace stored ({len(mcp_activity)} MCP invocations)",
    })
    mcp_activity.append(f"📊 Logs MCP: Full execution trace stored ({len(mcp_activity)} events)")

    # ── Unified Response ─────────────────────────────────────────────────
    return {
        "pipeline": "SYNAPSE-X Orchestration Pipeline",
        "prompt": prompt,
        "duration_seconds": round(duration, 3),
        "stages": {
            "1_parent_analysis": parent_result,
            "2_dev_agent": dev_result,
            "3_devops_agent": devops_result,
            "4_doctor_healing": doctor_result,
            "5_github_push": {
                "repo": github_result,
                "push": push_result,
            },
        },
        "mcp_activity": mcp_activity,
        "mcp_simulation": simulate_mcp_activity(),
        "logs": logs_mcp.get_logs(limit=30),
        "metadata": {
            "completed_at": pipeline_end.isoformat(),
            "engine": parent_result.get("metadata", {}).get("engine", "unknown"),
        },
    }

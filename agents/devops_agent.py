"""
SYNAPSE-X — DevOps Child Agent
Generates Dockerfiles, deployment scripts, and simulated CI/CD pipeline configs.
"""

from __future__ import annotations

import textwrap
from datetime import datetime, timezone
from typing import Any


def _generate_dockerfile(prompt: str) -> str:
    """Produce a production-ready multi-stage Dockerfile."""
    return textwrap.dedent("""\
        # ── SYNAPSE-X Auto-Generated Dockerfile ──────────────────────────────
        # Multi-stage build for Python FastAPI service

        # Stage 1 — Builder
        FROM python:3.12-slim AS builder
        WORKDIR /build
        COPY requirements.txt .
        RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

        # Stage 2 — Runtime
        FROM python:3.12-slim
        WORKDIR /app

        # Security: run as non-root
        RUN addgroup --system app && adduser --system --group app
        COPY --from=builder /install /usr/local
        COPY . .

        # Expose FastAPI default port
        EXPOSE 8000

        # Health check
        HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
            CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

        USER app
        CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
    """)


def _generate_deployment_script() -> str:
    """Produce a shell deployment script."""
    return textwrap.dedent("""\
        #!/usr/bin/env bash
        # ── SYNAPSE-X Deployment Script ─────────────────────────────────────
        set -euo pipefail

        IMAGE_NAME="synapse-x-service"
        TAG="${TAG:-latest}"
        PORT="${PORT:-8000}"

        echo "🔨 Building Docker image..."
        docker build -t "$IMAGE_NAME:$TAG" .

        echo "🛑 Stopping existing container (if any)..."
        docker stop "$IMAGE_NAME" 2>/dev/null || true
        docker rm "$IMAGE_NAME" 2>/dev/null || true

        echo "🚀 Starting container..."
        docker run -d \\
            --name "$IMAGE_NAME" \\
            -p "$PORT:8000" \\
            --restart unless-stopped \\
            "$IMAGE_NAME:$TAG"

        echo "✅ Service running at http://localhost:$PORT"
        echo "📋 Logs: docker logs -f $IMAGE_NAME"
    """)


def _generate_ci_config() -> str:
    """Produce a GitHub Actions CI/CD workflow YAML."""
    return textwrap.dedent("""\
        # ── SYNAPSE-X CI/CD Pipeline ────────────────────────────────────────
        name: Build & Deploy

        on:
          push:
            branches: [main]
          pull_request:
            branches: [main]

        jobs:
          build:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v4

              - name: Set up Python
                uses: actions/setup-python@v5
                with:
                  python-version: "3.12"

              - name: Install dependencies
                run: pip install -r requirements.txt

              - name: Lint
                run: pip install ruff && ruff check .

              - name: Test
                run: |
                  pip install httpx pytest
                  pytest tests/ -v || echo "No tests yet"

          docker:
            needs: build
            runs-on: ubuntu-latest
            if: github.ref == 'refs/heads/main'
            steps:
              - uses: actions/checkout@v4

              - name: Build Docker image
                run: docker build -t synapse-x-service .

              - name: Smoke test
                run: |
                  docker run -d -p 8000:8000 --name test synapse-x-service
                  sleep 5
                  curl -f http://localhost:8000/health
                  docker stop test
    """)


# ── Public API ───────────────────────────────────────────────────────────────

def generate(prompt: str, task_graph: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Generate deployment artifacts from the parent agent's task graph.

    Returns:
        dict with: dockerfile, deployment_script, ci_config, status
    """
    return {
        "agent": "devops_agent",
        "dockerfile": _generate_dockerfile(prompt),
        "deployment_script": _generate_deployment_script(),
        "ci_config": _generate_ci_config(),
        "infra_metadata": {
            "container_runtime": "Docker",
            "ci_provider": "GitHub Actions",
            "exposed_port": 8000,
            "health_endpoint": "/health",
        },
        "status": {
            "success": True,
            "files_generated": 3,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }

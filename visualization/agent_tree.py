"""
SYNAPSE-X — Agent Tree Visualization Engine (v2 — MCP Visibility)
Renders a directed graph showing the full agent + MCP execution flow:
  Seed Prompt → Parent Agent (trunk) → Child Agents (branches) → Doctor (canopy) → MCP Servers

Uses NetworkX for the graph model and Matplotlib for rendering.
Can be run standalone: python visualization/agent_tree.py
"""

from __future__ import annotations

import matplotlib
matplotlib.use("Agg")  # Non-interactive backend (works headless)

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import networkx as nx
from pathlib import Path


def build_agent_graph() -> nx.DiGraph:
    """Create the directed execution flow graph with MCP nodes."""
    G = nx.DiGraph()

    # Nodes with metadata
    nodes = [
        ("🌱 User Prompt",      {"layer": 0, "role": "seed"}),
        ("🧠 Parent Agent",     {"layer": 1, "role": "trunk"}),
        ("💻 Dev Agent",        {"layer": 2, "role": "branch"}),
        ("🚀 DevOps Agent",     {"layer": 2, "role": "branch"}),
        ("🩺 Doctor Agent",     {"layer": 3, "role": "canopy"}),
        # MCP Servers
        ("📊 Logs MCP",         {"layer": 4, "role": "mcp"}),
        ("🐙 Git MCP",          {"layer": 4, "role": "mcp"}),
        ("☁️ Deployment MCP",   {"layer": 4, "role": "mcp"}),
        ("💉 Healing MCP",      {"layer": 5, "role": "mcp"}),
    ]
    G.add_nodes_from(nodes)

    # Edges — execution flow + MCP tool invocations
    edges = [
        # Core agent flow
        ("🌱 User Prompt",    "🧠 Parent Agent",    {"label": "ingests"}),
        ("🧠 Parent Agent",   "💻 Dev Agent",       {"label": "spawns"}),
        ("🧠 Parent Agent",   "🚀 DevOps Agent",    {"label": "spawns"}),
        ("💻 Dev Agent",      "🩺 Doctor Agent",     {"label": "audits"}),
        ("🚀 DevOps Agent",   "🩺 Doctor Agent",     {"label": "audits"}),

        # Agent → MCP Tool Invocations
        ("🧠 Parent Agent",   "📊 Logs MCP",        {"label": "telemetry"}),
        ("💻 Dev Agent",      "📊 Logs MCP",        {"label": "telemetry"}),
        ("🚀 DevOps Agent",   "☁️ Deployment MCP",  {"label": "tool invocation"}),
        ("🚀 DevOps Agent",   "📊 Logs MCP",        {"label": "telemetry"}),
        ("🩺 Doctor Agent",   "🐙 Git MCP",         {"label": "tool invocation"}),
        ("🩺 Doctor Agent",   "📊 Logs MCP",        {"label": "healing logs"}),
        ("🩺 Doctor Agent",   "💉 Healing MCP",     {"label": "tool invocation"}),
    ]
    G.add_edges_from(edges)

    return G


def render_tree(save_path: str | None = None, show: bool = False) -> str:
    """
    Render the agent + MCP tree as a styled Matplotlib figure.

    Args:
        save_path:  If provided, save PNG to this path. Otherwise auto-generates.
        show:       If True, display interactive window (requires display).

    Returns:
        Absolute path to the saved image.
    """
    G = build_agent_graph()

    # ── Layout: hierarchical top-down ────────────────────────────────────
    pos = {
        "🌱 User Prompt":      (0, 6),
        "🧠 Parent Agent":     (0, 5),
        "💻 Dev Agent":        (-2, 4),
        "🚀 DevOps Agent":     (2, 4),
        "🩺 Doctor Agent":     (0, 3),
        "📊 Logs MCP":         (-2.5, 1.5),
        "🐙 Git MCP":          (0, 1.5),
        "☁️ Deployment MCP":   (2.5, 1.5),
        "💉 Healing MCP":      (0, 0.3),
    }

    # ── Color map by role ────────────────────────────────────────────────
    role_colors = {
        "seed":   "#4CAF50",   # Green
        "trunk":  "#2196F3",   # Blue
        "branch": "#FF9800",   # Orange
        "canopy": "#E91E63",   # Pink
        "mcp":    "#9C27B0",   # Purple
    }
    node_colors = [
        role_colors.get(G.nodes[n].get("role", ""), "#757575")
        for n in G.nodes()
    ]

    # ── Categorise edges for styling ─────────────────────────────────────
    agent_edges = []
    mcp_edges = []
    for u, v, d in G.edges(data=True):
        label = d.get("label", "")
        if label in ("telemetry", "tool invocation", "healing logs"):
            mcp_edges.append((u, v))
        else:
            agent_edges.append((u, v))

    # ── Draw ─────────────────────────────────────────────────────────────
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    fig.patch.set_facecolor("#0D1117")
    ax.set_facecolor("#0D1117")

    # Agent edges (solid blue)
    nx.draw_networkx_edges(
        G, pos, edgelist=agent_edges, ax=ax,
        edge_color="#58A6FF",
        width=2.5,
        alpha=0.8,
        arrows=True,
        arrowsize=20,
        arrowstyle="-|>",
        connectionstyle="arc3,rad=0.08",
    )

    # MCP edges (dashed purple)
    nx.draw_networkx_edges(
        G, pos, edgelist=mcp_edges, ax=ax,
        edge_color="#CE93D8",
        width=1.8,
        alpha=0.6,
        arrows=True,
        arrowsize=16,
        arrowstyle="-|>",
        style="dashed",
        connectionstyle="arc3,rad=0.12",
    )

    # Edge labels
    edge_labels = nx.get_edge_attributes(G, "label")
    nx.draw_networkx_edge_labels(
        G, pos, edge_labels=edge_labels, ax=ax,
        font_size=7, font_color="#8B949E",
        bbox=dict(boxstyle="round,pad=0.15", facecolor="#161B22", edgecolor="none", alpha=0.85),
    )

    # Nodes
    nx.draw_networkx_nodes(
        G, pos, ax=ax,
        node_color=node_colors,
        node_size=3200,
        alpha=0.92,
        edgecolors="#C9D1D9",
        linewidths=2,
    )

    # Labels
    nx.draw_networkx_labels(
        G, pos, ax=ax,
        font_size=9,
        font_color="#F0F6FC",
        font_weight="bold",
    )

    # ── Title & legend ───────────────────────────────────────────────────
    ax.set_title(
        "SYNAPSE-X  •  Agent + MCP Execution Tree",
        fontsize=18,
        fontweight="bold",
        color="#F0F6FC",
        pad=20,
    )

    legend_handles = [
        mpatches.Patch(color=c, label=r.upper())
        for r, c in role_colors.items()
    ]
    legend_handles.append(
        mpatches.Patch(facecolor="none", edgecolor="#58A6FF", linewidth=2, label="Agent Flow")
    )
    legend_handles.append(
        mpatches.Patch(facecolor="none", edgecolor="#CE93D8", linewidth=2, linestyle="dashed", label="MCP Tool Call")
    )
    ax.legend(
        handles=legend_handles,
        loc="lower right",
        fontsize=8,
        facecolor="#161B22",
        edgecolor="#30363D",
        labelcolor="#C9D1D9",
    )

    ax.axis("off")
    plt.tight_layout()

    # ── Save ─────────────────────────────────────────────────────────────
    if save_path is None:
        out_dir = Path(__file__).resolve().parent.parent / "output"
        out_dir.mkdir(exist_ok=True)
        save_path = str(out_dir / "agent_tree.png")

    fig.savefig(save_path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())

    if show:
        plt.show()
    else:
        plt.close(fig)

    return save_path


# ── CLI entry point ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    path = render_tree(show=False)
    print(f"✅ Agent + MCP tree saved to: {path}")

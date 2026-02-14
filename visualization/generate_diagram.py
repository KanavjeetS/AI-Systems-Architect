import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, PathPatch
from matplotlib.patheffects import withStroke

# ── Config ────────────────────────────────────────────────────────────────────
plt.style.use('dark_background')
fig, ax = plt.subplots(figsize=(12, 10), facecolor='#050505')
ax.set_facecolor('#050505')
ax.set_xlim(0, 400)
ax.set_ylim(0, 400)
ax.invert_yaxis()
ax.axis('off')

# ── Colors ────────────────────────────────────────────────────────────────────
C_SEED = '#00FFFF'
C_ORCH = '#00AEFF'
C_DEV = '#00FFFF'
C_OPS = '#00AEFF'
C_DOC = '#00DE94'

# ── Styles ────────────────────────────────────────────────────────────────────
def glow(color, alpha=1.0):
    return [withStroke(linewidth=6, foreground=color, alpha=0.4*alpha),
            withStroke(linewidth=12, foreground=color, alpha=0.1*alpha)]

# ── Nodes ─────────────────────────────────────────────────────────────────────
# 1. User Prompt
ax.add_patch(Circle((200, 50), 20, color=C_SEED, fill=False, lw=2, path_effects=glow(C_SEED)))
ax.text(200, 50, "SEED", color='white', ha='center', va='center', weight='bold', fontsize=11)
ax.text(200, 80, "User Intent", color='#64748b', ha='center', va='center', fontsize=9, fontfamily='monospace')

# 2. Orchestrator
ax.add_patch(Rectangle((140, 130), 120, 50, color=C_ORCH, fill=False, lw=2, path_effects=glow(C_ORCH)))
ax.text(200, 155, "ORCHESTRATOR", color='white', ha='center', va='center', weight='bold', fontsize=10)
ax.text(200, 190, "Parent Agent", color='#64748b', ha='center', va='center', fontsize=9, fontfamily='monospace')

# 3. Children
# Dev A
ax.add_patch(Circle((80, 270), 18, color=C_DEV, fill=False, lw=2, path_effects=glow(C_DEV)))
ax.text(80, 270, "DEV α", color='white', ha='center', va='center', weight='bold', fontsize=9)
ax.text(80, 300, "Frontend", color='#64748b', ha='center', va='center', fontsize=8, fontfamily='monospace')

# Dev B
ax.add_patch(Circle((200, 270), 18, color=C_DEV, fill=False, lw=2, path_effects=glow(C_DEV)))
ax.text(200, 270, "DEV β", color='white', ha='center', va='center', weight='bold', fontsize=9)
ax.text(200, 300, "Backend", color='#64748b', ha='center', va='center', fontsize=8, fontfamily='monospace')

# DevOps
ax.add_patch(Circle((320, 270), 18, color=C_OPS, fill=False, lw=2, path_effects=glow(C_OPS)))
ax.text(320, 270, "DEVOPS", color='white', ha='center', va='center', weight='bold', fontsize=9)
ax.text(320, 300, "Docker/CI", color='#64748b', ha='center', va='center', fontsize=8, fontfamily='monospace')

# 4. Doctor
ax.add_patch(Circle((200, 370), 28, color=C_DOC, fill=False, lw=3, path_effects=glow(C_DOC)))
ax.add_patch(Circle((200, 370), 40, color=C_DOC, fill=False, lw=1, ls='--', alpha=0.5))
ax.text(200, 370, "HEALER", color='white', ha='center', va='center', weight='bold', fontsize=12)
ax.text(290, 370, "Autonomic\nRepair", color=C_DOC, ha='left', va='center', fontsize=9, fontfamily='monospace', alpha=0.8)

# ── Connections ──────────────────────────────────────────────────────────────
def connect(p1, p2, color, style='-'):
    ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=color, lw=2, ls=style, path_effects=glow(color), zorder=0)

# Seed -> Branch
connect((200, 70), (200, 130), C_SEED)

# Orch -> Children
connect((180, 180), (80, 252), C_ORCH)
connect((200, 180), (200, 252), C_ORCH)
connect((220, 180), (320, 252), C_ORCH)

# Children -> Doc (Healing arc)
connect((80, 288), (175, 360), C_DOC, '--')
connect((200, 288), (200, 342), C_DOC, '--')
connect((320, 288), (225, 360), C_DOC, '--')

# Title
ax.text(20, 20, "SYNAPSE-X // ARCHITECTURE", color='white', fontsize=16, weight='bold', fontfamily='sans-serif', alpha=0.8)
ax.text(20, 35, "Self-Organizing Agent Mesh", color='#64748b', fontsize=10, fontfamily='monospace')

plt.savefig('visualization/agent_tree_diagram.png', dpi=300, bbox_inches='tight', pad_inches=0.1)
print("Diagram generated.")

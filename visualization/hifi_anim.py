import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import Circle, FancyArrowPatch, Rectangle
from matplotlib.patheffects import withStroke

# ── Config ────────────────────────────────────────────────────────────────────
plt.style.use('dark_background')
fig, ax = plt.subplots(figsize=(10, 8), facecolor='#050505')
ax.set_facecolor('#050505')
ax.set_xlim(0, 400)
ax.set_ylim(0, 400)
ax.invert_yaxis() # Top-down flow
ax.axis('off')

# ── Colors ────────────────────────────────────────────────────────────────────
C_SEED = '#00FFFF'
C_ORCH = '#00AEFF'
C_DEV = '#00FFFF'
C_OPS = '#00AEFF'
C_DOC = '#00DE94'
C_BG = '#050505'

# ── Node Positions ────────────────────────────────────────────────────────────
POS = {
    'seed':   (200, 50),
    'orch':   (200, 150),
    'dev_a':  (100, 270),
    'dev_b':  (200, 270),
    'ops':    (300, 270),
    'doc':    (200, 370)
}

# ── State Objects ─────────────────────────────────────────────────────────────
elements = {}

def glow(color, alpha=1):
    return [withStroke(linewidth=5, foreground=color, alpha=0.3*alpha)]

# Init Seeds
elements['seed_pulse'] = Circle(POS['seed'], 0, color=C_SEED, alpha=0.2)
elements['seed'] = Circle(POS['seed'], 20, color=C_SEED, fill=False, lw=2)
elements['seed_txt'] = ax.text(200, 50, "SEED", color='white', ha='center', va='center', fontsize=10, fontfamily='monospace', weight='bold')

# Init Orch
elements['orch_box'] = Rectangle((150, 130), 100, 40, color=C_ORCH, fill=False, lw=2, alpha=0)
elements['orch_txt'] = ax.text(200, 150, "ORCHESTRATOR", color='white', ha='center', va='center', fontsize=9, alpha=0, fontfamily='monospace')

# Init Parallel
elements['dev_a'] = Circle(POS['dev_a'], 15, color=C_DEV, fill=False, lw=2, alpha=0)
elements['dev_b'] = Circle(POS['dev_b'], 15, color=C_DEV, fill=False, lw=2, alpha=0)
elements['ops'] = Circle(POS['ops'], 15, color=C_OPS, fill=False, lw=2, alpha=0)

elements['dev_a_txt'] = ax.text(100, 300, "CODE GEN", color=C_DEV, ha='center', fontsize=8, alpha=0, fontfamily='monospace')
elements['dev_b_txt'] = ax.text(200, 300, "LOGIC", color=C_DEV, ha='center', fontsize=8, alpha=0, fontfamily='monospace')
elements['ops_txt'] = ax.text(300, 300, "DOCKER", color=C_OPS, ha='center', fontsize=8, alpha=0, fontfamily='monospace')

# Init Doc
elements['doc'] = Circle(POS['doc'], 25, color=C_DOC, fill=False, lw=3, alpha=0)
elements['doc_ring'] = Circle(POS['doc'], 35, color=C_DOC, fill=False, lw=1, ls='--', alpha=0)
elements['doc_txt'] = ax.text(200, 370, "HEALER", color='white', ha='center', va='center', fontsize=10, alpha=0, fontfamily='monospace', weight='bold')

# Init Links
lines = {}
def add_line(k, p1, p2, color):
    lines[k] = ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=color, lw=2, alpha=0)[0]

add_line('s-o', (200, 70), (200, 130), C_SEED)
add_line('o-da', (180, 170), (100, 255), C_ORCH)
add_line('o-db', (200, 170), (200, 255), C_ORCH)
add_line('o-ops', (220, 170), (300, 255), C_ORCH)
add_line('da-doc', (100, 285), (180, 355), C_DOC)
add_line('db-doc', (200, 285), (200, 345), C_DOC)
add_line('ops-doc', (300, 285), (220, 355), C_DOC)

# Add all to axes
for k, v in elements.items():
    if isinstance(v, plt.Artist): ax.add_artist(v)

# ── Animation ─────────────────────────────────────────────────────────────────
def update(frame):
    # Phase 0: Seed Creation (0-20)
    if frame < 20:
        r = frame 
        elements['seed_pulse'].set_radius(r)
        elements['seed_pulse'].set_alpha(max(0, 0.5 - frame/40))
        if frame > 10: elements['seed'].set_path_effects(glow(C_SEED))

    # Phase 1: Logic Flows to Orch (20-40)
    if 20 <= frame < 40:
        f = (frame-20)/20
        lines['s-o'].set_alpha(f)
        lines['s-o'].set_path_effects(glow(C_SEED, f))

    # Phase 2: Orch Spawns (40-60)
    if 40 <= frame < 60:
        f = (frame-40)/20
        elements['orch_box'].set_alpha(f)
        elements['orch_txt'].set_alpha(f)
        elements['orch_box'].set_path_effects(glow(C_ORCH, f))

    # Phase 3: Parallel Bifurcation (60-80)
    if 60 <= frame < 80:
        f = (frame-60)/20
        lines['o-da'].set_alpha(f)
        lines['o-db'].set_alpha(f)
        lines['o-ops'].set_alpha(f)
        
        elements['dev_a'].set_alpha(f)
        elements['dev_b'].set_alpha(f)
        elements['ops'].set_alpha(f)
        elements['dev_a_txt'].set_alpha(f)
        elements['dev_b_txt'].set_alpha(f)
        elements['ops_txt'].set_alpha(f)

    # Phase 4: Healing Convergence (80-110)
    if 80 <= frame < 110:
        f = (frame-80)/30
        lines['da-doc'].set_alpha(f * 0.5)
        lines['db-doc'].set_alpha(f * 0.5)
        lines['ops-doc'].set_alpha(f * 0.5)
        lines['da-doc'].set_linestyle('--')
        
        elements['doc'].set_alpha(f)
        elements['doc_ring'].set_alpha(f)
        elements['doc_txt'].set_alpha(f)
        
        # Ring rotation simulation
        elements['doc_ring'].set_linestyle((0, (5, 5)))
        elements['doc'].set_path_effects(glow(C_DOC, f))

    # Phase 5: Pulse & Stabilize (110-140)
    if frame >= 110:
        pulse = np.sin((frame-110)/5) * 0.5 + 0.5
        elements['doc_ring'].set_radius(35 + pulse*2)
        elements['doc_txt'].set_color('white' if pulse > 0.5 else '#E0FFE0')

    return []

ani = animation.FuncAnimation(fig, update, frames=140, interval=40, blit=True)
ani.save('agent_workflow.gif', writer='pillow', fps=25)
print("Hifi Animation saved.")

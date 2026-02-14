import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import Circle, Rectangle, PathPatch
from matplotlib.path import Path

# Setup figure
fig, ax = plt.subplots(figsize=(8, 8), facecolor='black')
ax.set_facecolor('black')
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

# Nodes data
nodes = {
    'seed': {'pos': (50, 90), 'color': '#00FFFF', 'label': 'SEED'},
    'orch': {'pos': (50, 70), 'color': '#00AEFF', 'label': 'ORCHESTRATOR'},
    'dev_a': {'pos': (20, 40), 'color': '#00FFFF', 'label': 'DEV α'},
    'dev_b': {'pos': (50, 40), 'color': '#00FFFF', 'label': 'DEV β'},
    'ops': {'pos': (80, 40), 'color': '#00AEFF', 'label': 'DEVOPS'},
    'doctor': {'pos': (50, 15), 'color': '#00DE94', 'label': 'DR. SYNAPSE'}
}

# Drawing elements
elements = []

def draw_node(pos, color, radius=3, alpha=0):
    c = Circle(pos, radius, color=color, alpha=alpha)
    ax.add_patch(c)
    return c

def draw_line(p1, p2, color, alpha=0):
    l, = ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=color, lw=2, alpha=alpha)
    return l

# Init objects hidden
seed_obj = draw_node(nodes['seed']['pos'], nodes['seed']['color'])
orch_obj = draw_node(nodes['orch']['pos'], nodes['orch']['color'], radius=5)
dev_a_obj = draw_node(nodes['dev_a']['pos'], nodes['dev_a']['color'])
dev_b_obj = draw_node(nodes['dev_b']['pos'], nodes['dev_b']['color'])
ops_obj = draw_node(nodes['ops']['pos'], nodes['ops']['color'])
doc_obj = draw_node(nodes['doctor']['pos'], nodes['doctor']['color'], radius=6)

line1 = draw_line(nodes['seed']['pos'], nodes['orch']['pos'], '#00FFFF')
line2a = draw_line(nodes['orch']['pos'], nodes['dev_a']['pos'], '#00AEFF')
line2b = draw_line(nodes['orch']['pos'], nodes['dev_b']['pos'], '#00AEFF')
line2c = draw_line(nodes['orch']['pos'], nodes['ops']['pos'], '#00AEFF')
line3a = draw_line(nodes['dev_a']['pos'], nodes['doctor']['pos'], '#00DE94')
line3b = draw_line(nodes['dev_b']['pos'], nodes['doctor']['pos'], '#00DE94')
line3c = draw_line(nodes['ops']['pos'], nodes['doctor']['pos'], '#00DE94')

txt_seed = ax.text(50, 95, "USER PROMPT", color="white", ha="center", alpha=0, fontfamily="monospace")
txt_orch = ax.text(50, 78, "PLANNING", color="#00AEFF", ha="center", alpha=0, fontfamily="monospace")
txt_doc = ax.text(50, 5, "SYSTEM HEALED", color="#00DE94", ha="center", alpha=0, fontfamily="monospace", fontsize=14, weight='bold')

def update(frame):
    # Phase 1: Seed
    if frame >= 5:
        seed_obj.set_alpha(min(1, (frame-5)/10))
        txt_seed.set_alpha(min(1, (frame-5)/10))
    
    # Phase 2: Orchestrator
    if frame >= 20:
        line1.set_alpha(min(1, (frame-20)/10))
    if frame >= 30:
        orch_obj.set_alpha(min(1, (frame-30)/10))
        txt_orch.set_alpha(min(1, (frame-30)/10))

    # Phase 3: Parallel Execution
    if frame >= 50:
        line2a.set_alpha(min(0.6, (frame-50)/10))
        line2b.set_alpha(min(0.6, (frame-50)/10))
        line2c.set_alpha(min(0.6, (frame-50)/10))
    if frame >= 60:
        dev_a_obj.set_alpha(min(1, (frame-60)/10))
        dev_b_obj.set_alpha(min(1, (frame-60)/10))
        ops_obj.set_alpha(min(1, (frame-60)/10))

    # Phase 4: Healing
    if frame >= 80:
        line3a.set_alpha(min(0.4, (frame-80)/10))
        line3b.set_alpha(min(0.4, (frame-80)/10))
        line3c.set_alpha(min(0.4, (frame-80)/10))
    if frame >= 90:
        doc_obj.set_alpha(min(1, (frame-90)/10))
        # Pulse effect
        if frame > 100:
            doc_obj.set_radius(6 + np.sin(frame/2))
    
    if frame >= 110:
        txt_doc.set_alpha(min(1, (frame-110)/10))

    return []

ani = animation.FuncAnimation(fig, update, frames=150, interval=50, blit=True)
ani.save('agent_workflow.gif', writer='pillow', fps=20)
print("Animation saved successfully.")

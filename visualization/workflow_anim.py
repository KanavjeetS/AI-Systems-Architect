from manim import *

class AgentFlowAnimation(Scene):
    def construct(self):
        # ── Setup ─────────────────────────────────────────────────────────────
        self.camera.background_color = "#000000"
        
        # Styles
        style_seed = {"fill_color": "#00FFFF", "fill_opacity": 1, "stroke_color": WHITE, "stroke_width": 2}
        style_parent = {"fill_color": "#00AEFF", "fill_opacity": 1, "stroke_color": WHITE, "stroke_width": 2}
        style_child_dev = {"fill_color": "#00FFFF", "fill_opacity": 0.3, "stroke_color": "#00FFFF", "stroke_width": 2} # Dev
        style_child_ops = {"fill_color": "#00AEFF", "fill_opacity": 0.3, "stroke_color": "#00AEFF", "stroke_width": 2} # DevOps
        style_doctor = {"fill_color": "#00DE94", "fill_opacity": 0.2, "stroke_color": "#00DE94", "stroke_width": 3}

        # ── Title Sequence ────────────────────────────────────────────────────
        title = Text("SYNAPSE-X", font="Orbitron", weight=BOLD).scale(1.5).set_color_by_gradient("#00AEFF", "#00FFFF")
        subtitle = Text("Autonomous Engineering Organism", font="Monospace", font_size=24).next_to(title, DOWN).set_color(GRAY)
        
        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(subtitle, shift=UP))
        self.wait(1)
        self.play(FadeOut(title), FadeOut(subtitle))

        # ── 1. The Seed ───────────────────────────────────────────────────────
        seed = Circle(radius=0.3, **style_seed).move_to(UP * 2.5)
        seed_label = Text("SEED", font="Orbitron", font_size=16).next_to(seed, UP)
        prompt_box = RoundedRectangle(corner_radius=0.1, height=0.6, width=4, color=WHITE).next_to(seed, RIGHT, buff=0.5)
        prompt_text = Text('"Build a scalable chat app"', font="Monospace", font_size=16).move_to(prompt_box)

        self.play(GrowFromCenter(seed), FadeIn(seed_label))
        self.play(Create(prompt_box), Write(prompt_text))
        self.wait(0.5)

        # Pulse effect
        self.play(seed.animate.scale(1.2).set_color("#FFFFFF"), run_time=0.2)
        self.play(seed.animate.scale(1/1.2).set_color("#00FFFF"), run_time=0.2)

        # ── 2. Orchestration ──────────────────────────────────────────────────
        orchestrator = Rectangle(height=0.8, width=2, **style_parent).move_to(UP * 1)
        orch_label = Text("ORCHESTRATOR", font="Orbitron", font_size=14).move_to(orchestrator)
        
        # Connection
        line1 = Line(seed.get_bottom(), orchestrator.get_top(), color="#00FFFF")
        self.play(Create(line1), FadeOut(prompt_box), FadeOut(prompt_text))
        self.play(GrowFromCenter(orchestrator), Write(orch_label))
        
        # Analysis scanning effect
        scan_line = Line(orchestrator.get_left(), orchestrator.get_right(), color=WHITE).set_opacity(0.5)
        self.play(MoveAlongPath(scan_line, Line(orchestrator.get_top(), orchestrator.get_bottom())), run_time=1)
        self.remove(scan_line)

        # ── 3. Parallel Agents ────────────────────────────────────────────────
        dev_a = Circle(radius=0.4, **style_child_dev).move_to(LEFT * 2 + DOWN * 1)
        dev_b = Circle(radius=0.4, **style_child_dev).move_to(DOWN * 1)
        ops = Circle(radius=0.4, **style_child_ops).move_to(RIGHT * 2 + DOWN * 1)

        dev_a_lbl = Text("DEV α", font="Monospace", font_size=12).next_to(dev_a, DOWN)
        dev_b_lbl = Text("DEV β", font="Monospace", font_size=12).next_to(dev_b, DOWN)
        ops_lbl = Text("DEVOPS", font="Monospace", font_size=12).next_to(ops, DOWN)

        lines = [
            Line(orchestrator.get_bottom(), dev_a.get_top(), color="#00AEFF"),
            Line(orchestrator.get_bottom(), dev_b.get_top(), color="#00AEFF"),
            Line(orchestrator.get_bottom(), ops.get_top(), color="#00AEFF")
        ]
        
        self.play(
            LaggedStart(
                AnimationGroup(Create(lines[0]), GrowFromCenter(dev_a), FadeIn(dev_a_lbl)),
                AnimationGroup(Create(lines[1]), GrowFromCenter(dev_b), FadeIn(dev_b_lbl)),
                AnimationGroup(Create(lines[2]), GrowFromCenter(ops), FadeIn(ops_lbl)),
                lag_ratio=0.3
            )
        )

        # Code gen effect (circles spinning/filling)
        self.play(
            dev_a.animate.set_fill(opacity=0.8),
            dev_b.animate.set_fill(opacity=0.8),
            ops.animate.set_fill(opacity=0.8),
            run_time=0.5
        )

        # ── 4. Healing Layer ──────────────────────────────────────────────────
        doctor = Circle(radius=0.6, **style_doctor).move_to(DOWN * 2.5)
        doc_orbit = Circle(radius=0.8, color="#00DE94", stroke_width=1).move_to(doctor).set_opacity(0.5)
        doc_lbl = Text("DR. SYNAPSE", font="Orbitron", font_size=14).move_to(doctor)

        # Gathering lines
        heal_lines = [
            Line(dev_a.get_bottom(), doctor.get_top(), color="#00DE94").set_stroke(dash_length=0.1),
            Line(dev_b.get_bottom(), doctor.get_top(), color="#00DE94").set_stroke(dash_length=0.1),
            Line(ops.get_bottom(), doctor.get_top(), color="#00DE94").set_stroke(dash_length=0.1)
        ]

        self.play(
            Create(doc_orbit),
            GrowFromCenter(doctor),
            Write(doc_lbl),
            *[Create(l) for l in heal_lines]
        )

        # Healing rotation
        self.play(Rotate(doc_orbit, angle=PI*2, run_time=2))
        
        # Patch applied text
        patch_text = Text("[PATCH APPLIED]", font="Monospace", font_size=16, color="#00FF52").next_to(doctor, RIGHT)
        self.play(Write(patch_text))
        self.wait(0.5)

        # ── 5. Final State ────────────────────────────────────────────────────
        final_group = VGroup(seed, seed_label, orchestrator, orch_label, dev_a, dev_b, ops, dev_a_lbl, dev_b_lbl, ops_lbl, doctor, doc_lbl, doc_orbit, line1, *lines, *heal_lines)
        
        self.play(
            final_group.animate.scale(0.8).shift(UP * 0.5),
            FadeOut(patch_text)
        )
        
        status = RoundedRectangle(corner_radius=0.2, width=4, height=0.8, color="#00FF52").move_to(DOWN * 3.2)
        status_text = Text("SYSTEM STABILIZED", font="Orbitron", font_size=20, color="#00FF52").move_to(status)
        
        self.play(Create(status), Write(status_text))
        self.wait(2)

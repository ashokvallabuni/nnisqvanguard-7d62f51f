import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  pulsePhase: number;
}

interface Pulse {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

interface CyberCircuitCanvasProps {
  className?: string;
  density?: "low" | "medium" | "high";
  interactive?: boolean;
}

export function CyberCircuitCanvas({
  className = "",
  density = "medium",
  interactive = true,
}: CyberCircuitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const isMobile = width < 768;
    const nodeCount = isMobile
      ? 18
      : density === "high"
      ? 45
      : density === "low"
      ? 24
      : 34;

    const maxDistance = isMobile ? 110 : 160;

    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 1.2,
        baseRadius: Math.random() * 1.8 + 1.2,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const pulses: Pulse[] = [];
    const spawnPulse = () => {
      if (nodes.length < 2) return;
      const fromNode = Math.floor(Math.random() * nodes.length);
      // Find a connected node within maxDistance
      const candidates: number[] = [];
      for (let j = 0; j < nodes.length; j++) {
        if (j === fromNode) continue;
        const dx = nodes[fromNode].x - nodes[j].x;
        const dy = nodes[fromNode].y - nodes[j].y;
        if (Math.hypot(dx, dy) < maxDistance) {
          candidates.push(j);
        }
      }
      if (candidates.length > 0) {
        const toNode = candidates[Math.floor(Math.random() * candidates.length)];
        pulses.push({
          fromNode,
          toNode,
          progress: 0,
          speed: 0.015 + Math.random() * 0.02,
        });
      }
    };

    let pulseTimer = 0;

    // Mouse pointer interaction
    const pointer = {
      x: -1000,
      y: -1000,
      radius: isMobile ? 0 : 180,
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive || isMobile) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      pointer.x = -1000;
      pointer.y = -1000;
    };

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });
    if (interactive && !isMobile) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Pulse generation timer
      pulseTimer += dt;
      if (pulseTimer > 0.45 && pulses.length < (isMobile ? 4 : 9)) {
        spawnPulse();
        pulseTimer = 0;
      }

      // Update & Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        // Bounce from boundaries
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Pointer attraction / reactivity
        if (pointer.x > 0) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const dist = Math.hypot(dx, dy);
          if (dist < pointer.radius) {
            const force = (1 - dist / pointer.radius) * 0.4;
            node.x += (dx / dist) * force;
            node.y += (dy / dist) * force;
            node.radius = node.baseRadius * (1 + force * 1.5);
          } else {
            node.radius = node.baseRadius;
          }
        }

        // Draw node glow
        node.pulsePhase += 0.03;
        const currentRadius = node.radius + Math.sin(node.pulsePhase) * 0.4;

        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 184, 255, 0.75)";
        ctx.shadowColor = "rgba(0, 184, 255, 0.9)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Connections (Circuit Traces)
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);

            // Optional 90-degree circuit dog-leg on desktop for cyber circuit aesthetic
            if (dist > 80 && i % 2 === 0) {
              const midX = (nodes[i].x + nodes[j].x) / 2;
              ctx.lineTo(midX, nodes[i].y);
              ctx.lineTo(midX, nodes[j].y);
            }
            ctx.lineTo(nodes[j].x, nodes[j].y);

            ctx.strokeStyle = `rgba(10, 124, 255, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      // Update & Draw Pulses (Electric packets)
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const start = nodes[pulse.fromNode];
        const end = nodes[pulse.toNode];
        if (!start || !end) {
          pulses.splice(p, 1);
          continue;
        }

        const px = start.x + (end.x - start.x) * pulse.progress;
        const py = start.y + (end.y - start.y) * pulse.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#00B8FF";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Pointer Spotlight Halo (if active)
      if (pointer.x > 0) {
        const grad = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          pointer.radius
        );
        grad.addColorStop(0, "rgba(0, 184, 255, 0.08)");
        grad.addColorStop(0.5, "rgba(10, 124, 255, 0.03)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, pointer.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (interactive && !isMobile) {
        window.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerleave", handlePointerLeave);
      }
    };
  }, [density, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}

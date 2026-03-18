import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Smooth lerp helper
function lerp(a, b, t) { return a + (b - a) * t; }

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map(x => x+x).join('') : c;
  if (!/^[0-9a-f]{6}$/i.test(full)) return [26, 143, 209];
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function ReactiveBackground({ activeSection, liveColor }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    // Current rendered values (lerped toward targets)
    mx: 0.5, my: 0.5,           // mouse position 0-1
    r: 26, g: 143, b: 209,      // current live color RGB
    tr: 26, tg: 143, tb: 209,   // target live color RGB
    intensity: 0,               // ripple intensity 0-1
    ripples: [],                // [{x,y,r,max,age}]
    particles: [],              // floating orbs
    scrollY: 0,
  });
  const rafRef = useRef(null);
  const lastColorRef = useRef(liveColor);

  // Init particles once
  useEffect(() => {
    const s = stateRef.current;
    s.particles = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      size: 0.18 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      speed: 0.0004 + Math.random() * 0.0004,
    }));
  }, []);

  // Mouse tracking
  useEffect(() => {
    const onMove = (e) => {
      stateRef.current.mx = e.clientX / window.innerWidth;
      stateRef.current.my = e.clientY / window.innerHeight;
    };
    const onScroll = () => {
      stateRef.current.scrollY = window.scrollY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Color interaction — ripple + target update
  useEffect(() => {
    const s = stateRef.current;
    const [tr, tg, tb] = hexToRgb(liveColor);
    s.tr = tr; s.tg = tg; s.tb = tb;

    if (liveColor !== lastColorRef.current) {
      lastColorRef.current = liveColor;
      // Add ripple at mouse position
      s.ripples.push({
        x: s.mx, y: s.my,
        r: 0,
        max: 0.7 + Math.random() * 0.3,
        age: 0,
        color: [tr, tg, tb],
      });
      // Boost intensity
      s.intensity = Math.min(1, s.intensity + 0.6);
    }
  }, [liveColor]);

  // Canvas draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const s = stateRef.current;

      // Lerp color toward target
      s.r = lerp(s.r, s.tr, 0.04);
      s.g = lerp(s.g, s.tg, 0.04);
      s.b = lerp(s.b, s.tb, 0.04);

      // Decay intensity
      s.intensity = lerp(s.intensity, 0, 0.025);

      // Clear
      ctx.clearRect(0, 0, W, H);

      // ── Base gradient (always dark, subtle) ──
      const base = ctx.createRadialGradient(W*0.5, H*0.45, 0, W*0.5, H*0.45, W*0.8);
      base.addColorStop(0, `rgba(${Math.round(s.r*0.06)},${Math.round(s.g*0.06)},${Math.round(s.b*0.06)},1)`);
      base.addColorStop(1, 'rgba(4,4,12,1)');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, W, H);

      // ── Mouse-following orb ──
      const mxPx = s.mx * W;
      const myPx = s.my * H;
      const mouseOrb = ctx.createRadialGradient(mxPx, myPx, 0, mxPx, myPx, W * 0.32);
      const intens = 0.06 + s.intensity * 0.1;
      mouseOrb.addColorStop(0, `rgba(${Math.round(s.r)},${Math.round(s.g)},${Math.round(s.b)},${intens})`);
      mouseOrb.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = mouseOrb;
      ctx.fillRect(0, 0, W, H);

      // ── Floating ambient particles ──
      const t = Date.now();
      s.particles.forEach(p => {
        p.x += p.vx + Math.sin(t * p.speed + p.phase) * 0.0001;
        p.y += p.vy + Math.cos(t * p.speed * 1.3 + p.phase) * 0.0001;
        // Wrap
        if (p.x < -p.size) p.x = 1 + p.size;
        if (p.x > 1+p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = 1 + p.size;
        if (p.y > 1+p.size) p.y = -p.size;

        const px = p.x * W, py = p.y * H;
        const pr = p.size * Math.min(W, H);
        const alpha = 0.022 + s.intensity * 0.025;
        const orb = ctx.createRadialGradient(px, py, 0, px, py, pr);
        orb.addColorStop(0, `rgba(${Math.round(s.r)},${Math.round(s.g)},${Math.round(s.b)},${alpha})`);
        orb.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = orb;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Ripples ──
      s.ripples = s.ripples.filter(rip => rip.age < 1);
      s.ripples.forEach(rip => {
        rip.age += 0.018;
        rip.r = rip.max * rip.age;
        const alpha = (1 - rip.age) * 0.12;
        const rx = rip.x * W, ry = rip.y * H, rr = rip.r * Math.min(W, H);
        const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, rr);
        g.addColorStop(0,   `rgba(${rip.color[0]},${rip.color[1]},${rip.color[2]},0)`);
        g.addColorStop(0.6, `rgba(${rip.color[0]},${rip.color[1]},${rip.color[2]},${alpha})`);
        g.addColorStop(1,   `rgba(${rip.color[0]},${rip.color[1]},${rip.color[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(rx, ry, rr, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Vignette ──
      const vig = ctx.createRadialGradient(W*0.5, H*0.5, H*0.2, W*0.5, H*0.5, W*0.85);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none', display: 'block',
      }}
    />
  );
}

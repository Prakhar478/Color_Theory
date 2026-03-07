import { useRef, useEffect, useState } from 'react';

const CANVAS_SIZE = 300;

const MIX_DATA = {
  primary: {
    title: 'The 3 Primary Colors',
    desc: 'Primary colors are the foundation of all color. They cannot be created by mixing. In RYB (art/design model): Red, Yellow, Blue. Drag the circles together to mix them live.',
    colors: [
      { name: 'Red', hex: '#EE1111' },
      { name: 'Yellow', hex: '#FFE600' },
      { name: 'Blue', hex: '#1155EE' },
    ],
  },
  secondary: {
    title: 'The 3 Secondary Colors',
    desc: 'Secondary colors are made by mixing two primaries equally. Red + Yellow = Orange. Yellow + Blue = Green. Blue + Red = Violet.',
    colors: [
      { name: 'Orange', hex: '#FF6600', from: 'Red + Yellow' },
      { name: 'Green', hex: '#22AA33', from: 'Yellow + Blue' },
      { name: 'Violet', hex: '#8822CC', from: 'Blue + Red' },
    ],
  },
  tertiary: {
    title: 'The 6 Tertiary Colors',
    desc: 'Tertiary colors fill the gaps — one primary mixed with one adjacent secondary. They give names like Red-Orange, Blue-Green, Yellow-Green.',
    colors: [
      { name: 'Red-Orange', hex: '#FF3300', from: 'Red+Orange' },
      { name: 'Yellow-Orange', hex: '#FFAA00', from: 'Yellow+Orange' },
      { name: 'Yellow-Green', hex: '#88CC00', from: 'Yellow+Green' },
      { name: 'Blue-Green', hex: '#008866', from: 'Blue+Green' },
      { name: 'Blue-Violet', hex: '#4433CC', from: 'Blue+Violet' },
      { name: 'Red-Violet', hex: '#CC1166', from: 'Red+Violet' },
    ],
  },
};

const MIX_TABLE = {
  'Red+Yellow': { name: 'Orange', hex: '#FF6600' },
  'Yellow+Red': { name: 'Orange', hex: '#FF6600' },
  'Yellow+Blue': { name: 'Green', hex: '#22AA33' },
  'Blue+Yellow': { name: 'Green', hex: '#22AA33' },
  'Red+Blue': { name: 'Violet', hex: '#8822CC' },
  'Blue+Red': { name: 'Violet', hex: '#8822CC' },
};

const INITIAL_CIRCLES = [
  { x: 150, y: 70, r: 44, color: '#EE1111', name: 'Red' },
  { x: 80, y: 210, r: 44, color: '#FFE600', name: 'Yellow' },
  { x: 220, y: 210, r: 44, color: '#1155EE', name: 'Blue' },
];

function circlesOverlap(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) < (a.r + b.r) * 0.72;
}

function drawPrimaryInteractive(ctx, circles) {
  ctx.clearRect(0, 0, 300, 300);
  ctx.fillStyle = '#13131d';
  ctx.fillRect(0, 0, 300, 300);

  const o01 = circlesOverlap(circles[0], circles[1]);
  const o12 = circlesOverlap(circles[1], circles[2]);
  const o02 = circlesOverlap(circles[0], circles[2]);

  const drawGlow = (a, b, hex) => {
    if (!circlesOverlap(a, b)) return;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const g = ctx.createRadialGradient(mx, my, 0, mx, my, 55);
    g.addColorStop(0, hex + 'bb');
    g.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(mx, my, 55, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  };
  drawGlow(circles[0], circles[1], '#FF6600');
  drawGlow(circles[1], circles[2], '#22AA33');
  drawGlow(circles[0], circles[2], '#8822CC');

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  circles.forEach(c => {
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
    g.addColorStop(0, c.color + 'ff');
    g.addColorStop(0.65, c.color + 'cc');
    g.addColorStop(1, c.color + '33');
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  });
  ctx.restore();

  circles.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 7;
    ctx.fillText(c.name, c.x, c.y);
    ctx.shadowBlur = 0;
  });

  const olbl = (a, b, name, col) => {
    if (!circlesOverlap(a, b)) return;
    ctx.fillStyle = col;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 9;
    ctx.fillText(name, (a.x + b.x) / 2, (a.y + b.y) / 2);
    ctx.shadowBlur = 0;
  };
  olbl(circles[0], circles[1], 'Orange', '#ffcc88');
  olbl(circles[1], circles[2], 'Green', '#aaffaa');
  olbl(circles[0], circles[2], 'Violet', '#ddaaff');

  const oAll = o01 && o12 && o02;
  if (oAll) {
    const cx = (circles[0].x + circles[1].x + circles[2].x) / 3;
    const cy = (circles[0].y + circles[1].y + circles[2].y) / 3;
    ctx.fillStyle = '#e8c9aa';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Brown', cx, cy);
  }

  return { o01, o12, o02, oAll };
}

function drawSecondaryCanvas(ctx) {
  ctx.clearRect(0, 0, 300, 300);
  ctx.fillStyle = '#13131d';
  ctx.fillRect(0, 0, 300, 300);

  const pp = [[80, 55], [220, 55], [150, 240]];
  const pc = ['#EE1111', '#FFE600', '#1155EE'];
  const pn = ['Red', 'Yellow', 'Blue'];
  const sp = [[150, 100], [215, 175], [85, 175]];
  const sc = ['#FF6600', '#22AA33', '#8822CC'];
  const sn = ['Orange', 'Green', 'Violet'];
  const sf = ['R+Y', 'Y+B', 'B+R'];

  [[0, 1, 0], [1, 2, 1], [2, 0, 2]].forEach(([a, bIdx, si]) => {
    ctx.beginPath(); ctx.moveTo(pp[a][0], pp[a][1]); ctx.lineTo(sp[si][0], sp[si][1]);
    ctx.strokeStyle = sc[si] + '55'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pp[bIdx][0], pp[bIdx][1]); ctx.lineTo(sp[si][0], sp[si][1]);
    ctx.strokeStyle = sc[si] + '55'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
  });

  pp.forEach(([x, y], i) => {
    ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fillStyle = pc[i] + 'cc'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'white'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 5;
    ctx.fillText(pn[i], x, y); ctx.shadowBlur = 0;
  });

  sp.forEach(([x, y], i) => {
    ctx.beginPath(); ctx.arc(x, y, 36, 0, Math.PI * 2);
    ctx.fillStyle = sc[i] + 'dd'; ctx.fill();
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = 'white'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 6;
    ctx.fillText(sn[i], x, y - 6); ctx.font = '9px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText(sf[i], x, y + 8); ctx.shadowBlur = 0;
  });

  ctx.fillStyle = 'rgba(232,255,71,0.7)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('SECONDARY = Primary + Primary', 150, 290);
}

function drawTertiaryCanvas(ctx) {
  ctx.clearRect(0, 0, 300, 300);
  ctx.fillStyle = '#13131d';
  ctx.fillRect(0, 0, 300, 300);

  const N2 = 12, SEG2 = (2 * Math.PI) / N2;
  const TC = ['#FFE600', '#FFAA00', '#FF6600', '#FF3300', '#EE1111', '#CC1166', '#8822CC', '#4433CC', '#1155EE', '#008866', '#22AA33', '#88CC00'];
  const TT = ['P', 'T', 'S', 'T', 'P', 'T', 'S', 'T', 'P', 'T', 'S', 'T'];

  for (let i = 0; i < N2; i++) {
    const a0 = -Math.PI / 2 - SEG2 / 2 + i * SEG2, a1 = a0 + SEG2;
    ctx.beginPath(); ctx.moveTo(150, 150); ctx.arc(150, 150, 128, a0, a1); ctx.closePath();
    ctx.fillStyle = TC[i]; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; ctx.stroke();
    const mid = a0 + SEG2 / 2, tx = 150 + 105 * Math.cos(mid), ty = 150 + 105 * Math.sin(mid);
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.font = `bold ${TT[i] === 'P' ? 11 : 9}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(TT[i], tx, ty);
  }

  ctx.beginPath(); ctx.arc(150, 150, 46, 0, Math.PI * 2); ctx.fillStyle = '#13131d'; ctx.fill();
  ctx.fillStyle = 'rgba(232,255,71,0.9)'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('P=Primary', 150, 141); ctx.fillText('S=Secondary', 150, 153); ctx.fillText('T=Tertiary', 150, 165);
}

export default function PrimaryColors() {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState('primary');
  const [mixResult, setMixResult] = useState(null);
  const circlesRef = useRef(INITIAL_CIRCLES.map(c => ({ ...c })));
  const dragRef = useRef({ idx: -1, offX: 0, offY: 0 });

  const data = MIX_DATA[activeTab];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (activeTab === 'primary') {
      const { o01, o12, o02, oAll } = drawPrimaryInteractive(ctx, circlesRef.current);
      // update mix result
      const pairs = [];
      if (o01) pairs.push('Red+Yellow');
      if (o12) pairs.push('Yellow+Blue');
      if (o02) pairs.push('Red+Blue');
      if (oAll) {
        setMixResult({ swatch: '#6B3A2A', name: '→ Brown (all 3 mixed)', hex: '#6B3A2A' });
      } else if (pairs.length) {
        const m = MIX_TABLE[pairs[0]];
        setMixResult({ swatch: m.hex, name: '→ ' + m.name, hex: m.hex });
      } else {
        setMixResult(null);
      }
    } else if (activeTab === 'secondary') {
      drawSecondaryCanvas(ctx);
      setMixResult(null);
    } else {
      drawTertiaryCanvas(ctx);
      setMixResult(null);
    }
  }, [activeTab]);

  const redrawPrimary = () => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 'primary') return;
    const ctx = canvas.getContext('2d');
    const { o01, o12, o02, oAll } = drawPrimaryInteractive(ctx, circlesRef.current);
    const pairs = [];
    if (o01) pairs.push('Red+Yellow');
    if (o12) pairs.push('Yellow+Blue');
    if (o02) pairs.push('Red+Blue');
    if (oAll) {
      setMixResult({ swatch: '#6B3A2A', name: '→ Brown (all 3 mixed)', hex: '#6B3A2A' });
    } else if (pairs.length) {
      const m = MIX_TABLE[pairs[0]];
      setMixResult({ swatch: m.hex, name: '→ ' + m.name, hex: m.hex });
    } else {
      setMixResult(null);
    }
  };

  const getCanvasPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scx = 300 / rect.width, scy = 300 / rect.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * scx, y: (cy - rect.top) * scy };
  };

  const handleMouseDown = (e) => {
    if (activeTab !== 'primary') return;
    const { x, y } = getCanvasPos(e, canvasRef.current);
    const circles = circlesRef.current;
    for (let i = circles.length - 1; i >= 0; i--) {
      const c = circles[i];
      if (Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2) < c.r) {
        dragRef.current = { idx: i, offX: x - c.x, offY: y - c.y };
        canvasRef.current.style.cursor = 'grabbing';
        break;
      }
    }
  };

  const handleMouseMove = (e) => {
    const { idx, offX, offY } = dragRef.current;
    if (idx < 0 || activeTab !== 'primary') return;
    const { x, y } = getCanvasPos(e, canvasRef.current);
    circlesRef.current[idx].x = Math.max(44, Math.min(256, x - offX));
    circlesRef.current[idx].y = Math.max(44, Math.min(256, y - offY));
    redrawPrimary();
  };

  const handleMouseUp = () => {
    dragRef.current.idx = -1;
    if (activeTab === 'primary' && canvasRef.current) {
      canvasRef.current.style.cursor = 'grab';
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (activeTab !== 'primary') return;
    const { x, y } = getCanvasPos(e, canvasRef.current);
    const circles = circlesRef.current;
    for (let i = circles.length - 1; i >= 0; i--) {
      const c = circles[i];
      if (Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2) < c.r) {
        dragRef.current = { idx: i, offX: x - c.x, offY: y - c.y };
        break;
      }
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const { idx, offX, offY } = dragRef.current;
    if (idx < 0 || activeTab !== 'primary') return;
    const { x, y } = getCanvasPos(e, canvasRef.current);
    circlesRef.current[idx].x = Math.max(44, Math.min(256, x - offX));
    circlesRef.current[idx].y = Math.max(44, Math.min(256, y - offY));
    redrawPrimary();
  };

  const handleTouchEnd = () => { dragRef.current.idx = -1; };

  const switchTab = (tab) => {
    // reset circles when switching back to primary
    if (tab === 'primary') {
      circlesRef.current = INITIAL_CIRCLES.map(c => ({ ...c }));
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  return (
    <section id="primary-section">
      <div className="section-label">Part 02 — Color Families</div>
      <h2 className="section-title">Primary, Secondary<br />&amp; Tertiary.</h2>
      <p className="section-desc">Colors are born from mixing. Click each tab to explore — and on the Primary tab, <strong style={{ color: 'var(--accent)' }}>drag the circles together</strong> to mix them interactively.</p>

      <div className="color-mix-lab">
        <div className="mix-tabs">
          {['primary', 'secondary', 'tertiary'].map(tab => (
            <button
              key={tab}
              className={`mix-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => switchTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Colors
            </button>
          ))}
        </div>

        <div className="mix-display">
          <div className="mix-canvas-wrap" style={{ position: 'relative' }}>
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              style={{
                borderRadius: '16px',
                border: '1px solid var(--border)',
                cursor: activeTab === 'primary' ? 'grab' : 'default',
                display: 'block',
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
            {activeTab === 'primary' && (
              <div style={{ position: 'absolute', bottom: '0.5rem', left: 0, right: 0, textAlign: 'center', fontSize: '0.65rem', color: 'rgba(232,255,71,0.6)', pointerEvents: 'none' }}>
                ↑ Drag the circles to mix colors
              </div>
            )}
          </div>

          <div className="mix-info">
            <div className="mix-info-title">{data.title}</div>
            <div className="mix-info-desc">{data.desc}</div>

            {activeTab === 'primary' && mixResult && (
              <div style={{ display: 'block', marginTop: '1rem', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.5rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>Mix Result</div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: mixResult.swatch }} />
                  <div>
                    <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: '1rem' }}>{mixResult.name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>{mixResult.hex}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mix-colors-row">
              {data.colors.map(c => (
                <div key={c.name} className="mix-color-chip">
                  <div className="mix-color-dot" style={{ background: c.hex }} />
                  <span>
                    {c.name}
                    {c.from && <span style={{ color: 'var(--muted)', fontSize: '0.68rem' }}> ({c.from})</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

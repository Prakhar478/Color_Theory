import { useRef, useEffect, useState } from 'react';

const MIX_DATA = {
  primary: {
    title: 'The 3 Primary Colors (RGB Digital)',
    desc: 'On screens, primary colors are Red, Green, and Blue light. They cannot be created by mixing other colors. Every color you see on your screen is made from combinations of these three. Drag the circles together to see live mixing.',
    colors: [
      { name: 'Red',   hex: '#FF0000' },
      { name: 'Green', hex: '#00FF00' },
      { name: 'Blue',  hex: '#0000FF' },
    ],
  },
  secondary: {
    title: 'Mix Two Primary Colors',
    desc: 'Select any two primary colors below to see what they produce when mixed with RGB additive mixing. Try all three combinations!',
    colors: [
      { name: 'Yellow',  hex: '#FFFF00', from: 'Red + Green'  },
      { name: 'Cyan',    hex: '#00FFFF', from: 'Green + Blue' },
      { name: 'Magenta', hex: '#FF00FF', from: 'Red + Blue'   },
    ],
  },
  tertiary: {
    title: 'Intermediate Colors',
    desc: 'Intermediate colors sit between primaries and secondaries on the HSL color wheel. They are created by mixing a primary with an adjacent secondary.',
    colors: [
      { name: 'Chartreuse', hex: '#80FF00', from: 'Green + Yellow' },
      { name: 'Spring Grn', hex: '#00FF80', from: 'Green + Cyan'   },
      { name: 'Azure',      hex: '#0080FF', from: 'Blue + Cyan'    },
      { name: 'Violet',     hex: '#8000FF', from: 'Blue + Magenta' },
      { name: 'Rose',       hex: '#FF0080', from: 'Red + Magenta'  },
      { name: 'Orange',     hex: '#FF8000', from: 'Red + Yellow'   },
    ],
  },
};

const RGB_PRIMARIES = [
  { name: 'Red',   hex: '#FF0000', r: 255, g: 0,   b: 0   },
  { name: 'Green', hex: '#00FF00', r: 0,   g: 255, b: 0   },
  { name: 'Blue',  hex: '#0000FF', r: 0,   g: 0,   b: 255 },
];

const MIX_RESULTS = {
  '01': { name: 'Yellow',  hex: '#FFFF00', formula: 'Red + Green = Yellow'  },
  '10': { name: 'Yellow',  hex: '#FFFF00', formula: 'Red + Green = Yellow'  },
  '12': { name: 'Cyan',    hex: '#00FFFF', formula: 'Green + Blue = Cyan'   },
  '21': { name: 'Cyan',    hex: '#00FFFF', formula: 'Green + Blue = Cyan'   },
  '02': { name: 'Magenta', hex: '#FF00FF', formula: 'Red + Blue = Magenta'  },
  '20': { name: 'Magenta', hex: '#FF00FF', formula: 'Red + Blue = Magenta'  },
  '012': { name: 'White',  hex: '#FFFFFF', formula: 'Red + Green + Blue = White' },
};

const INITIAL_CIRCLES = [
  { x: 150, y: 70,  r: 44, color: '#FF0000', name: 'Red'   },
  { x: 80,  y: 210, r: 44, color: '#00FF00', name: 'Green' },
  { x: 220, y: 210, r: 44, color: '#0000FF', name: 'Blue'  },
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
    ctx.beginPath(); ctx.arc(mx, my, 55, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
  };
  drawGlow(circles[0], circles[1], '#FFFF00');
  drawGlow(circles[1], circles[2], '#00FFFF');
  drawGlow(circles[0], circles[2], '#FF00FF');

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  circles.forEach(c => {
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
    g.addColorStop(0, c.color + 'ff');
    g.addColorStop(0.65, c.color + 'cc');
    g.addColorStop(1, c.color + '33');
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
  });
  ctx.restore();

  circles.forEach(c => {
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'white'; ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 7;
    ctx.fillText(c.name, c.x, c.y); ctx.shadowBlur = 0;
  });

  const olbl = (a, b, name, col) => {
    if (!circlesOverlap(a, b)) return;
    ctx.fillStyle = col; ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.95)'; ctx.shadowBlur = 9;
    ctx.fillText(name, (a.x + b.x) / 2, (a.y + b.y) / 2); ctx.shadowBlur = 0;
  };
  olbl(circles[0], circles[1], 'Yellow',  '#ffffaa');
  olbl(circles[1], circles[2], 'Cyan',    '#aaffff');
  olbl(circles[0], circles[2], 'Magenta', '#ffaaff');

  const oAll = o01 && o12 && o02;
  if (oAll) {
    const cx = (circles[0].x + circles[1].x + circles[2].x) / 3;
    const cy = (circles[0].y + circles[1].y + circles[2].y) / 3;
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('White', cx, cy);
  }

  return { o01, o12, o02, oAll };
}

function drawTertiaryCanvas(ctx) {
  ctx.clearRect(0, 0, 300, 300);
  ctx.fillStyle = '#13131d';
  ctx.fillRect(0, 0, 300, 300);

  const N2 = 12, SEG2 = (2 * Math.PI) / N2;
  const TC = ['#FFFF00','#80FF00','#00CC00','#00FF80','#00FFFF','#0080FF',
              '#0055FF','#8000FF','#FF00FF','#FF0080','#FF0000','#FF8000'];
  const TT = ['S','I','P','I','S','I','P','I','S','I','P','I'];

  for (let i = 0; i < N2; i++) {
    const a0 = -Math.PI / 2 - SEG2 / 2 + i * SEG2, a1 = a0 + SEG2;
    ctx.beginPath(); ctx.moveTo(150, 150); ctx.arc(150, 150, 128, a0, a1); ctx.closePath();
    ctx.fillStyle = TC[i]; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    const mid = a0 + SEG2 / 2, tx = 150 + 105 * Math.cos(mid), ty = 150 + 105 * Math.sin(mid);
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.font = 'bold ' + (TT[i] === 'P' ? 11 : 9) + 'px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(TT[i], tx, ty);
  }

  ctx.beginPath(); ctx.arc(150, 150, 46, 0, Math.PI * 2); ctx.fillStyle = '#13131d'; ctx.fill();
  ctx.fillStyle = 'rgba(232,255,71,0.9)'; ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('P = Primary', 150, 141);
  ctx.fillText('S = Secondary', 150, 153);
  ctx.fillText('I = Intermediate', 150, 165);
}

// â”€â”€ Secondary interactive mixer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SecondaryMixer() {
  const [selA, setSelA] = useState(null);
  const [selB, setSelB] = useState(null);

  const getKey = (a, b) => {
    if (a === null || b === null) return null;
    const sorted = [a, b].sort().join('');
    return MIX_RESULTS[sorted] || null;
  };

  const mixResult = getKey(selA, selB);

  const handleSelect = (idx) => {
    if (selA === null) {
      setSelA(idx);
    } else if (selB === null && idx !== selA) {
      setSelB(idx);
    } else {
      // reset and start over
      setSelA(idx);
      setSelB(null);
    }
  };

  const reset = () => { setSelA(null); setSelB(null); };

  return (
    <div>
      <div style={{ marginBottom: '1rem', fontSize: '0.78rem', color: '#bbb', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--accent)' }}>How to use:</strong> Click any two primary colors to mix them.
        Try all three pairs to discover the RGB secondary colors.
      </div>

      {/* Primary selector buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {RGB_PRIMARIES.map((p, i) => {
          const isSelA = selA === i;
          const isSelB = selB === i;
          const isSelected = isSelA || isSelB;
          return (
            <button
              key={p.name}
              onClick={() => handleSelect(i)}
              style={{
                flex: 1, minWidth: '80px', padding: '1rem 0.5rem',
                borderRadius: '14px', border: isSelected ? '2px solid white' : '2px solid rgba(255,255,255,0.15)',
                background: isSelected ? p.hex + 'dd' : p.hex + '44',
                cursor: 'pointer', transition: 'all 0.2s',
                transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                boxShadow: isSelected ? '0 0 20px ' + p.hex + '88' : 'none',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.hex, margin: '0 auto 0.5rem', border: '2px solid rgba(255,255,255,0.3)' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white', textShadow: '0 0 8px rgba(0,0,0,0.9)' }}>{p.name}</div>
              {isSelA && <div style={{ fontSize: '0.6rem', color: 'var(--accent)', marginTop: '0.2rem' }}>1st</div>}
              {isSelB && <div style={{ fontSize: '0.6rem', color: '#aaffff', marginTop: '0.2rem' }}>2nd</div>}
            </button>
          );
        })}
      </div>

      {/* Mix result */}
      {mixResult ? (
        <div style={{ padding: '1.2rem', borderRadius: '14px', border: '1px solid ' + mixResult.hex + '66', background: mixResult.hex + '18', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.5rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>Mix Result</div>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: mixResult.hex, margin: '0 auto 0.75rem', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 0 24px ' + mixResult.hex + '88' }} />
          <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: '1.3rem', color: 'white', marginBottom: '0.25rem' }}>{mixResult.name}</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>{mixResult.hex}</div>
          <div style={{ fontSize: '0.78rem', color: '#ccc', background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '0.4rem 0.8rem', display: 'inline-block' }}>{mixResult.formula}</div>
          <div style={{ marginTop: '0.75rem' }}>
            <button onClick={reset} style={{ padding: '0.4rem 1rem', borderRadius: '999px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', fontSize: '0.72rem', cursor: 'pointer' }}>
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'center' }}>
          {selA === null ? (
            <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Select your first primary color above</div>
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
              <span style={{ color: RGB_PRIMARIES[selA].hex, fontWeight: 700 }}>{RGB_PRIMARIES[selA].name}</span> selected. Now pick a second color.
            </div>
          )}
        </div>
      )}

      {/* All combinations cheat sheet */}
      <div style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
        {[
          { a: 0, b: 1, result: 'Yellow',  hex: '#FFFF00' },
          { a: 1, b: 2, result: 'Cyan',    hex: '#00FFFF' },
          { a: 0, b: 2, result: 'Magenta', hex: '#FF00FF' },
        ].map(combo => (
          <div key={combo.result}
            onClick={() => { setSelA(combo.a); setSelB(combo.b); }}
            style={{ padding: '0.6rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginBottom: '0.3rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: RGB_PRIMARIES[combo.a].hex }} />
              <span style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>+</span>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: RGB_PRIMARIES[combo.b].hex }} />
              <span style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>=</span>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: combo.hex }} />
            </div>
            <div style={{ fontSize: '0.65rem', color: '#ccc' }}>{combo.result}</div>
          </div>
        ))}
      </div>
    </div>
  );
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
    if (!canvas || activeTab !== 'primary') return;
    const ctx = canvas.getContext('2d');
    const { o01, o12, o02, oAll } = drawPrimaryInteractive(ctx, circlesRef.current);
    const pairs = [];
    if (o01) pairs.push('01');
    if (o12) pairs.push('12');
    if (o02) pairs.push('02');
    if (oAll) {
      setMixResult({ swatch: '#FFFFFF', name: 'White (all 3 mixed)', hex: '#FFFFFF' });
    } else if (pairs.length) {
      const m = MIX_RESULTS[pairs[0]];
      setMixResult({ swatch: m.hex, name: m.name, hex: m.hex });
    } else {
      setMixResult(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'tertiary') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      drawTertiaryCanvas(canvas.getContext('2d'));
    }
  }, [activeTab]);

  const redrawPrimary = () => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 'primary') return;
    const ctx = canvas.getContext('2d');
    const { o01, o12, o02, oAll } = drawPrimaryInteractive(ctx, circlesRef.current);
    const pairs = [];
    if (o01) pairs.push('01');
    if (o12) pairs.push('12');
    if (o02) pairs.push('02');
    if (oAll) {
      setMixResult({ swatch: '#FFFFFF', name: 'White (all 3 mixed)', hex: '#FFFFFF' });
    } else if (pairs.length) {
      const m = MIX_RESULTS[pairs[0]];
      setMixResult({ swatch: m.hex, name: m.name, hex: m.hex });
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
    for (let i = circlesRef.current.length - 1; i >= 0; i--) {
      const c = circlesRef.current[i];
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
    if (activeTab === 'primary' && canvasRef.current) canvasRef.current.style.cursor = 'grab';
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (activeTab !== 'primary') return;
    const { x, y } = getCanvasPos(e, canvasRef.current);
    for (let i = circlesRef.current.length - 1; i >= 0; i--) {
      const c = circlesRef.current[i];
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
    if (tab === 'primary') circlesRef.current = INITIAL_CIRCLES.map(c => ({ ...c }));
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
      <div className="section-label">Part 02 - Color Families</div>
      <h2 className="section-title">Primary, Secondary<br />&amp; Intermediate.</h2>
      <p className="section-desc">
        On screens, color is made from <strong style={{ color: 'var(--accent)' }}>light</strong>, not paint.
        The RGB (Red, Green, Blue) model is the digital standard.
      </p>

      <div style={{ marginTop: '0.75rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'rgba(232,255,71,0.07)', border: '1px solid rgba(232,255,71,0.2)', fontSize: '0.76rem', color: '#ccc', maxWidth: '560px' }}>
        <strong style={{ color: 'var(--accent)' }}>Digital vs Paint:</strong> Traditional art uses RYB (Red, Yellow, Blue) for mixing paint.
        Screens use RGB (Red, Green, Blue) for mixing light. These are two different systems.
      </div>

      <div className="color-mix-lab">
        <div className="mix-tabs">
          {['primary', 'secondary', 'tertiary'].map(tab => (
            <button
              key={tab}
              className={'mix-tab' + (activeTab === tab ? ' active' : '')}
              onClick={() => switchTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Colors
            </button>
          ))}
        </div>

        <div className="mix-display">
          {/* Left side: canvas for primary/tertiary, nothing for secondary */}
          <div className="mix-canvas-wrap" style={{ position: 'relative' }}>
            {activeTab === 'secondary' ? (
              <div style={{ width: '100%', maxWidth: 300, margin: '0 auto' }}>
                <SecondaryMixer />
              </div>
            ) : (
              <>
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
                  <div style={{ position: 'absolute', bottom: '0.5rem', left: 0, right: 0, textAlign: 'center', fontSize: '0.65rem', color: 'rgba(232,255,71,0.7)', pointerEvents: 'none' }}>
                    Drag the circles to mix colors live
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mix-info">
            <div className="mix-info-title">{data.title}</div>
            <div className="mix-info-desc">{data.desc}</div>

            {activeTab === 'primary' && mixResult && (
              <div style={{ marginTop: '1rem', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.5rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>Mix Result</div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: mixResult.swatch }} />
                  <div>
                    <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: '1rem' }}>{mixResult.name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>{mixResult.hex}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'secondary' && (
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

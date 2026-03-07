import { useRef, useEffect, useState } from 'react';

const SIZE = 500;
const CX = SIZE / 2, CY = SIZE / 2;
const R_OUT = 228, R_IN = 108;
const N = 12;
const SEG = (2 * Math.PI) / N;
const OFF = -Math.PI / 2 - SEG / 2;
const TGAP = 0.016;

const SEGS = [
  { name: 'Yellow',       type: 'primary',   color: '#FFE600' },
  { name: 'Yellow-Orange',type: 'tertiary',  color: '#FFAA00' },
  { name: 'Orange',       type: 'secondary', color: '#FF6600' },
  { name: 'Red-Orange',   type: 'tertiary',  color: '#FF3300' },
  { name: 'Red',          type: 'primary',   color: '#EE1111' },
  { name: 'Red-Violet',   type: 'tertiary',  color: '#CC1166' },
  { name: 'Violet',       type: 'secondary', color: '#8822CC' },
  { name: 'Blue-Violet',  type: 'tertiary',  color: '#4433CC' },
  { name: 'Blue',         type: 'primary',   color: '#1155EE' },
  { name: 'Blue-Green',   type: 'tertiary',  color: '#008866' },
  { name: 'Green',        type: 'secondary', color: '#22AA33' },
  { name: 'Yellow-Green', type: 'tertiary',  color: '#88CC00' },
];

function segMid(i) { return OFF + (i + 0.5) * SEG; }

function drawLabel(ctx, seg, i, alpha) {
  const mid = segMid(i);
  const lr = (R_IN + R_OUT) / 2;
  const lx = CX + lr * Math.cos(mid);
  const ly = CY + lr * Math.sin(mid);

  ctx.save();
  ctx.translate(lx, ly);

  let rot = mid + Math.PI / 2;
  if (Math.cos(mid) < -0.001) { rot = mid - Math.PI / 2; }
  ctx.rotate(rot);

  ctx.shadowColor = 'rgba(0,0,0,0.95)';
  ctx.shadowBlur = 6;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.font = `bold 11.5px "Space Grotesk",sans-serif`;
  ctx.fillText(seg.name.toUpperCase(), 0, -7);

  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.6})`;
  ctx.font = `9.5px "Space Grotesk",sans-serif`;
  ctx.fillText(seg.type, 0, 6);

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawWheelFull(ctx, activeArr) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  SEGS.forEach((seg, i) => {
    const sa = OFF + i * SEG + TGAP, ea = OFF + (i + 1) * SEG - TGAP;
    const isAct = !activeArr || activeArr.includes(i);

    const grd = ctx.createRadialGradient(CX, CY, R_IN, CX, CY, R_OUT);
    if (isAct) {
      grd.addColorStop(0, seg.color + 'bb');
      grd.addColorStop(0.5, seg.color + 'ee');
      grd.addColorStop(1, seg.color);
    } else {
      grd.addColorStop(0, seg.color + '18');
      grd.addColorStop(0.5, seg.color + '30');
      grd.addColorStop(1, seg.color + '50');
    }
    ctx.beginPath(); ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, R_OUT, sa, ea); ctx.closePath();
    ctx.fillStyle = grd; ctx.fill();

    if (isAct && activeArr) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R_OUT - 5, sa + 0.02, ea - 0.02);
      ctx.strokeStyle = seg.color + 'cc';
      ctx.lineWidth = 8;
      ctx.shadowColor = seg.color;
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.restore();
    }
  });

  // Separator lines
  for (let i = 0; i < N; i++) {
    const a = OFF + i * SEG;
    ctx.beginPath();
    ctx.moveTo(CX + R_IN * Math.cos(a), CY + R_IN * Math.sin(a));
    ctx.lineTo(CX + R_OUT * Math.cos(a), CY + R_OUT * Math.sin(a));
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 2.5; ctx.stroke();
  }

  // Inner dark circle
  const ig = ctx.createRadialGradient(CX, CY, 0, CX, CY, R_IN);
  ig.addColorStop(0, '#16162a'); ig.addColorStop(1, '#0c0c18');
  ctx.beginPath(); ctx.arc(CX, CY, R_IN, 0, Math.PI * 2);
  ctx.fillStyle = ig; ctx.fill();

  // Solid triangle (primary colors: 0, 4, 8)
  const tr = R_IN - 20;
  const sc = idx => { const a = segMid(idx); return { x: CX + tr * Math.cos(a), y: CY + tr * Math.sin(a) }; };
  ctx.save(); ctx.setLineDash([]);
  const [t0, t1, t2] = [sc(0), sc(4), sc(8)];
  ctx.beginPath(); ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.closePath();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 1.5; ctx.stroke();

  // Dashed triangle (secondary colors: 2, 6, 10)
  ctx.setLineDash([4, 4]);
  const [d0, d1, d2] = [sc(2), sc(6), sc(10)];
  ctx.beginPath(); ctx.moveTo(d0.x, d0.y); ctx.lineTo(d1.x, d1.y); ctx.lineTo(d2.x, d2.y); ctx.closePath();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.setLineDash([]); ctx.restore();

  // Labels
  SEGS.forEach((seg, i) => {
    const isAct = !activeArr || activeArr.includes(i);
    drawLabel(ctx, seg, i, isAct ? 0.96 : 0.2);
  });
}

function getSchemeIdxs(base, scheme) {
  const w = v => ((v % N) + N) % N;
  if (scheme === 'complementary') return [base, w(base + 6)];
  if (scheme === 'analogous')     return [base, w(base - 1), w(base + 1)];
  if (scheme === 'triadic')       return [base, w(base + 4), w(base + 8)];
  if (scheme === 'monochromatic') return [base];
  if (scheme === 'split')         return [base, w(base + 5), w(base + 7)];
  return null;
}

const SCHEME_INFO = {
  none: 'Click any segment or dot, then choose a scheme to see color relationships.',
  complementary: '<strong style="color:#fff">Complementary</strong> — colors directly opposite on the wheel (180°). Maximum contrast. Best for CTAs, highlights, and bold UI.',
  analogous: '<strong style="color:#fff">Analogous</strong> — neighboring colors (±30°). Creates natural harmony. Common in nature-inspired and calm interfaces.',
  triadic: '<strong style="color:#fff">Triadic</strong> — three colors 120° apart. Vibrant yet balanced. Use one as dominant, two as accents for a lively palette.',
  monochromatic: '<strong style="color:#fff">Monochromatic</strong> — one hue, many shades/tints. Elegant and cohesive. Perfect for sophisticated minimalist design.',
  split: '<strong style="color:#fff">Split-Complementary</strong> — base color + two neighbors of its complement. More subtle than pure complementary, still colorful.',
};

const DOT_R = 260;
const DOT_W = 38;

export default function ColorWheel() {
  const canvasRef = useRef(null);
  const [selIdx, setSelIdx] = useState(-1);
  const [curScheme, setCurScheme] = useState('none');
  const [centerInfo, setCenterInfo] = useState({ name: 'Click', hex: 'a color' });
  const [centerStyle, setCenterStyle] = useState({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const activeArr = curScheme === 'none' || selIdx < 0 ? null : getSchemeIdxs(selIdx, curScheme);
    drawWheelFull(ctx, activeArr);
  }, [selIdx, curScheme]);

  const selectSeg = (i) => {
    const seg = SEGS[i];
    setSelIdx(i);
    setCenterInfo({ name: seg.name, hex: seg.color });
    setCenterStyle({
      background: seg.color + '28',
      borderColor: seg.color + '88',
      boxShadow: `0 0 22px 8px ${seg.color}44`,
    });
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = SIZE / rect.width, scaleY = SIZE / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const dx = mx - CX, dy = my - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < R_IN || dist > R_OUT) return;
    let angle = Math.atan2(dy, dx) - OFF;
    while (angle < 0) angle += 2 * Math.PI;
    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
    selectSeg(Math.floor(angle / SEG) % N);
  };

  const handleScheme = (scheme) => {
    setCurScheme(scheme);
  };

  const activeArr = curScheme === 'none' || selIdx < 0 ? null : getSchemeIdxs(selIdx, curScheme);
  const schemes = ['none', 'complementary', 'analogous', 'triadic', 'monochromatic', 'split'];
  const schemeLabels = {
    none: 'No Scheme', complementary: 'Complementary', analogous: 'Analogous',
    triadic: 'Triadic', monochromatic: 'Monochromatic', split: 'Split-Complementary',
  };

  return (
    <section id="wheel-section">
      <div className="section-label">Part 01 — Color Wheel</div>
      <h2 className="section-title">Pick a color.<br />See its family.</h2>
      <p className="section-desc">Click any segment or dot on the wheel, then choose a color scheme to see which colors harmonize with it.</p>

      <div className="scheme-btns">
        {schemes.map(s => (
          <button
            key={s}
            className={`scheme-btn${curScheme === s ? ' active' : ''}`}
            onClick={() => handleScheme(s)}
          >
            {schemeLabels[s]}
          </button>
        ))}
      </div>

      <div className="wheel-wrap" id="wheelWrap">
        <canvas
          ref={canvasRef}
          id="colorWheel"
          width={SIZE}
          height={SIZE}
          style={{ width: '100%', height: 'auto', maxWidth: SIZE + 'px' }}
          onClick={handleCanvasClick}
        />

        {/* Dot ring */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', maxWidth: SIZE + 'px' }}>
          {SEGS.map((seg, i) => {
            const mid = segMid(i);
            const cx2 = CX + DOT_R * Math.cos(mid) - DOT_W / 2;
            const cy2 = CY + DOT_R * Math.sin(mid) - DOT_W / 2;
            let dotClass = 'cdot';
            if (activeArr) {
              if (activeArr.includes(i)) dotClass += ' active';
              else dotClass += ' dim';
            }
            return (
              <div
                key={i}
                className={dotClass}
                title={seg.name}
                style={{
                  width: DOT_W + 'px',
                  height: DOT_W + 'px',
                  left: cx2 + 'px',
                  top: cy2 + 'px',
                  background: seg.color,
                  '--gc': seg.color + 'aa',
                  pointerEvents: 'all',
                }}
                onClick={() => selectSeg(i)}
              />
            );
          })}
        </div>

        {/* Center info */}
        <div className="wheel-center" style={centerStyle}>
          <span className="wc-name">{centerInfo.name}</span>
          <span className="wc-hex">{centerInfo.hex}</span>
        </div>
      </div>

      <div
        id="scheme-info"
        dangerouslySetInnerHTML={{ __html: SCHEME_INFO[curScheme] || '' }}
      />
    </section>
  );
}

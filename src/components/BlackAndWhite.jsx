import { useRef, useEffect, useState } from 'react';

const PRESETS = {
  normal:      [50, 50, 0],
  highcontrast:[50, 90, 0],
  lowkey:      [20, 65, 0],
  highkey:     [78, 40, 0],
  film:        [48, 60, 55],
};

function drawBWScene(canvas, bri, con, grain) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // Sky gradient
  const skyG = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  skyG.addColorStop(0, '#e8e8e8'); skyG.addColorStop(1, '#b0b0b0');
  ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, H * 0.55);

  // Ground
  const gndG = ctx.createLinearGradient(0, H * 0.55, 0, H);
  gndG.addColorStop(0, '#888'); gndG.addColorStop(1, '#555');
  ctx.fillStyle = gndG; ctx.fillRect(0, H * 0.55, W, H * 0.45);

  // Sun
  ctx.beginPath(); ctx.arc(W * 0.75, H * 0.2, 35, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();

  // Mountains
  ctx.beginPath();
  ctx.moveTo(0, H * 0.55); ctx.lineTo(W * 0.25, H * 0.2); ctx.lineTo(W * 0.45, H * 0.42);
  ctx.lineTo(W * 0.6, H * 0.18); ctx.lineTo(W * 0.8, H * 0.38); ctx.lineTo(W, H * 0.28);
  ctx.lineTo(W, H * 0.55); ctx.closePath();
  const mtnG = ctx.createLinearGradient(0, H * 0.18, 0, H * 0.55);
  mtnG.addColorStop(0, '#ddd'); mtnG.addColorStop(1, '#999');
  ctx.fillStyle = mtnG; ctx.fill();

  // Trees
  [W * 0.1, W * 0.2, W * 0.85, W * 0.9].forEach(x => {
    ctx.fillStyle = '#333'; ctx.fillRect(x - 4, H * 0.42, 8, H * 0.2);
    ctx.beginPath(); ctx.moveTo(x, H * 0.28); ctx.lineTo(x - 18, H * 0.46); ctx.lineTo(x + 18, H * 0.46);
    ctx.closePath(); ctx.fillStyle = '#555'; ctx.fill();
  });

  // House
  ctx.fillStyle = '#777'; ctx.fillRect(W * 0.38, H * 0.44, W * 0.14, H * 0.13);
  ctx.beginPath(); ctx.moveTo(W * 0.35, H * 0.44); ctx.lineTo(W * 0.45, H * 0.3); ctx.lineTo(W * 0.55, H * 0.44);
  ctx.closePath(); ctx.fillStyle = '#555'; ctx.fill();
  ctx.fillStyle = '#333'; ctx.fillRect(W * 0.43, H * 0.5, W * 0.04, H * 0.07);

  // Apply brightness/contrast/grain
  const briNorm = (bri - 50) / 50; // -1 to 1
  const conFactor = con / 50;      // 0 to 2
  const briOffset = briNorm * 120;
  const imgData = ctx.getImageData(0, 0, W, H);
  const data = imgData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    let v = (data[i] + data[i + 1] + data[i + 2]) / 3;
    v = (v - 128) * conFactor + 128 + briOffset;
    if (grain > 0) v += (Math.random() - 0.5) * grain * 1.2; // Note: grain is 0-100 here, so no need for * 100 * 1.2. The HTML uses grain as 0-1, and multiplies by 120. In React, grain is 0-100, so multiplying by 1.2 is equivalent to (grain/100) * 120.
    v = Math.max(0, Math.min(255, v));
    data[i] = data[i + 1] = data[i + 2] = v;
  }
  ctx.putImageData(imgData, 0, 0);
}

export default function BlackAndWhite() {
  const canvasRef = useRef(null);
  const [bri, setBri] = useState(50);
  const [con, setCon] = useState(50);
  const [grain, setGrain] = useState(0);
  const [activePreset, setActivePreset] = useState('normal');

  useEffect(() => {
    if (canvasRef.current) drawBWScene(canvasRef.current, bri, con, grain);
  }, [bri, con, grain]);

  const applyPreset = (name) => {
    const [b, c, g] = PRESETS[name];
    setBri(b); setCon(c); setGrain(g);
    setActivePreset(name);
  };

  return (
    <section id="bw-section">
      <div className="section-label">Part 13 — Black &amp; White</div>
      <h2 className="section-title">Expression<br />without color.</h2>
      <p className="section-desc">B&amp;W strips color to reveal form, contrast, and value. Adjust sliders to see how brightness, contrast, and grain change the expression of a composition.</p>

      <div className="bw-layout">
        <div>
          <div style={{ marginBottom: '0.75rem', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Live Canvas</div>
          <canvas ref={canvasRef} width={400} height={280} style={{ width: '100%', borderRadius: '16px', border: '1px solid var(--border)', display: 'block' }} />
        </div>

        <div className="bw-controls">
          <div className="bw-slider-row">
            <div className="bw-slider-label">
              <span className="bw-slider-title">Brightness</span>
              <span className="bw-slider-val">{bri}%</span>
            </div>
            <input type="range" min="0" max="100" value={bri} onChange={e => { setBri(+e.target.value); setActivePreset(''); }}
              style={{ width: '100%', height: '6px', borderRadius: '999px', WebkitAppearance: 'none', background: 'linear-gradient(to right,#000,#fff)', outline: 'none', cursor: 'pointer' }} />
          </div>

          <div className="bw-slider-row">
            <div className="bw-slider-label">
              <span className="bw-slider-title">Contrast</span>
              <span className="bw-slider-val">{con}%</span>
            </div>
            <input type="range" min="0" max="100" value={con} onChange={e => { setCon(+e.target.value); setActivePreset(''); }}
              style={{ width: '100%', height: '6px', borderRadius: '999px', WebkitAppearance: 'none', background: 'linear-gradient(to right,#444,#fff)', outline: 'none', cursor: 'pointer' }} />
          </div>

          <div className="bw-slider-row">
            <div className="bw-slider-label">
              <span className="bw-slider-title">Film Grain</span>
              <span className="bw-slider-val">{grain}%</span>
            </div>
            <input type="range" min="0" max="100" value={grain} onChange={e => { setGrain(+e.target.value); setActivePreset(''); }}
              style={{ width: '100%', height: '6px', borderRadius: '999px', WebkitAppearance: 'none', background: 'linear-gradient(to right,#222,#999)', outline: 'none', cursor: 'pointer' }} />
          </div>

          <div style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Presets</div>
          <div className="bw-presets">
            {Object.keys(PRESETS).map(p => (
              <button
                key={p}
                className={`bw-preset${activePreset === p ? ' active' : ''}`}
                onClick={() => applyPreset(p)}
              >
                {p === 'highcontrast' ? 'High Contrast' : p === 'lowkey' ? 'Low Key' : p === 'highkey' ? 'High Key' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.5rem' }}>Why B&amp;W matters</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.7 }}>
              Without color, viewers focus purely on <strong style={{ color: '#ddd' }}>shape, form, and contrast</strong>. Designers test layouts in B&amp;W first — if it reads well without color, it will work with any palette.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

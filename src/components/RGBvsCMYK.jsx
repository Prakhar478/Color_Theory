import { useState } from 'react';
import { rgbToHex } from '../utils/colorUtils';

export default function RGBvsCMYK() {
  const [c, setC] = useState(80);
  const [m, setM] = useState(20);
  const [y, setY] = useState(10);
  const [k, setK] = useState(5);

  const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
  const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
  const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
  const previewHex = rgbToHex(r, g, b);

  return (
    <section id="models-section">
      <div className="section-label">Part 04 — Color Models</div>
      <h2 className="section-title">RGB vs CMYK.<br />Light vs Ink.</h2>
      <p className="section-desc">Two completely different systems for making color — one uses light, the other uses ink. They work in the opposite way.</p>

      <div className="models-grid">
        {/* RGB card */}
        <div className="model-card" style={{ borderColor: 'rgba(100,150,255,0.25)' }}>
          <div className="model-card-icon">💡</div>
          <div className="model-card-title">RGB</div>
          <div className="model-card-sub">Additive — starts from black</div>
          <div className="model-card-desc">Starts with <strong style={{ color: '#fff' }}>darkness</strong> and adds light. All three at full = white. Used in screens, TVs, monitors, cameras.</div>
          <div style={{ position: 'relative', height: '120px', margin: '1rem 0' }}>
            <div style={{ position: 'absolute', width: '75px', height: '75px', borderRadius: '50%', background: '#ff0000', mixBlendMode: 'screen', opacity: 0.85, left: '50%', top: '5px', transform: 'translateX(-50%)' }} />
            <div style={{ position: 'absolute', width: '75px', height: '75px', borderRadius: '50%', background: '#00ff00', mixBlendMode: 'screen', opacity: 0.85, left: '22%', top: '38px' }} />
            <div style={{ position: 'absolute', width: '75px', height: '75px', borderRadius: '50%', background: '#0000ff', mixBlendMode: 'screen', opacity: 0.85, right: '22%', top: '38px' }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center', marginBottom: '1rem' }}>R+G+B = White · Additive mixing</div>
          <div className="model-uses">
            <span className="model-use-tag">🖥️ Screens</span>
            <span className="model-use-tag">📱 Phones</span>
            <span className="model-use-tag">📸 Cameras</span>
            <span className="model-use-tag">💡 LEDs</span>
          </div>
        </div>

        {/* CMYK card */}
        <div className="model-card" style={{ borderColor: 'rgba(255,150,100,0.25)', background: '#f5f5f0' }}>
          <div className="model-card-icon">🖨️</div>
          <div className="model-card-title" style={{ color: '#111' }}>CMYK</div>
          <div className="model-card-sub" style={{ color: '#3a7a3a' }}>Subtractive — starts from white</div>
          <div className="model-card-desc" style={{ color: '#444' }}>Starts with <strong>white paper</strong> and subtracts light by layering inks. All three = near-black (K adds true black). Used in printing.</div>
          <div style={{ position: 'relative', height: '120px', margin: '1rem 0', background: '#fff', borderRadius: '8px' }}>
            <div style={{ position: 'absolute', width: '75px', height: '75px', borderRadius: '50%', background: '#00ffff', mixBlendMode: 'multiply', opacity: 0.9, left: '50%', top: '5px', transform: 'translateX(-50%)' }} />
            <div style={{ position: 'absolute', width: '75px', height: '75px', borderRadius: '50%', background: '#ff00ff', mixBlendMode: 'multiply', opacity: 0.9, left: '22%', top: '38px' }} />
            <div style={{ position: 'absolute', width: '75px', height: '75px', borderRadius: '50%', background: '#ffff00', mixBlendMode: 'multiply', opacity: 0.9, right: '22%', top: '38px' }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: '#888', textAlign: 'center', marginBottom: '1rem' }}>C+M+Y = Black · Subtractive mixing</div>
          <div className="model-uses">
            <span className="model-use-tag" style={{ color: '#555', borderColor: '#ddd', background: '#eee' }}>🖨️ Printing</span>
            <span className="model-use-tag" style={{ color: '#555', borderColor: '#ddd', background: '#eee' }}>📰 Magazines</span>
            <span className="model-use-tag" style={{ color: '#555', borderColor: '#ddd', background: '#eee' }}>📦 Packaging</span>
          </div>
        </div>
      </div>

      {/* CMYK mixer panel */}
      <div style={{ marginTop: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.8rem' }}>
        <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: '1rem', marginBottom: '1.2rem' }}>🎨 Try CMYK Mixing</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '2rem', alignItems: 'center' }}>
          <div>
            {/* C */}
            <div className="cmyk-row">
              <span className="cmyk-lbl" style={{ color: '#00cccc' }}>C</span>
              <input type="range" min="0" max="100" value={c} onChange={e => setC(+e.target.value)}
                style={{ flex: 1, height: '5px', borderRadius: '999px', WebkitAppearance: 'none', background: 'linear-gradient(to right,#eee,#00cccc)', outline: 'none', cursor: 'pointer' }} />
              <span className="cmyk-num">{c}</span>
            </div>
            {/* M */}
            <div className="cmyk-row">
              <span className="cmyk-lbl" style={{ color: '#cc00cc' }}>M</span>
              <input type="range" min="0" max="100" value={m} onChange={e => setM(+e.target.value)}
                style={{ flex: 1, height: '5px', borderRadius: '999px', WebkitAppearance: 'none', background: 'linear-gradient(to right,#eee,#cc00cc)', outline: 'none', cursor: 'pointer' }} />
              <span className="cmyk-num">{m}</span>
            </div>
            {/* Y */}
            <div className="cmyk-row">
              <span className="cmyk-lbl" style={{ color: '#aaaa00' }}>Y</span>
              <input type="range" min="0" max="100" value={y} onChange={e => setY(+e.target.value)}
                style={{ flex: 1, height: '5px', borderRadius: '999px', WebkitAppearance: 'none', background: 'linear-gradient(to right,#eee,#cccc00)', outline: 'none', cursor: 'pointer' }} />
              <span className="cmyk-num">{y}</span>
            </div>
            {/* K */}
            <div className="cmyk-row">
              <span className="cmyk-lbl" style={{ color: '#888' }}>K</span>
              <input type="range" min="0" max="100" value={k} onChange={e => setK(+e.target.value)}
                style={{ flex: 1, height: '5px', borderRadius: '999px', WebkitAppearance: 'none', background: 'linear-gradient(to right,#eee,#000)', outline: 'none', cursor: 'pointer' }} />
              <span className="cmyk-num">{k}</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '14px', margin: '0 auto', border: '1px solid var(--border)', background: previewHex, transition: 'background .1s' }} />
            <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.4rem' }}>{previewHex.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

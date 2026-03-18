import { useState, useEffect } from 'react';
import { rgbToHex } from '../utils/colorUtils';
import { emitColor } from '../utils/colorBus';

export default function RGBMixer() {
  const [r, setR] = useState(220);
  const [g, setG] = useState(60);
  const [b, setB] = useState(120);

  const hex = rgbToHex(r, g, b);
  const compHex = rgbToHex(255 - r, 255 - g, 255 - b);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const textColor = lum > 130 ? '#0a0a0f' : 'white';

  useEffect(() => { emitColor(hex, 'RGB Mixer'); }, [hex]);

  return (
    <section id="rgb-section">
      <div className="section-label">Part 03 — RGB Additive Model</div>
      <h2 className="section-title">Build any color<br />from light.</h2>
      <p className="section-desc">Every screen mixes Red, Green, and Blue light. Drag the sliders to mix any color and instantly see its HEX and complementary color.</p>
      <div className="rgb-mixer">
        <div>
          <div className="rgb-row">
            <span className="rgb-lbl r">R</span>
            <input type="range" className="r" min="0" max="255" value={r} onChange={e => setR(+e.target.value)} />
            <span className="rgb-num">{r}</span>
          </div>
          <div className="rgb-row">
            <span className="rgb-lbl g">G</span>
            <input type="range" className="g" min="0" max="255" value={g} onChange={e => setG(+e.target.value)} />
            <span className="rgb-num">{g}</span>
          </div>
          <div className="rgb-row">
            <span className="rgb-lbl b">B</span>
            <input type="range" className="b" min="0" max="255" value={b} onChange={e => setB(+e.target.value)} />
            <span className="rgb-num">{b}</span>
          </div>
          <div className="rgb-comp">
            <div>
              <div style={{ fontSize: '.74rem', color: 'var(--muted)', marginBottom: '.25rem' }}>Complementary Color</div>
              <div style={{ fontFamily: 'monospace', fontSize: '.84rem' }}>{compHex.toUpperCase()}</div>
            </div>
            <div className="comp-sw" style={{ background: compHex, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => emitColor(compHex, 'Complementary')}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.12)'; e.currentTarget.style.boxShadow=`0 0 16px ${compHex}88`; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }} />
          </div>
        </div>
        <div className="rgb-preview" style={{ background: hex, transition: 'background 0.08s, box-shadow 0.35s', boxShadow: `0 0 50px ${hex}44, 0 8px 32px rgba(0,0,0,0.4)` }}>
          <div className="rgb-hexv" style={{ color: textColor, transition: 'color 0.2s' }}>{hex.toUpperCase()}</div>
          <div className="rgb-sub" style={{ color: textColor, transition: 'color 0.2s' }}>rgb({r}, {g}, {b})</div>
        </div>
      </div>
    </section>
  );
}

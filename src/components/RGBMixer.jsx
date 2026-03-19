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

        {/* Left: sliders + comp swatch */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
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

          {/* Complementary swatch — always visible */}
          <div className="rgb-comp">
            <div>
              <div style={{ fontSize:'.7rem', color:'var(--muted)', marginBottom:'.2rem', letterSpacing:'0.06em', textTransform:'uppercase' }}>Complementary</div>
              <div style={{ fontFamily:'monospace', fontSize:'.9rem', fontWeight:600 }}>{compHex.toUpperCase()}</div>
            </div>
            <div
              className="comp-sw"
              style={{ background: compHex, cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s' }}
              onClick={() => emitColor(compHex, 'Complementary')}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.15)'; e.currentTarget.style.boxShadow=`0 0 20px ${compHex}99`; }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='none'; }}
            />
          </div>

          {/* Two swatches side by side */}
          <div style={{ display:'flex', gap:'0.6rem', marginTop:'1rem' }}>
            <div
              style={{ flex:1, height:'52px', borderRadius:'10px', background:hex, border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', transition:'transform 0.15s', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', fontFamily:'monospace', color: lum > 130 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}
              onClick={() => navigator.clipboard?.writeText(hex)}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
              title="Click to copy"
            >
              {hex.toUpperCase()}
            </div>
            <div
              style={{ flex:1, height:'52px', borderRadius:'10px', background:compHex, border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', transition:'transform 0.15s', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', fontFamily:'monospace', color: (0.299*(255-r)+0.587*(255-g)+0.114*(255-b)) > 130 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}
              onClick={() => { emitColor(compHex, 'Complementary'); navigator.clipboard?.writeText(compHex); }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
              title="Click to copy complementary"
            >
              {compHex.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Right: color preview */}
        <div className="rgb-preview" style={{ background:hex, transition:'background 0.08s, box-shadow 0.35s', boxShadow:`0 0 50px ${hex}44, 0 8px 32px rgba(0,0,0,0.4)` }}>
          <div className="rgb-hexv" style={{ color:textColor, transition:'color 0.2s' }}>{hex.toUpperCase()}</div>
          <div className="rgb-sub" style={{ color:textColor, transition:'color 0.2s' }}>rgb({r}, {g}, {b})</div>
        </div>
      </div>
    </section>
  );
}
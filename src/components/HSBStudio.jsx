import { useState } from 'react';
import { hsbToHex, hslToHex, hexToRgb } from '../utils/colorUtils';

const STEPS = [0, 20, 40, 60, 80, 100];

export default function HSBStudio() {
  const [hue, setHue] = useState(200);
  const [sat, setSat] = useState(80);
  const [bri, setBri] = useState(70);
  const [val, setVal] = useState(0);
  const [lit, setLit] = useState(55);

  // Main HSB swatch
  const mainHex = hsbToHex(hue, sat, bri);
  const [mr, mg, mb] = hexToRgb(mainHex);
  const mainLum = 0.299 * mr + 0.587 * mg + 0.114 * mb;
  const mainTextColor = mainLum > 140 ? '#0a0a0f' : '#fff';
  const mainSubColor = mainLum > 140 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';

  // Value swatch
  const valuedBri = Math.round(bri * (1 - val / 100));
  const valHex = hsbToHex(hue, sat, Math.max(0, valuedBri));
  const [vr, vg, vb] = hexToRgb(valHex);
  const valLum = 0.299 * vr + 0.587 * vg + 0.114 * vb;
  const valTextColor = valLum > 140 ? '#0a0a0f' : '#fff';
  const valSubColor = valLum > 140 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';

  // Lightness swatch
  const litHex = hslToHex(hue, sat, lit);
  const [lr, lg, lb] = hexToRgb(litHex);
  const litLum = 0.299 * lr + 0.587 * lg + 0.114 * lb;
  const litTextColor = litLum > 140 ? '#0a0a0f' : '#fff';
  const litSubColor = litLum > 140 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';

  const hueBarBg = 'linear-gradient(to right,hsl(0,100%,50%),hsl(30,100%,50%),hsl(60,100%,50%),hsl(90,100%,50%),hsl(120,100%,50%),hsl(150,100%,50%),hsl(180,100%,50%),hsl(210,100%,50%),hsl(240,100%,50%),hsl(270,100%,50%),hsl(300,100%,50%),hsl(330,100%,50%),hsl(360,100%,50%))';
  const satBarBg = `linear-gradient(to right,hsl(${hue},0%,50%),hsl(${hue},100%,50%))`;
  const briBarBg = `linear-gradient(to right,#000,${hsbToHex(hue, Math.max(sat, 60), 100)})`;
  const valBarBg = `linear-gradient(to right,${mainHex},#000)`;
  const litBarBg = `linear-gradient(to right,#000,hsl(${hue},100%,50%),#fff)`;

  return (
    <section id="hsb-section">
      <div className="section-label">Part 06 — HSB / HSL Color Studio</div>
      <h2 className="section-title">Hue. Saturation.<br />Brightness. Value.</h2>
      <p className="section-desc">The HSB model describes color the way humans see it. Drag each slider to discover exactly how Hue, Saturation, Brightness, and Value transform a color.</p>

      <div className="hsb-layout">
        <div>
          {/* Hue */}
          <div className="hsb-row">
            <div className="hsb-row-header">
              <span className="hsb-row-title">🎨 Hue</span>
              <span className="hsb-row-val">{hue}°</span>
            </div>
            <input type="range" className="hsb-sl" min="0" max="360" value={hue} onChange={e => setHue(+e.target.value)} style={{ background: hueBarBg }} />
            <div className="hsb-hint">The pure color — its angle on the color wheel (0°–360°). 0°=Red, 120°=Green, 240°=Blue.</div>
          </div>

          {/* Saturation */}
          <div className="hsb-row">
            <div className="hsb-row-header">
              <span className="hsb-row-title">💧 Saturation</span>
              <span className="hsb-row-val">{sat}%</span>
            </div>
            <input type="range" className="hsb-sl" min="0" max="100" value={sat} onChange={e => setSat(+e.target.value)} style={{ background: satBarBg }} />
            <div className="hsb-hint">How vivid or gray — 0% is pure gray, 100% is the most vivid version of the hue.</div>
          </div>

          {/* Brightness */}
          <div className="hsb-row">
            <div className="hsb-row-header">
              <span className="hsb-row-title">☀️ Brightness</span>
              <span className="hsb-row-val">{bri}%</span>
            </div>
            <input type="range" className="hsb-sl" min="0" max="100" value={bri} onChange={e => setBri(+e.target.value)} style={{ background: briBarBg }} />
            <div className="hsb-hint">How dark or bright — 0% is always black, 100% at full saturation = pure vivid color.</div>
          </div>

          {/* Value (Shading) — accent styled */}
          <div className="hsb-row" style={{ background: 'rgba(232,255,71,0.04)', border: '1px solid rgba(232,255,71,0.12)', borderRadius: '12px', padding: '0.9rem', marginTop: '0.2rem' }}>
            <div className="hsb-row-header">
              <span className="hsb-row-title" style={{ color: 'var(--accent)' }}>🌑 Value (Shading)</span>
              <span className="hsb-row-val">{val}%</span>
            </div>
            <input type="range" className="hsb-sl" min="0" max="100" value={val} onChange={e => setVal(+e.target.value)} style={{ background: valBarBg }} />
            <div className="hsb-hint" style={{ color: 'rgba(232,255,71,0.6)' }}>How much black is mixed in — 0% = pure color, 100% = full black. This is the "Value" in color theory, controlling shade depth.</div>
            {/* Value steps inside slider card */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
              {STEPS.map(vv => {
                const stepBri = Math.round(bri * (1 - vv / 100));
                const hex = hsbToHex(hue, sat, Math.max(0, stepBri));
                return (
                  <div
                    key={vv}
                    style={{
                      flex: 1, height: '36px', borderRadius: '7px', background: hex,
                      border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', position: 'relative',
                      ...(Math.abs(vv - val) < 12 ? { outline: '2px solid white', outlineOffset: '2px' } : {}),
                    }}
                  >
                    <div style={{ position: 'absolute', bottom: '-1.1rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.56rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{vv}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lightness (HSL) */}
          <div className="hsb-row" style={{ marginTop: '1.5rem' }}>
            <div className="hsb-row-header">
              <span className="hsb-row-title">🌙 Lightness (HSL)</span>
              <span className="hsb-row-val">{lit}%</span>
            </div>
            <input type="range" className="hsb-sl" min="0" max="100" value={lit} onChange={e => setLit(+e.target.value)} style={{ background: litBarBg }} />
            <div className="hsb-hint">HSL lightness — 0%=black, 50%=pure hue, 100%=white. Different model from brightness.</div>
          </div>
        </div>

        <div>
          {/* Main HSB swatch */}
          <div className="hsb-main-swatch" style={{ background: mainHex }}>
            <div className="hsb-swatch-hex" style={{ color: mainTextColor }}>{mainHex.toUpperCase()}</div>
            <div className="hsb-swatch-vals" style={{ color: mainSubColor }}>H:{hue}° S:{sat}% B:{bri}% | {mainHex.toUpperCase()}</div>
          </div>

          {/* Value (shading) live preview */}
          <div style={{ marginTop: '0.8rem', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(232,255,71,0.2)' }}>
            <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '3px', background: valHex, transition: 'background .05s' }}>
              <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: '1.1rem', letterSpacing: '.04em', color: valTextColor }}>{valHex.toUpperCase()}</div>
              <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: valSubColor }}>Value: {val}% black mixed → B:{valuedBri}%</div>
            </div>
            <div style={{ padding: '0.5rem 0.9rem', background: 'rgba(0,0,0,0.3)', fontSize: '0.67rem', color: 'var(--accent)', textAlign: 'center' }}>↑ Value (shading) live preview</div>
          </div>

          {/* Lightness HSL live preview */}
          <div style={{ marginTop: '0.8rem', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '3px', background: litHex, transition: 'background .05s' }}>
              <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: '1.1rem', letterSpacing: '.04em', color: litTextColor }}>{litHex.toUpperCase()}</div>
              <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: litSubColor }}>HSL — H:{hue}° S:{sat}% L:{lit}%</div>
            </div>
            <div style={{ padding: '0.5rem 0.9rem', background: 'rgba(0,0,0,0.3)', fontSize: '0.67rem', color: 'var(--muted)', textAlign: 'center' }}>↑ Lightness (HSL) live preview</div>
          </div>

          {/* Saturation steps */}
          <div className="step-section">
            <div className="step-label">Saturation Steps (same Hue &amp; Brightness)</div>
            <div className="step-row">
              {STEPS.map(sv => (
                <div key={sv} className="step-swatch" style={{ background: hsbToHex(hue, sv, bri) }}>
                  <div className="step-pct">{sv}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Brightness steps */}
          <div className="step-section" style={{ marginTop: '1.6rem' }}>
            <div className="step-label">Brightness Steps (same Hue &amp; Saturation)</div>
            <div className="step-row">
              {STEPS.map(bv => (
                <div key={bv} className="step-swatch" style={{ background: hsbToHex(hue, sat, bv) }}>
                  <div className="step-pct">{bv}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lightness steps */}
          <div className="step-section" style={{ marginTop: '1.6rem' }}>
            <div className="step-label">Lightness Steps / HSL tints &amp; shades</div>
            <div className="step-row">
              {STEPS.map(lv => (
                <div
                  key={lv}
                  className="step-swatch"
                  style={{
                    background: hslToHex(hue, sat, lv),
                    ...(Math.abs(lv - lit) < 12 ? { outline: '2px solid white', outlineOffset: '2px', zIndex: 5 } : {}),
                  }}
                >
                  <div className="step-pct">{lv}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info cards — 4 cards */}
      <div className="hsb-cards" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="hsb-card">
          <div className="hsb-card-icon">🎨</div>
          <div className="hsb-card-title">Hue</div>
          <div className="hsb-card-desc">The "which color" — its degree on the wheel. 0°=Red, 120°=Green, 240°=Blue.</div>
        </div>
        <div className="hsb-card">
          <div className="hsb-card-icon">💧</div>
          <div className="hsb-card-title">Saturation</div>
          <div className="hsb-card-desc">How vivid or gray — 0% is neutral gray, 100% is the purest version of that hue.</div>
        </div>
        <div className="hsb-card">
          <div className="hsb-card-icon">☀️</div>
          <div className="hsb-card-title">Brightness</div>
          <div className="hsb-card-desc">How dark or bright — 0% is black, 100% at full saturation is a vivid pure color.</div>
        </div>
        <div className="hsb-card" style={{ borderColor: 'rgba(232,255,71,0.2)', background: 'rgba(232,255,71,0.04)' }}>
          <div className="hsb-card-icon">🌑</div>
          <div className="hsb-card-title" style={{ color: 'var(--accent)' }}>Value</div>
          <div className="hsb-card-desc">How much black is mixed into a color. 0% = pure, 100% = fully shaded to black. Creates depth.</div>
        </div>
      </div>
    </section>
  );
}

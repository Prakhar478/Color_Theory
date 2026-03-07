import { useState } from 'react';
import { hslToHex, hexToRgb, rgbToHex } from '../utils/colorUtils';

function hexToHSL(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0, s = 0, l = (max + min) / 2;
  if (d > 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d + 6) % 6 * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function genColors(baseHex, scheme) {
  const { h, s, l } = hexToHSL(baseHex);
  let hues;
  if (scheme === 'complementary') hues = [h, h + 180, (h + 180 + 30) % 360, (h + 180 - 30 + 360) % 360, (h + 20) % 360];
  else if (scheme === 'analogous') hues = [h, (h - 30 + 360) % 360, (h + 30) % 360, (h - 60 + 360) % 360, (h + 60) % 360];
  else if (scheme === 'triadic') hues = [h, (h + 120) % 360, (h + 240) % 360, (h + 40) % 360, (h + 200) % 360];
  else if (scheme === 'split') hues = [h, (h + 150) % 360, (h + 210) % 360, (h + 180) % 360, (h + 30) % 360];
  else if (scheme === 'monochromatic') hues = [h, h, h, h, h];
  else hues = [h, (h + 137) % 360, (h + 251) % 360, (h + 98) % 360, (h + 196) % 360];
  const lights = scheme === 'monochromatic' ? [20, 35, 50, 65, 80] : [l, l, l, Math.min(l + 15, 90), Math.max(l - 15, 10)];
  const sats = scheme === 'monochromatic' ? [s, s, s, s, s] : [s, Math.min(s + 10, 100), s, s, s];
  return hues.map((h2, i) => hslToHex(h2, sats[i] || s, lights[i] || l));
}

export default function PaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#3366ff');
  const [scheme, setScheme] = useState('complementary');
  const [colors, setColors] = useState(() => genColors('#3366ff', 'complementary'));
  const [saved, setSaved] = useState([]);

  const generate = () => {
    setColors(genColors(baseColor, scheme));
  };

  const save = () => {
    if (!colors.length) return;
    setSaved(prev => [...prev, [...colors]]);
  };

  return (
    <section id="generator-section">
      <div className="section-label">Part 10 — Palette Generator</div>
      <h2 className="section-title">Generate your<br />own palette.</h2>
      <p className="section-desc">Pick a base color and scheme. Click Generate to create a 5-color palette. Save palettes you like.</p>

      <div className="gen-controls">
        <div className="gen-base-row">
          <input type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)}
            style={{ width: '48px', height: '48px', border: 'none', borderRadius: '10px', cursor: 'pointer', outline: '2px solid var(--border)', outlineOffset: '2px', background: 'none', padding: 0 }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Base Color</span>
        </div>
        <select className="gen-scheme-select" value={scheme} onChange={e => setScheme(e.target.value)}>
          <option value="complementary">Complementary</option>
          <option value="analogous">Analogous</option>
          <option value="triadic">Triadic</option>
          <option value="split">Split-Complementary</option>
          <option value="monochromatic">Monochromatic</option>
          <option value="random">Random Harmony</option>
        </select>
        <button className="gen-btn" onClick={generate}>✦ Generate</button>
        <button className="gen-btn secondary" onClick={save}>⊕ Save Palette</button>
      </div>

      <div className="gen-palette">
        {colors.map((hex, i) => (
          <div key={i} className="gen-swatch" style={{ background: hex }}
            onClick={() => { navigator.clipboard.writeText(hex).catch(() => {}); }}>
            <div className="gen-swatch-label">{hex.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {saved.length > 0 && (
        <div id="genSaved" className="gen-saved">
          {saved.map((pal, i) => (
            <div key={i} className="gen-saved-card">
              <div className="gen-saved-strip">
                {pal.map(hex => <div key={hex} style={{ flex: 1, background: hex }} />)}
              </div>
              <div className="gen-saved-label">Palette {i + 1}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

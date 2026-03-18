import { useState, useEffect } from 'react';
import { emitColor } from '../utils/colorBus';
import { hslToHex, hexToRgb, rgbToHex } from '../utils/colorUtils';

const GRAD_GALLERY = [
  { name: 'Sunset', stops: ['#ff6b35', '#f7931e', '#ffcd3c'] },
  { name: 'Ocean', stops: ['#1a6b8a', '#0ea5e9', '#7dd3fc'] },
  { name: 'Aurora', stops: ['#0f0c29', '#302b63', '#24243e'] },
  { name: 'Neon', stops: ['#e8ff47', '#00ffcc', '#3366ff'] },
  { name: 'Rose', stops: ['#ff9a9e', '#fecfef', '#ffecd2'] },
  { name: 'Forest', stops: ['#134e5e', '#71b280'] },
  { name: 'Lava', stops: ['#200122', '#6f0000', '#cc2200'] },
  { name: 'Candy', stops: ['#fd1d1d', '#fcb045', '#833ab4'] },
  { name: 'Arctic', stops: ['#1a2a6c', '#b21f1f', '#fdbb2d'] },
  { name: 'Mint', stops: ['#aaffa9', '#11ffbd'] },
  { name: 'Dusk', stops: ['#2c3e50', '#3498db', '#e74c3c'] },
  { name: 'Gold', stops: ['#f7971e', '#ffd200'] },
];

function buildGradCSS(type, colors, angle) {
  const stops = colors.join(', ');
  if (type === 'linear') return `linear-gradient(${angle}deg, ${stops})`;
  if (type === 'radial') return `radial-gradient(circle, ${stops})`;
  return `conic-gradient(from ${angle}deg, ${stops})`;
}

export default function Gradients() {
  const [gradType, setGradType] = useState('linear');
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState(['#e8ff47', '#3366ff', '#ff3366']);

  useEffect(() => { emitColor(stops[0], 'Gradient Builder'); }, [stops]);
  const showAngle = gradType !== 'radial';
  const gradCSS = buildGradCSS(gradType, stops, angle);

  const updateStop = (i, color) => {
    const newStops = [...stops];
    newStops[i] = color;
    setStops(newStops);
  };

  const applyGallery = (galleryStops) => {
    const newStops = [...stops];
    galleryStops.forEach((c, i) => { if (newStops[i] !== undefined) newStops[i] = c; });
    setStops(newStops);
  };

  return (
    <section id="gradient-section">
      <div className="section-label">Part 12 — Gradients</div>
      <h2 className="section-title">Smooth color<br />transitions.</h2>
      <p className="section-desc">A gradient transitions smoothly between colors. Build your own below or click any from the gallery.</p>

      <div className="grad-layout">
        {/* Type buttons */}
        <div className="grad-type-btns">
          {['linear', 'radial', 'conic'].map(t => (
            <button
              key={t}
              className={`grad-type-btn${gradType === t ? ' active' : ''}`}
              onClick={() => setGradType(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Angle row — hidden for radial */}
        <div
          id="gradAngleRow"
          style={{ display: showAngle ? 'grid' : 'none', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center', marginBottom: '1rem' }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.4rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>Angle (Linear &amp; Conic)</div>
            <input
              type="range" min="0" max="360" value={angle}
              onChange={e => setAngle(+e.target.value)}
              style={{ width: '100%', height: '6px', borderRadius: '999px', WebkitAppearance: 'none', background: 'linear-gradient(to right,#333,#888)', outline: 'none', cursor: 'pointer' }}
            />
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>{angle}°</div>
        </div>

        {/* Color stops */}
        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.5rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>Color Stops</div>
        <div className="grad-stops">
          {stops.map((stop, i) => (
            <div key={i} className="grad-stop">
              <input
                type="color"
                className="grad-stop-swatch"
                value={stop}
                onChange={e => updateStop(i, e.target.value)}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Stop {i + 1}</span>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="grad-preview" id="gradPreview" style={{ background: gradCSS }} />

        {/* CSS code */}
        <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted)', padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '2rem', wordBreak: 'break-all' }}>
          background: {gradCSS};
        </div>

        {/* Gallery */}
        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Gallery — click to use</div>
        <div className="grad-gallery">
          {GRAD_GALLERY.map(g => {
            const galCSS = buildGradCSS('linear', g.stops, 135);
            return (
              <div
                key={g.name}
                className="grad-card"
                style={{ background: galCSS }}
                onClick={() => applyGallery(g.stops)}
              >
                <div className="grad-card-label">{g.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

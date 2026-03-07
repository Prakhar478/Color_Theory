import { useState, useEffect } from 'react';

const STEPS = 8;

function buildStrips(h) {
  const shades = [];
  const tints = [];
  const tones = [];
  for (let i = 0; i < STEPS; i++) {
    const t = i / (STEPS - 1);
    // Shade: lightness 50% → 5%
    const sL = Math.round(50 - t * 45);
    shades.push(`hsl(${h},100%,${sL}%)`);
    // Tint: lightness 50% → 97%
    const tiL = Math.round(50 + t * 47);
    tints.push(`hsl(${h},100%,${tiL}%)`);
    // Tone: saturation 100% → 10%
    const toS = Math.round(100 - t * 90);
    tones.push(`hsl(${h},${toS}%,50%)`);
  }
  return { shades, tints, tones };
}

export default function ColorValues() {
  const [hue, setHue] = useState(200);
  const { shades, tints, tones } = buildStrips(hue);

  return (
    <section id="values-section">
      <div className="section-label">Part 03 — Color Values</div>
      <h2 className="section-title">Shades, Tints<br />&amp; Tones.</h2>
      <p className="section-desc">Every color has three dimensions of depth. Pick any hue below and watch how adding black (shade), white (tint), or gray (tone) transforms it.</p>

      {/* Hue picker */}
      <div style={{ marginTop: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>Choose Hue</span>
          <input
            type="range"
            min="0" max="360"
            value={hue}
            onChange={e => setHue(+e.target.value)}
            style={{
              flex: 1, minWidth: '120px', height: '10px', borderRadius: '999px',
              WebkitAppearance: 'none', outline: 'none', cursor: 'pointer',
              background: 'linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))',
            }}
          />
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.2)', background: `hsl(${hue},100%,50%)`, transition: 'background .1s' }} />
          <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>{hue}°</span>
        </div>
      </div>

      {/* Strip cards */}
      <div className="values-grid" style={{ marginTop: '1.5rem' }}>
        {/* Shades */}
        <div className="values-card">
          <div className="values-card-title">🌑 Shades</div>
          <div className="values-card-desc">Pure color + black. Darker and moodier.</div>
          <div className="values-strip">
            {shades.map((bg, i) => (
              <div key={i} style={{ background: bg }} title={bg} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.5rem', fontSize: '0.6rem', color: 'var(--muted)' }}>
            <span>Pure</span><span>+Black →</span>
          </div>
        </div>

        {/* Tints */}
        <div className="values-card">
          <div className="values-card-title">☀️ Tints</div>
          <div className="values-card-desc">Pure color + white. Lighter and airier.</div>
          <div className="values-strip">
            {tints.map((bg, i) => (
              <div key={i} style={{ background: bg }} title={bg} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.5rem', fontSize: '0.6rem', color: 'var(--muted)' }}>
            <span>Pure</span><span>+White →</span>
          </div>
        </div>

        {/* Tones */}
        <div className="values-card">
          <div className="values-card-title">🌫️ Tones</div>
          <div className="values-card-desc">Pure color + gray. Muted and sophisticated.</div>
          <div className="values-strip">
            {tones.map((bg, i) => (
              <div key={i} style={{ background: bg }} title={bg} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.5rem', fontSize: '0.6rem', color: 'var(--muted)' }}>
            <span>Pure</span><span>+Gray →</span>
          </div>
        </div>
      </div>
    </section>
  );
}

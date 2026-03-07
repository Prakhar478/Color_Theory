const PALETTES = [
  {
    name: 'Complementary',
    desc: 'Orange & Blue — max contrast, energetic. Opposite hues create visual tension.',
    colors: ['#FF6B35', '#FF9A5C', '#FFD4B8', '#0D5C8C', '#1A8FD1'],
  },
  {
    name: 'Analogous',
    desc: 'Green→Teal — harmonious, natural, soothing. Adjacent hues flow together.',
    colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#A8E6CF'],
  },
  {
    name: 'Triadic',
    desc: 'Red, Yellow, Blue — vibrant and balanced. Three equidistant hues.',
    colors: ['#E63946', '#FFBE0B', '#457B9D', '#A8DADC', '#F1FAEE'],
  },
  {
    name: 'Monochromatic',
    desc: 'Shades of Violet — elegant and refined. One hue from dark to light.',
    colors: ['#1A0533', '#3D0066', '#6A0DAD', '#B14FE5', '#DDA0FF'],
  },
];

function cpHex(h, el) {
  navigator.clipboard.writeText(h).catch(() => {});
  const o = el.textContent;
  el.textContent = 'Copied!';
  el.style.color = 'var(--accent)';
  setTimeout(() => { el.textContent = o; el.style.color = ''; }, 1200);
}

export default function PaletteSection() {
  return (
    <section id="palette-section">
      <div className="section-label">Part 02 — Color Schemes</div>
      <h2 className="section-title">Four ways<br />colors relate.</h2>
      <p className="section-desc">Hover swatches to expand. Click any HEX to copy it. Each palette follows a structured color theory approach.</p>

      <div className="palette-grid">
        {PALETTES.map(p => (
          <div className="palette-card" key={p.name}>
            <div className="palette-swatch">
              {p.colors.map(c => (
                <div key={c} style={{ background: c }} title={c} />
              ))}
            </div>
            <div className="palette-info">
              <div className="palette-name">{p.name}</div>
              <div className="palette-desc">{p.desc}</div>
              <div className="palette-colors">
                {p.colors.map(c => (
                  <span
                    key={c}
                    className="htag"
                    style={{ borderLeft: `3px solid ${c}` }}
                    onClick={e => cpHex(c, e.currentTarget)}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

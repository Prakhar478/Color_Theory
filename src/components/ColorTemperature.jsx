const TEMP_CARDS = [
  { swatch: 'linear-gradient(135deg,#1a0a3e,#3344dd)', title: '❄️ Cool Colors', desc: 'Blues, purples, cool greens. Recede, feel distant, calm, professional. Used in tech & healthcare.', kelvin: '5,000K – 10,000K' },
  { swatch: 'linear-gradient(135deg,#f5f0e8,#ffe8cc)', title: '🌤️ Neutral', desc: 'Whites with a warm cast, cream tones. Feel natural and inviting like midday sunlight.', kelvin: '~4,000–5,500K (Daylight)' },
  { swatch: 'linear-gradient(135deg,#ff8800,#ffcc00)', title: '🔥 Warm Colors', desc: 'Yellows, oranges, reds. Advance toward the viewer, feel energetic, urgent, and inviting.', kelvin: '2,700K – 4,000K' },
  { swatch: 'linear-gradient(135deg,#cc2200,#880000)', title: '🌋 Hot Colors', desc: 'Deep reds and warm crimsons. Most intense warm tones — passionate, alarming, powerful.', kelvin: '1,800K – 2,200K' },
  { swatch: 'linear-gradient(135deg,#3d6b3d,#88cc44)', title: '🌿 Neutral Hue', desc: 'Greens sit in the middle — neither warm nor cool. Feel balanced, natural, and organic.', kelvin: 'Context-dependent' },
  { swatch: 'linear-gradient(135deg,rgba(30,50,120,0.8),rgba(120,50,10,0.8))', title: '🎨 Mixing Temps', desc: 'Cool + warm in one palette creates dynamic tension. Great for highlighting contrast in UI.', kelvin: "Designer's choice" },
];

export default function ColorTemperature() {
  return (
    <section id="temperature-section">
      <div className="section-label">Part 08 — Color Temperature</div>
      <h2 className="section-title">Warm vs Cool.<br />The feel of color.</h2>
      <p className="section-desc">Colors have a perceived temperature. Warm colors advance and energize. Cool colors recede and calm. This deeply affects emotional response to any design.</p>

      <div className="temp-spectrum">
        <div className="temp-bar" />
        <div className="temp-labels">
          <span>← Cool (10,000K) Blues/Purples</span>
          <span>Neutral White (5,500K)</span>
          <span>Warm (1,800K) Reds/Oranges →</span>
        </div>
      </div>

      <div className="temp-grid">
        {TEMP_CARDS.map(card => (
          <div className="temp-card" key={card.title}>
            <div className="temp-card-swatch" style={{ background: card.swatch }} />
            <div className="temp-card-body">
              <div className="temp-card-title">{card.title}</div>
              <div className="temp-card-desc">{card.desc}</div>
              <div className="temp-kelvin">{card.kelvin}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

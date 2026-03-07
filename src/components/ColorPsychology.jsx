import { useState } from 'react';

const PSYCH = [
  { name: 'Red',    hex: '#E63946', bg: 'rgba(230,57,70,0.1)',   mood: 'Energy, passion, urgency',        uses: 'CTAs, food brands, warnings' },
  { name: 'Orange', hex: '#FF9A3C', bg: 'rgba(255,154,60,0.1)',  mood: 'Creativity, warmth, enthusiasm',  uses: 'Youth brands, action prompts' },
  { name: 'Yellow', hex: '#FFBE0B', bg: 'rgba(255,190,11,0.1)',  mood: 'Optimism, clarity, warmth',       uses: 'Highlights, discount labels' },
  { name: 'Green',  hex: '#2DC653', bg: 'rgba(45,198,83,0.1)',   mood: 'Growth, health, balance',         uses: 'Finance, eco, wellness' },
  { name: 'Blue',   hex: '#1A8FD1', bg: 'rgba(26,143,209,0.1)',  mood: 'Trust, calm, professionalism',    uses: 'Banks, tech, healthcare' },
  { name: 'Violet', hex: '#7B2FBE', bg: 'rgba(123,47,190,0.1)', mood: 'Luxury, creativity, mystery',     uses: 'Beauty, AI, premium brands' },
  { name: 'Pink',   hex: '#FF4D8D', bg: 'rgba(255,77,141,0.1)', mood: 'Playfulness, romance, softness',  uses: 'Fashion, beauty, children' },
  { name: 'Black',  hex: '#222',    bg: 'rgba(255,255,255,0.04)',mood: 'Sophistication, power, elegance', uses: 'Luxury fashion, high-end tech' },
];

export default function ColorPsychology() {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="psychology-section">
      <div className="section-label">Part 06 — Color Psychology</div>
      <h2 className="section-title">Colors carry<br />emotion.</h2>
      <p className="section-desc">Every color has psychological associations that skilled designers use deliberately to guide mood and behavior.</p>

      <div className="psych-grid">
        {PSYCH.map(c => (
          <div
            key={c.name}
            className="psych-card"
            style={{
              background: c.bg,
              borderColor: hovered === c.name ? c.hex + 'aa' : c.hex + '44',
              boxShadow: hovered === c.name ? `0 8px 32px -8px ${c.hex}88` : '',
            }}
            onMouseEnter={() => setHovered(c.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="psych-dot" style={{ background: c.hex, boxShadow: `0 0 14px ${c.hex}88` }} />
            <div className="psych-name">{c.name}</div>
            <div className="psych-mood">{c.mood}</div>
            <div className="psych-uses">Used in: {c.uses}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

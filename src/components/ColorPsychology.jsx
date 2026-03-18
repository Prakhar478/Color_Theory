import { useState, useRef, useEffect } from 'react';

const PSYCH = [
  {
    name: 'Red',    hex: '#E63946', bg: 'rgba(230,57,70,0.1)',
    mood: 'Energy, passion, urgency',
    uses: 'CTAs, food brands, warnings',
    detail: 'Red raises heart rate and creates urgency. Fast-food chains, sale labels, and emergency alerts all use red deliberately. It is the most attention-grabbing color in the visible spectrum.',
    brands: ['Coca-Cola', 'Netflix', 'YouTube', 'Target'],
    avoid: 'Finance, healthcare (feels risky or alarming)',
  },
  {
    name: 'Orange', hex: '#FF9A3C', bg: 'rgba(255,154,60,0.1)',
    mood: 'Creativity, warmth, enthusiasm',
    uses: 'Youth brands, action prompts',
    detail: 'Orange blends the energy of red with the optimism of yellow. It feels friendly and approachable without aggression. Great for call-to-action buttons that need to stand out from blue defaults.',
    brands: ['Amazon', 'Fanta', 'Etsy', 'Harley Davidson'],
    avoid: 'Luxury brands, formal finance',
  },
  {
    name: 'Yellow', hex: '#FFBE0B', bg: 'rgba(255,190,11,0.1)',
    mood: 'Optimism, clarity, warmth',
    uses: 'Highlights, discount labels, alerts',
    detail: 'Yellow is the most visible color to the human eye. It triggers optimism and mental clarity but causes eye strain in large doses. Best used as a focused accent, not a dominant background.',
    brands: ['IKEA', 'McDonalds', 'Snapchat', 'Post-it'],
    avoid: 'Medical, legal contexts (feels unserious)',
  },
  {
    name: 'Green',  hex: '#2DC653', bg: 'rgba(45,198,83,0.1)',
    mood: 'Growth, health, balance',
    uses: 'Finance, eco brands, wellness',
    detail: 'Green is associated with nature, safety, and financial growth. It is the easiest color for the human eye to process. Dark greens feel prestigious; bright greens feel fresh and organic.',
    brands: ['Whole Foods', 'Spotify', 'Starbucks', 'John Deere'],
    avoid: 'Heavy tech, luxury fashion',
  },
  {
    name: 'Blue',   hex: '#1A8FD1', bg: 'rgba(26,143,209,0.1)',
    mood: 'Trust, calm, professionalism',
    uses: 'Banks, tech companies, healthcare',
    detail: 'Blue is the most common corporate color globally. It conveys reliability and security. Darker blues feel authoritative; lighter blues feel open and modern. Avoids appetite stimulation, so common in non-food apps.',
    brands: ['Facebook', 'Samsung', 'PayPal', 'Ford'],
    avoid: 'Food brands (suppresses appetite)',
  },
  {
    name: 'Violet', hex: '#7B2FBE', bg: 'rgba(123,47,190,0.1)',
    mood: 'Luxury, creativity, mystery',
    uses: 'Beauty, AI brands, premium products',
    detail: 'Violet sits between the energy of red and the calm of blue. It has strong associations with royalty, magic, and premium quality. AI companies increasingly adopt purple to signal intelligence and innovation.',
    brands: ['Cadbury', 'Hallmark', 'Twitch', 'FedEx'],
    avoid: 'Outdoor sports, heavy industry',
  },
  {
    name: 'Pink',   hex: '#FF4D8D', bg: 'rgba(255,77,141,0.1)',
    mood: 'Playfulness, romance, softness',
    uses: 'Fashion, beauty, children brands',
    detail: 'Pink softens the intensity of red into something more approachable. Hot pinks feel bold and modern; pastel pinks feel nurturing. It has expanded well beyond gender associations into mainstream branding.',
    brands: ['Barbie', 'T-Mobile', 'Dunkin', 'Victoria Secret'],
    avoid: 'Heavy industry, traditional finance',
  },
  {
    name: 'Black',  hex: '#444', bg: 'rgba(255,255,255,0.04)',
    mood: 'Sophistication, power, elegance',
    uses: 'Luxury fashion, high-end technology',
    detail: 'Black communicates premium quality and timelessness. It absorbs other colors rather than competing with them, making every other element pop. Apple pioneered black in consumer tech to signal premium status.',
    brands: ['Apple', 'Chanel', 'Nike', 'Prada'],
    avoid: 'Childrens brands, friendly healthcare',
  },
];

export default function ColorPsychology() {
  const [selected, setSelected] = useState(null);
  const detailRef = useRef(null);

  // Smooth scroll to detail panel whenever it opens
  useEffect(() => {
    if (selected !== null && detailRef.current) {
      setTimeout(() => {
        detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80);
    }
  }, [selected]);

  const active = selected !== null ? PSYCH[selected] : null;

  return (
    <section id="psychology-section">
      <div className="section-label">Part 06 - Color Psychology</div>
      <h2 className="section-title">Colors carry<br />emotion.</h2>
      <p className="section-desc">
        Every color triggers psychological associations that designers use deliberately.{' '}
        <strong style={{ color: 'var(--accent)' }}>Click any card</strong> to see brand examples, best uses, and what to avoid.
      </p>

      <div className="psych-grid">
        {PSYCH.map((c, i) => (
          <div
            key={c.name}
            className="psych-card"
            style={{
              background:   selected === i ? c.hex + '22' : c.bg,
              borderColor:  selected === i ? c.hex + 'cc' : c.hex + '44',
              boxShadow:    selected === i ? '0 8px 32px -8px ' + c.hex + '88' : '',
              cursor: 'pointer',
              transform:    selected === i ? 'translateY(-4px) scale(1.02)' : '',
              transition:   'all 0.2s',
              outline:      selected === i ? '2px solid ' + c.hex + '66' : 'none',
              outlineOffset: '2px',
            }}
            onClick={() => setSelected(selected === i ? null : i)}
          >
            <div className="psych-dot" style={{ background: c.hex, boxShadow: '0 0 14px ' + c.hex + '88' }} />
            <div className="psych-name">{c.name}</div>
            <div className="psych-mood">{c.mood}</div>
            <div className="psych-uses">Used in: {c.uses}</div>
            <div style={{ marginTop: '0.4rem', fontSize: '0.58rem', letterSpacing: '.08em', color: selected === i ? 'var(--accent)' : 'rgba(255,255,255,0.28)' }}>
              {selected === i ? 'CLICK TO CLOSE' : 'CLICK FOR MORE'}
            </div>
          </div>
        ))}
      </div>

      {/* Detail panel â€” scrolls into view on open */}
      {active && (
        <div
          ref={detailRef}
          style={{
            marginTop: '1.5rem',
            padding: '1.8rem',
            borderRadius: '18px',
            border: '1px solid ' + active.hex + '55',
            background: active.hex + '10',
            animation: 'psychFadeIn 0.25s ease',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: active.hex, border: '3px solid rgba(255,255,255,0.25)', boxShadow: '0 0 24px ' + active.hex + '66', flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: '1.4rem' }}>{active.name}</div>
              <div style={{ fontSize: '0.75rem', color: active.hex, fontWeight: 600 }}>{active.mood}</div>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ marginLeft: 'auto', padding: '0.35rem 0.9rem', borderRadius: '999px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', fontSize: '0.72rem', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>

          {/* Three columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1.2rem' }}>
            {/* About */}
            <div>
              <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>About This Color</div>
              <div style={{ fontSize: '0.8rem', color: '#ccc', lineHeight: 1.75 }}>{active.detail}</div>
            </div>

            {/* Brands */}
            <div>
              <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Known Brands</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {active.brands.map(b => (
                  <div key={b} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: active.hex + '20', border: '1px solid ' + active.hex + '44', fontSize: '0.78rem', color: '#ddd' }}>
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* Use + Avoid */}
            <div>
              <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Best Used For</div>
              <div style={{ padding: '0.7rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', fontSize: '0.78rem', color: '#ccc', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                {active.uses}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Avoid In</div>
              <div style={{ padding: '0.7rem', borderRadius: '10px', background: 'rgba(220,50,50,0.07)', border: '1px solid rgba(220,50,50,0.2)', fontSize: '0.78rem', color: '#ffaaaa', lineHeight: 1.7 }}>
                {active.avoid}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes psychFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

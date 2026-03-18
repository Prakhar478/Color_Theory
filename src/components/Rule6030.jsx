import { useState, useEffect } from 'react';
import { emitColor } from '../utils/colorBus';

export default function Rule6030() {
  const [c60, setC60] = useState('#1a2744');
  const [c30, setC30] = useState('#2d4a8a');
  const [c10, setC10] = useState('#e8ff47');
  useEffect(() => { emitColor(c60, '60-30-10 Rule'); }, [c60]);

  return (
    <section id="rule-section">
      <div className="section-label">Part 11 — The 60-30-10 Rule</div>
      <h2 className="section-title">The golden ratio<br />of color.</h2>
      <p className="section-desc">Pick three colors below and watch how the 60-30-10 rule creates a balanced, professional-looking composition in real time.</p>

      <div className="rule-layout">
        {/* Visual preview */}
        <div>
          <div className="rule-visual">
            <div className="rule-room">
              <div id="ruleDom" style={{ position: 'absolute', inset: 0, background: c60, transition: 'background .3s' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%', background: c30, transition: 'background .3s', borderTop: '3px solid rgba(0,0,0,0.12)' }} />
              <div style={{ position: 'absolute', top: '12%', left: '8%', width: '28%', height: '58%', borderRadius: '10px', background: c10, transition: 'background .3s', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }} />
              <div style={{ position: 'absolute', top: '18%', right: '7%', width: '20%', height: '42%', borderRadius: '8px', background: c10, transition: 'background .3s', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }} />
              <div style={{ position: 'absolute', bottom: '40%', left: '38%', right: '38%', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }} />
            </div>
            <div style={{ padding: '0.7rem 1rem', background: 'rgba(0,0,0,0.35)', display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--muted)' }}>
              <span>↑ Live composition preview</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="rule-controls">
          {/* 60% */}
          <div className="rule-row">
            <div className="rule-row-header">
              <span className="rule-row-title">60% — Dominant</span>
              <span className="rule-row-pct">Background / Walls</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input type="color" value={c60} onChange={e => setC60(e.target.value)}
                style={{ width: '48px', height: '48px', border: 'none', borderRadius: '10px', cursor: 'pointer', outline: '2px solid var(--border)', padding: 0, background: 'none' }} />
              <div style={{ flex: 1, height: '40px', borderRadius: '8px', background: c60, transition: 'background .2s' }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.4rem' }}>Sets the overall mood. Should be calm and subtle — fills most of the space.</div>
          </div>

          {/* 30% */}
          <div className="rule-row">
            <div className="rule-row-header">
              <span className="rule-row-title">30% — Secondary</span>
              <span className="rule-row-pct">Floors / Furniture</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input type="color" value={c30} onChange={e => setC30(e.target.value)}
                style={{ width: '48px', height: '48px', border: 'none', borderRadius: '10px', cursor: 'pointer', outline: '2px solid var(--border)', padding: 0, background: 'none' }} />
              <div style={{ flex: 1, height: '40px', borderRadius: '8px', background: c30, transition: 'background .2s' }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.4rem' }}>Supports dominant color. Creates depth without competing.</div>
          </div>

          {/* 10% */}
          <div className="rule-row">
            <div className="rule-row-header">
              <span className="rule-row-title">10% — Accent</span>
              <span className="rule-row-pct">Decor / Highlights</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input type="color" value={c10} onChange={e => setC10(e.target.value)}
                style={{ width: '48px', height: '48px', border: 'none', borderRadius: '10px', cursor: 'pointer', outline: '2px solid var(--border)', padding: 0, background: 'none' }} />
              <div style={{ flex: 1, height: '40px', borderRadius: '8px', background: c10, transition: 'background .2s' }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.4rem' }}>The pop of color. Often complementary — draws the eye to key elements.</div>
          </div>

          <div className="rule-info-cards">
            <div className="rule-info-card" style={{ borderColor: c60 + '88', background: c60 + '22' }}>
              <div className="rule-pct-big">60%</div>
              <div className="rule-role">Dominant</div>
            </div>
            <div className="rule-info-card" style={{ borderColor: c30 + '88', background: c30 + '22' }}>
              <div className="rule-pct-big">30%</div>
              <div className="rule-role">Secondary</div>
            </div>
            <div className="rule-info-card" style={{ borderColor: c10 + '88', background: c10 + '22' }}>
              <div className="rule-pct-big">10%</div>
              <div className="rule-role">Accent</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

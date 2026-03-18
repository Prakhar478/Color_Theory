import { useState, useEffect } from 'react';
import { emitColor } from '../utils/colorBus';
import { luminance } from '../utils/colorUtils';

function cRatio(a, b) {
  const la = luminance(a), lb = luminance(b);
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

const WCAG_BADGES = [
  { label: 'AA Normal',  threshold: 4.5 },
  { label: 'AA Large',   threshold: 3 },
  { label: 'AAA Normal', threshold: 7 },
  { label: 'AAA Large',  threshold: 4.5 },
];

export default function ContrastChecker() {
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#1a1a2e');

  const isValidHex = hex => /^#[0-9a-f]{6}$/i.test(hex);
  useEffect(() => { if (isValidHex(bgColor)) emitColor(bgColor, 'Contrast Checker'); }, [bgColor]);
  const ratio = isValidHex(textColor) && isValidHex(bgColor) ? cRatio(textColor, bgColor) : null;

  const handleTextPicker = (e) => {
    setTextColor(e.target.value);
  };
  const handleTextInput = (e) => {
    const val = e.target.value;
    setTextColor(val);
  };
  const handleBgPicker = (e) => {
    setBgColor(e.target.value);
  };
  const handleBgInput = (e) => {
    const val = e.target.value;
    setBgColor(val);
  };

  return (
    <section id="contrast-section">
      <div className="section-label">Part 05 — Contrast &amp; Readability</div>
      <h2 className="section-title">Good design<br />is readable.</h2>
      <p className="section-desc">WCAG requires 4.5:1 contrast ratio for normal text. Pick any two colors and see if they pass accessibility standards in real-time.</p>

      <div className="contrast-tool">
        <div>
          <div className="cpicker">
            <label>Text Color</label>
            <div className="color-row">
              <input type="color" value={isValidHex(textColor) ? textColor : '#ffffff'} onChange={handleTextPicker} />
              <input
                type="text"
                className="hex-in"
                value={textColor}
                maxLength={7}
                onChange={handleTextInput}
                onBlur={e => { if (!isValidHex(e.target.value)) setTextColor('#ffffff'); }}
              />
            </div>
          </div>
          <div style={{ height: '.9rem' }} />
          <div className="cpicker">
            <label>Background Color</label>
            <div className="color-row">
              <input type="color" value={isValidHex(bgColor) ? bgColor : '#1a1a2e'} onChange={handleBgPicker} />
              <input
                type="text"
                className="hex-in"
                value={bgColor}
                maxLength={7}
                onChange={handleBgInput}
                onBlur={e => { if (!isValidHex(e.target.value)) setBgColor('#1a1a2e'); }}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="contrast-preview">
            <div
              className="contrast-inner"
              style={{
                color: isValidHex(textColor) ? textColor : undefined,
                background: isValidHex(bgColor) ? bgColor : undefined,
              }}
            >
              <h3>The quick brown fox</h3>
              <p>Color contrast is the difference in brightness between foreground and background. Good contrast is essential for readability and accessibility for all users.</p>
            </div>
            <div className="contrast-score">
              <div>
                <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginBottom: '.2rem' }}>CONTRAST RATIO</div>
                <div className="contrast-ratio">{ratio ? ratio.toFixed(2) + ':1' : '—'}</div>
              </div>
              <div className="badges">
                {ratio !== null && WCAG_BADGES.map(b => (
                  <div key={b.label} className={`badge ${ratio >= b.threshold ? 'pass' : 'fail'}`}>
                    {ratio >= b.threshold ? '✓ ' : '✗ '}{b.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

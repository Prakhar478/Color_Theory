// Global color event bus + reactive CSS variable updater
// Usage: emitColor('#FF5733', 'RGB Mixer')

function hexToRgba(hex, alpha) {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map(x => x+x).join('') : c;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function emitColor(hex, from = 'Selected') {
  if (typeof window === 'undefined') return;
  if (!/^#[0-9a-fA-F]{6}$/i.test(hex)) return;

  // Update CSS vars so entire UI reacts to the color
  const root = document.documentElement;
  root.style.setProperty('--live-color',     hex);
  root.style.setProperty('--live-color-dim', hexToRgba(hex, 0.14));
  root.style.setProperty('--live-color-mid', hexToRgba(hex, 0.35));

  window.dispatchEvent(new CustomEvent('color-select', {
    detail: { hex, from }
  }));
}

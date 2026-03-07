export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x =>
    Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')
  ).join('');
}

export function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function hsbToHex(h, s, b) {
  s /= 100; b /= 100;
  const k = n => (n + h / 60) % 6;
  const f = n => b - b * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  return rgbToHex(f(5) * 255, f(3) * 255, f(1) * 255);
}

export function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

export function luminance(hex) {
  return hexToRgb(hex).reduce((acc, c, i) => {
    const s = c / 255;
    const v = s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    return acc + [0.2126, 0.7152, 0.0722][i] * v;
  }, 0);
}

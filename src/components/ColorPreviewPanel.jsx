import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sections that have interactive color pickers — panel shows only for these
const PANEL_SECTIONS = new Set(['rgb-section']);

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map(x => x+x).join('') : c;
  if (!/^[0-9a-f]{6}$/i.test(full)) return { r: 0, g: 0, b: 0 };
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function hexToHsl(hex) {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (d > 0) {
    s = d / (1 - Math.abs(2*l - 1));
    if (max === r)      h = ((g - b) / d + 6) % 6 * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else                h = ((r - g) / d + 4) * 60;
  }
  return { h: Math.round(h), s: Math.round(s*100), l: Math.round(l*100) };
}

function getLum(hex) {
  const { r, g, b } = hexToRgb(hex);
  const f = c => { const s = c/255; return s <= 0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055, 2.4); };
  return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
}

function wcag(hex) {
  const ratio = (Math.max(getLum(hex), 0.008) + 0.05) / (Math.min(getLum(hex), 0.008) + 0.05);
  const r = (getLum(hex) + 0.05) / (getLum('#090910') + 0.05);
  const cr = r < 1 ? 1/r : r;
  if (cr >= 7)   return { label:'AAA', clr:'#4ade80' };
  if (cr >= 4.5) return { label:'AA',  clr:'#86efac' };
  if (cr >= 3)   return { label:'AA+', clr:'#fde68a' };
  return           { label:'Low', clr:'#f87171' };
}

export default function ColorPreviewPanel({ activeSection }) {
  const [color,  setColor]  = useState('#1A8FD1');
  const [source, setSource] = useState('');
  const [pulse,  setPulse]  = useState(false);
  const [copied, setCopied] = useState(null);
  const prev = useRef(color);

  // Show panel only when in an interactive section
  const show = PANEL_SECTIONS.has(activeSection);

  useEffect(() => {
    const handler = (e) => {
      const { hex, from } = e.detail || {};
      if (!hex) return;
      setColor(hex);
      setSource(from || '');
      if (hex !== prev.current) {
        prev.current = hex;
        setPulse(true);
        setTimeout(() => setPulse(false), 650);
      }
    };
    window.addEventListener('color-select', handler);
    return () => window.removeEventListener('color-select', handler);
  }, []);

  const rgb  = hexToRgb(color);
  const hsl  = hexToHsl(color);
  const wc   = wcag(color);
  const textOnSwatch = getLum(color) > 0.35 ? '#0a0a0f' : '#fff';

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1400);
  };

  const Row = ({ label, value, copyVal, id }) => (
    <motion.div
      whileHover={{ background: 'rgba(255,255,255,0.08)' }}
      onClick={() => copy(copyVal, id)}
      style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'0.38rem 0.55rem', borderRadius:'9px', cursor:'pointer',
        background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)',
        marginBottom:'0.4rem', transition:'background 0.15s',
      }}
    >
      <span style={{ fontSize:'0.6rem', color:'var(--muted)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{label}</span>
      <motion.span
        key={color + id}
        initial={{ opacity:0, y:-5 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.22, ease:'easeOut' }}
        style={{ fontFamily:'monospace', fontSize: label==='HEX' ? '0.84rem' : '0.72rem', fontWeight: label==='HEX' ? 700:400, color: copied===id ? 'var(--accent)' : '#eee', letterSpacing:'0.03em' }}
      >
        {copied === id ? '✓ copied' : value}
      </motion.span>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="panel"
          initial={{ opacity:0, x:60, scale:0.92, filter:'blur(8px)' }}
          animate={{ opacity:1, x:0,  scale:1,    filter:'blur(0px)' }}
          exit={{    opacity:0, x:60, scale:0.92, filter:'blur(8px)' }}
          transition={{ type:'spring', stiffness:340, damping:30, mass:0.8 }}
          style={{
            position:'fixed', bottom:'1.8rem', right:'1.4rem', zIndex:500,
            width:'218px', borderRadius:'22px', overflow:'hidden',
            border:`1px solid ${color}44`,
            boxShadow:`0 0 0 1px ${color}18, 0 12px 40px rgba(0,0,0,0.7), 0 0 80px ${color}20`,
            backdropFilter:'blur(24px)', background:'rgba(8,8,16,0.92)',
            transition:'border-color 0.5s ease, box-shadow 0.5s ease',
          }}
        >
          {/* Swatch */}
          <motion.div
            animate={{ background: color }}
            transition={{ duration:0.3, ease:[0.4,0,0.2,1] }}
            onClick={() => copy(color.toUpperCase(), 'swatch')}
            style={{ height:'76px', position:'relative', cursor:'pointer' }}
          >
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(255,255,255,0.22) 0%,transparent 55%)', pointerEvents:'none' }} />

            {/* Pulse burst on color change */}
            <AnimatePresence>
              {pulse && (
                <motion.div key="burst"
                  initial={{ opacity:0.8, scale:0.7 }}
                  animate={{ opacity:0,   scale:2.2 }}
                  exit={{ opacity:0 }}
                  transition={{ duration:0.55, ease:'easeOut' }}
                  style={{ position:'absolute', inset:0, background:`radial-gradient(circle, ${color}99 0%, transparent 65%)`, pointerEvents:'none' }}
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={{ color: textOnSwatch }}
              style={{ position:'absolute', bottom:'0.5rem', right:'0.7rem', fontSize:'0.52rem', letterSpacing:'0.12em', textTransform:'uppercase', opacity:0.7, fontFamily:"'Space Grotesk',sans-serif" }}
            >
              {copied==='swatch' ? '✓ Copied!' : 'tap to copy'}
            </motion.div>
          </motion.div>

          {/* Body */}
          <div style={{ padding:'0.85rem 0.9rem 1rem' }}>
            {/* Source label */}
            {source && (
              <motion.div
                key={source}
                initial={{ opacity:0 }}
                animate={{ opacity:1 }}
                style={{ fontSize:'0.56rem', color, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700, marginBottom:'0.7rem', opacity:0.9 }}
              >
                ◈ {source}
              </motion.div>
            )}

            <Row label="HEX" value={color.toUpperCase()} copyVal={color.toUpperCase()} id="hex" />
            <Row label="RGB" value={`${rgb.r}, ${rgb.g}, ${rgb.b}`} copyVal={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} id="rgb" />
            <Row label="HSL" value={`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`} copyVal={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} id="hsl" />

            {/* Shade strip + WCAG */}
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.2rem' }}>
              <div style={{ display:'flex', flex:1, height:'7px', borderRadius:'5px', overflow:'hidden', gap:'2px' }}>
                {[0.12,0.28,0.45,0.62,0.78,0.92,1].map((t,i) => {
                  const { r:cr, g:cg, b:cb } = hexToRgb(color);
                  return (
                    <motion.div key={i}
                      animate={{ background:`rgb(${Math.round(cr*t)},${Math.round(cg*t)},${Math.round(cb*t)})` }}
                      transition={{ duration:0.3 }}
                      style={{ flex:1 }}
                    />
                  );
                })}
              </div>
              <motion.div
                animate={{ background: wc.clr+'22', borderColor: wc.clr+'66', color: wc.clr }}
                transition={{ duration:0.3 }}
                style={{ fontSize:'0.56rem', fontWeight:700, padding:'2px 8px', borderRadius:'5px', border:'1px solid', letterSpacing:'0.06em', whiteSpace:'nowrap' }}
              >
                {wc.label}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

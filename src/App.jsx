import './App.css';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ColorWheel from './components/ColorWheel';
import PrimaryColors from './components/PrimaryColors';
import ColorValues from './components/ColorValues';
import RGBvsCMYK from './components/RGBvsCMYK';
import RGBMixer from './components/RGBMixer';
import HSBStudio from './components/HSBStudio';
import PaletteSection from './components/PaletteSection';
import ColorTemperature from './components/ColorTemperature';
import ContrastChecker from './components/ContrastChecker';
import PaletteGenerator from './components/PaletteGenerator';
import Rule6030 from './components/Rule6030';
import Gradients from './components/Gradients';
import BlackAndWhite from './components/BlackAndWhite';
import ColorPsychology from './components/ColorPsychology';
import ColorPreviewPanel from './components/ColorPreviewPanel';
import ReactiveBackground from './components/ReactiveBackground';

const SECTION_IDS = [
  'wheel-section','primary-section','values-section','models-section',
  'rgb-section','hsb-section','palette-section','temperature-section',
  'contrast-section','generator-section','rule-section',
  'gradient-section','bw-section','psychology-section',
];

const SECTIONS = [
  { id: 'wheel-section',       C: ColorWheel },
  { id: 'primary-section',     C: PrimaryColors },
  { id: 'values-section',      C: ColorValues },
  { id: 'models-section',      C: RGBvsCMYK },
  { id: 'rgb-section',         C: RGBMixer },
  { id: 'hsb-section',         C: HSBStudio },
  { id: 'palette-section',     C: PaletteSection },
  { id: 'temperature-section', C: ColorTemperature },
  { id: 'contrast-section',    C: ContrastChecker },
  { id: 'generator-section',   C: PaletteGenerator },
  { id: 'rule-section',        C: Rule6030 },
  { id: 'gradient-section',    C: Gradients },
  { id: 'bw-section',          C: BlackAndWhite },
  { id: 'psychology-section',  C: ColorPsychology },
];

// Scroll-triggered fade+slide reveal
function SectionReveal({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: 'blur(6px)' }}
      animate={visible
        ? { opacity: 1, y: 0, filter: 'blur(0px)' }
        : { opacity: 0, y: 50, filter: 'blur(6px)' }
      }
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('wheel-section');
  const [liveColor, setLiveColor] = useState('#1A8FD1');

  // Track active section for panel visibility
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: '-28% 0px -52% 0px' }
    );
    const t = setTimeout(() => {
      SECTION_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) obs.observe(el);
      });
    }, 120);
    return () => { clearTimeout(t); obs.disconnect(); };
  }, []);

  // Listen to color picks from any component
  useEffect(() => {
    const handler = (e) => { if (e.detail?.hex) setLiveColor(e.detail.hex); };
    window.addEventListener('color-select', handler);
    return () => window.removeEventListener('color-select', handler);
  }, []);

  return (
    <div style={{ background: '#06060f', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      {/* Canvas reactive background — full page, always on */}
      <ReactiveBackground activeSection={activeSection} liveColor={liveColor} />

      {/* Mouse glow overlay */}
      <div className="mouse-orb" style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />
        <Hero />
        <div className="sep" />

        {SECTIONS.map(({ id, C }, i) => (
          <div key={id}>
            <SectionReveal>
              <C />
            </SectionReveal>
            {i < SECTIONS.length - 1 && <div className="sep" />}
          </div>
        ))}

        <footer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ fontFamily:"'Clash Display',sans-serif", fontSize:'1.05rem', color:'#f0eee8', letterSpacing:'0.02em' }}>
              Color Theory Assignment
            </div>
            <div style={{ fontSize:'0.8rem', color:'#bbb' }}>
              By <strong style={{ color:'var(--accent)' }}>Prakhar Srivastava</strong>&nbsp;&middot;&nbsp;
              SAP ID: <span style={{ fontFamily:'monospace', color:'#ddd' }}>590017406</span>
            </div>
            <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>
              Submitted to <strong style={{ color:'#ccc' }}>Pankaj Badoni</strong>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.3rem', textAlign:'right' }}>
            <div style={{ fontSize:'0.78rem', color:'#bbb' }}>
              Course: <span style={{ color:'#ddd' }}>CSGG2012P</span> &mdash; Introduction to Graphics &amp; Animation
            </div>
            <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>
              Unit: Design Fundamentals &nbsp;&middot;&nbsp; CO3: Color Theory
            </div>
            <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:'.1rem', opacity:0.6 }}>
              Modality: Interactive Web-based Design
            </div>
          </div>
        </footer>
      </div>

      <ColorPreviewPanel activeSection={activeSection} />
    </div>
  );
}

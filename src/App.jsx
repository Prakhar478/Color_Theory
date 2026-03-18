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

const SECTION_COLORS = {
  'wheel-section':       { a: '#1A8FD1', b: '#7B2FBE' },
  'primary-section':     { a: '#EE1111', b: '#11AA22' },
  'values-section':      { a: '#FFBE0B', b: '#FF6B35' },
  'models-section':      { a: '#1A8FD1', b: '#00CCCC' },
  'rgb-section':         { a: '#FF5555', b: '#5588FF' },
  'hsb-section':         { a: '#e8ff47', b: '#00CCCC' },
  'palette-section':     { a: '#FF6B35', b: '#1A8FD1' },
  'temperature-section': { a: '#FF8800', b: '#3344DD' },
  'contrast-section':    { a: '#aaaaff', b: '#6366f1' },
  'generator-section':   { a: '#7B2FBE', b: '#e8ff47' },
  'rule-section':        { a: '#3355aa', b: '#e8ff47' },
  'gradient-section':    { a: '#e8ff47', b: '#ff3366' },
  'bw-section':          { a: '#aaaaaa', b: '#444444' },
  'psychology-section':  { a: '#E63946', b: '#7B2FBE' },
};

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

function SectionReveal({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('wheel-section');

  useEffect(() => {
    const ids = Object.keys(SECTION_COLORS);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: '-30% 0px -55% 0px' }
    );
    const t = setTimeout(() => {
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) obs.observe(el);
      });
    }, 100);
    return () => { clearTimeout(t); obs.disconnect(); };
  }, []);

  const colors = SECTION_COLORS[activeSection] || { a: '#1A8FD1', b: '#7B2FBE' };

  return (
    <div style={{ background: '#090910', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      <motion.div
        animate={{
          background: [
            'radial-gradient(ellipse 80% 60% at 50% 40%, #0e0e18, #000008)',
            'radial-gradient(ellipse 80% 60% at 53% 37%, #111120, #000008)',
            'radial-gradient(ellipse 80% 60% at 47% 43%, #0e0e18, #000008)',
          ],
        }}
        transition={{ duration: 14, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />

      <motion.div
        animate={{
          background: `radial-gradient(ellipse 55% 50% at 15% 25%, ${colors.a}1a 0%, transparent 60%), radial-gradient(ellipse 55% 50% at 85% 75%, ${colors.b}15 0%, transparent 60%)`,
        }}
        transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />

      <div className="mouse-orb" style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }} />

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
            <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: '1.05rem', color: '#f0eee8', letterSpacing: '0.02em' }}>Color Theory Assignment</div>
            <div style={{ fontSize: '0.8rem', color: '#bbb' }}>
              By <strong style={{ color: 'var(--accent)' }}>Prakhar Srivastava</strong>&nbsp;&middot;&nbsp;
              SAP ID: <span style={{ fontFamily: 'monospace', color: '#ddd' }}>590017406</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              Submitted to <strong style={{ color: '#ccc' }}>Pankaj Badoni</strong>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#bbb' }}>
              Course: <span style={{ color: '#ddd' }}>CSGG2012P</span> &mdash; Introduction to Graphics &amp; Animation
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              Unit: Design Fundamentals &nbsp;&middot;&nbsp; CO3: Color Theory
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '.1rem', opacity: 0.6 }}>
              Modality: Interactive Web-based Design
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
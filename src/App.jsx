import './App.css';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ReactiveBackground from './components/ReactiveBackground';
import ColorPreviewPanel from './components/ColorPreviewPanel';

// Lazy-load every heavy section — only loads when scrolled into view
const ColorWheel       = lazy(() => import('./components/ColorWheel'));
const PrimaryColors    = lazy(() => import('./components/PrimaryColors'));
const ColorValues      = lazy(() => import('./components/ColorValues'));
const RGBvsCMYK        = lazy(() => import('./components/RGBvsCMYK'));
const RGBMixer         = lazy(() => import('./components/RGBMixer'));
const HSBStudio        = lazy(() => import('./components/HSBStudio'));
const PaletteSection   = lazy(() => import('./components/PaletteSection'));
const ColorTemperature = lazy(() => import('./components/ColorTemperature'));
const ContrastChecker  = lazy(() => import('./components/ContrastChecker'));
const PaletteGenerator = lazy(() => import('./components/PaletteGenerator'));
const Rule6030         = lazy(() => import('./components/Rule6030'));
const Gradients        = lazy(() => import('./components/Gradients'));
const BlackAndWhite    = lazy(() => import('./components/BlackAndWhite'));
const ColorPsychology  = lazy(() => import('./components/ColorPsychology'));

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

const isMobile = () => window.innerWidth <= 768;

// Section loader placeholder
function SectionSkeleton() {
  return (
    <div style={{
      height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', letterSpacing: '0.1em',
    }}>
      Loading...
    </div>
  );
}

// Scroll-triggered reveal — simplified on mobile (no blur, lighter animation)
function SectionReveal({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mobile = isMobile();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          // Small delay so lazy component can load
          setTimeout(() => setVisible(true), 50);
          obs.disconnect();
        }
      },
      { threshold: 0.04, rootMargin: '100px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${mobile ? 20 : 40}px)`,
        // No blur on mobile — GPU expensive
        filter: mobile ? 'none' : (visible ? 'blur(0px)' : 'blur(4px)'),
        transition: mobile
          ? 'opacity 0.4s ease, transform 0.4s ease'
          : 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1), filter 0.7s ease',
        minHeight: mounted ? 'auto' : '40px',
      }}
    >
      {mounted ? children : null}
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('wheel-section');
  const [liveColor, setLiveColor] = useState('#1A8FD1');
  const mobile = isMobile();

  // Track active section
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

      {/* Canvas reactive background — disable on mobile to save GPU */}
      {!mobile && (
        <ReactiveBackground activeSection={activeSection} liveColor={liveColor} />
      )}

      {/* Mouse glow — desktop only */}
      {!mobile && (
        <div className="mouse-orb" style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }} />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />
        <Hero />
        <div className="sep" />

        {SECTIONS.map(({ id, C }, i) => (
          <div key={id}>
            <SectionReveal>
              <Suspense fallback={<SectionSkeleton />}>
                <C />
              </Suspense>
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

      {/* Color preview panel — hide on mobile, takes too much space */}
      {!mobile && <ColorPreviewPanel activeSection={activeSection} />}
    </div>
  );
}
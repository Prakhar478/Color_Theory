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

export default function App() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />
      <Hero />

      {/* 01 - Color Wheel */}
      <div className="sep" />
      <ColorWheel />

      {/* 02 - Primary, Secondary & Tertiary */}
      <div className="sep" />
      <PrimaryColors />

      {/* 03 - Shades, Tints & Tones */}
      <div className="sep" />
      <ColorValues />

      {/* 04 - RGB vs CMYK */}
      <div className="sep" />
      <RGBvsCMYK />

      {/* 05 - RGB Mixer */}
      <div className="sep" />
      <RGBMixer />

      {/* 06 - HSB / HSL Studio */}
      <div className="sep" />
      <HSBStudio />

      {/* 07 - Color Schemes */}
      <div className="sep" />
      <PaletteSection />

      {/* 08 - Color Temperature */}
      <div className="sep" />
      <ColorTemperature />

      {/* 09 - Contrast & Readability */}
      <div className="sep" />
      <ContrastChecker />

      {/* 10 - Palette Generator */}
      <div className="sep" />
      <PaletteGenerator />

      {/* 11 - 60-30-10 Rule */}
      <div className="sep" />
      <Rule6030 />

      {/* 12 - Gradients */}
      <div className="sep" />
      <Gradients />

      {/* 13 - Black & White */}
      <div className="sep" />
      <BlackAndWhite />

      {/* 14 - Color Psychology */}
      <div className="sep" />
      <ColorPsychology />

      <footer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: '1.05rem', color: '#f0eee8', letterSpacing: '0.02em' }}>
            Color Theory Assignment
          </div>
          <div style={{ fontSize: '0.8rem', color: '#bbb' }}>
            By <strong style={{ color: 'var(--accent)' }}>Prakhar Srivastava</strong>&nbsp;·&nbsp; SAP ID: <span style={{ fontFamily: 'monospace', color: '#ddd' }}>590017406</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            Submitted to <strong style={{ color: '#ccc' }}>Pankaj Badoni</strong>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', color: '#bbb' }}>
            Course: <span style={{ color: '#ddd' }}>CSGG2012P</span> — Introduction to Graphics &amp; Animation
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            Unit: Design Fundamentals &nbsp;·&nbsp; CO3: Color Theory
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '.1rem', opacity: 0.6 }}>
            Modality: Interactive Web-based Design
          </div>
        </div>
      </footer>
    </div>
  );
}

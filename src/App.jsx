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

export default function App() {
  return (
    <div style={{ background:'#090910', minHeight:'100vh', position:'relative', overflow:'hidden' }}>
      {/* Slow animated background gradient */}
      <motion.div
        animate={{
          background:[
            'radial-gradient(circle at 50% 40%, #111118, #000008)',
            'radial-gradient(circle at 52% 38%, #13121a, #000008)',
            'radial-gradient(circle at 48% 42%, #111118, #000008)',
          ]
        }}
        transition={{ duration:12, repeat:Infinity, repeatType:'mirror', ease:'linear' }}
        style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none' }}
      />
      <div style={{ position:'relative',zIndex:1 }}>
        <Navbar />
        <Hero />
        <div className="sep" />
        <ColorWheel />
        <div className="sep" />
        <PrimaryColors />
        <div className="sep" />
        <ColorValues />
        <div className="sep" />
        <RGBvsCMYK />
        <div className="sep" />
        <RGBMixer />
        <div className="sep" />
        <HSBStudio />
        <div className="sep" />
        <PaletteSection />
        <div className="sep" />
        <ColorTemperature />
        <div className="sep" />
        <ContrastChecker />
        <div className="sep" />
        <PaletteGenerator />
        <div className="sep" />
        <Rule6030 />
        <div className="sep" />
        <Gradients />
        <div className="sep" />
        <BlackAndWhite />
        <div className="sep" />
        <ColorPsychology />
        <footer>
          <div style={{ display:'flex',flexDirection:'column',gap:'0.3rem' }}>
            <div style={{ fontFamily:"'Clash Display',sans-serif",fontSize:'1.05rem',color:'#f0eee8',letterSpacing:'0.02em' }}>Color Theory Assignment</div>
            <div style={{ fontSize:'0.8rem',color:'#bbb' }}>By <strong style={{ color:'var(--accent)' }}>Prakhar Srivastava</strong>&nbsp;&middot;&nbsp; SAP ID: <span style={{ fontFamily:'monospace',color:'#ddd' }}>590017406</span></div>
            <div style={{ fontSize:'0.75rem',color:'var(--muted)' }}>Submitted to <strong style={{ color:'#ccc' }}>Pankaj Badoni</strong></div>
          </div>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.3rem',textAlign:'right' }}>
            <div style={{ fontSize:'0.78rem',color:'#bbb' }}>Course: <span style={{ color:'#ddd' }}>CSGG2012P</span> &mdash; Introduction to Graphics &amp; Animation</div>
            <div style={{ fontSize:'0.75rem',color:'var(--muted)' }}>Unit: Design Fundamentals &nbsp;&middot;&nbsp; CO3: Color Theory</div>
            <div style={{ fontSize:'0.72rem',color:'var(--muted)',marginTop:'.1rem',opacity:0.6 }}>Modality: Interactive Web-based Design</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
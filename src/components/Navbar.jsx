import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Wheel', id: 'wheel-section' },
  { label: 'Primaries', id: 'primary-section' },
  { label: 'Values', id: 'values-section' },
  { label: 'RGB vs CMYK', id: 'models-section' },
  { label: 'RGB', id: 'rgb-section' },
  { label: 'HSB', id: 'hsb-section' },
  { label: 'Schemes', id: 'palette-section' },
  { label: 'Temperature', id: 'temperature-section' },
  { label: 'Contrast', id: 'contrast-section' },
  { label: 'Generator', id: 'generator-section' },
  { label: '60-30-10', id: 'rule-section' },
  { label: 'Gradients', id: 'gradient-section' },
  { label: 'B&W', id: 'bw-section' },
  { label: 'Psychology', id: 'psychology-section' },
];

export default function Navbar() {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    NAV_LINKS.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav>
      <div className="nav-logo">Color<span>Theory</span></div>
      <div className="nav-links">
        {NAV_LINKS.map(link => (
          <a 
            key={link.id} 
            onClick={() => goTo(link.id)}
            className={activeId === link.id ? 'active' : ''}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

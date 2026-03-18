import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Wheel',       id: 'wheel-section' },
  { label: 'Primaries',   id: 'primary-section' },
  { label: 'Values',      id: 'values-section' },
  { label: 'RGB vs CMYK', id: 'models-section' },
  { label: 'RGB',         id: 'rgb-section' },
  { label: 'HSB',         id: 'hsb-section' },
  { label: 'Schemes',     id: 'palette-section' },
  { label: 'Temperature', id: 'temperature-section' },
  { label: 'Contrast',    id: 'contrast-section' },
  { label: 'Generator',   id: 'generator-section' },
  { label: '60-30-10',    id: 'rule-section' },
  { label: 'Gradients',   id: 'gradient-section' },
  { label: 'B&W',         id: 'bw-section' },
  { label: 'Psychology',  id: 'psychology-section' },
];

export default function Navbar() {
  const [activeId, setActiveId]   = useState('');
  const [menuOpen, setMenuOpen]   = useState(false);
  const [isMobile, setIsMobile]   = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
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

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (!e.target.closest('nav') && !e.target.closest('.mobile-menu')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuOpen]);

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0 1rem' : '0 2.5rem',
        height: '56px',
        background: 'rgba(8,8,14,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div className="nav-logo" style={{ fontFamily:"'Clash Display',sans-serif", fontSize:'1rem', letterSpacing:'0.04em' }}>
          Color<span style={{ color:'var(--accent)' }}>Theory</span>
        </div>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display:'flex', gap:'1.4rem', overflowX:'auto', scrollbarWidth:'none' }}>
            {NAV_LINKS.map(link => (
              <a key={link.id} onClick={() => goTo(link.id)}
                style={{
                  color: activeId === link.id ? 'var(--accent)' : 'var(--muted)',
                  fontWeight: activeId === link.id ? 600 : 400,
                  textDecoration: 'none', fontSize: '0.75rem',
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'color 0.2s',
                  borderBottom: activeId === link.id ? '2px solid var(--accent)' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >{link.label}</a>
            ))}
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(p => !p)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px', display: 'flex', flexDirection: 'column',
              gap: '5px', zIndex: 201,
            }}
            aria-label="Menu"
          >
            <span style={{ display:'block', width:'22px', height:'2px', background: menuOpen ? 'var(--accent)' : '#fff', borderRadius:'2px', transition:'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
            <span style={{ display:'block', width:'22px', height:'2px', background: menuOpen ? 'var(--accent)' : '#fff', borderRadius:'2px', transition:'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display:'block', width:'22px', height:'2px', background: menuOpen ? 'var(--accent)' : '#fff', borderRadius:'2px', transition:'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 199,
          background: 'rgba(8,8,14,0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-110%)',
          transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
          pointerEvents: menuOpen ? 'all' : 'none',
        }}>
          {NAV_LINKS.map((link, i) => (
            <button key={link.id} onClick={() => goTo(link.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                padding: '1rem 1.2rem',
                textAlign: 'left',
                cursor: 'pointer',
                color: activeId === link.id ? 'var(--accent)' : 'rgba(255,255,255,0.65)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.8rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: activeId === link.id ? 600 : 400,
                transition: 'color 0.2s, background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {activeId === link.id && (
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--accent)', flexShrink:0 }} />
              )}
              {link.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
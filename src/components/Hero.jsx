export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-bg"></div>
      <h1>See <em>Color</em><br />Come Alive</h1>
      <p>An interactive journey through Color Theory. Explore color wheels, schemes, RGB, HSB saturation and brightness, and design psychology hands-on.</p>
      <div className="hero-chips">
        <div className="chip">Color Wheel</div>
        <div className="chip">Complementary</div>
        <div className="chip">Triadic</div>
        <div className="chip">Analogous</div>
        <div className="chip">HSB Studio</div>
        <div className="chip">RGB Model</div>
      </div>
      <div className="hero-scroll-wrap">
        <a className="scroll-hint" href="#wheel-section">SCROLL TO EXPLORE</a>
      </div>
    </div>
  );
}

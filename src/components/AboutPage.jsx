import React from 'react'

const AboutPage = ({ onClose }) => {
  return (
    <div className="about-overlay" onClick={onClose}>
      <div className="about-card" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div className="logo-text">REACT MATCH-3 ENGINE</div>
          <div className="close-card" onClick={onClose}>✕</div>
        </div>

        <div className="card-content">
          <div className="about-hero">
            <h1 className="about-title">NOT LUCK.<br />DIVINE TIMING.</h1>
            <p className="about-subtitle">A signal disguised as a memecoin. For the ones who see it early.</p>
          </div>

          <section className="about-section">
            <h2 className="section-header">THE NARRATIVE</h2>
            <p className="section-text">
              In a world of noise, most look for luck. We look for patterns.
              The <strong>Clover Boys</strong> movement is built on the belief that timing is everything.
              It's about recognition — of the signal, of the community, and of the moment before the world catches up.
            </p>
          </section>

          <section className="about-section">
            <h2 className="section-header">THE 5 PILLARS</h2>
            <div className="pillars-grid">
              <div className="pillar-card">
                <h3>01 DIVINE TIMING</h3>
                <p>The universe doesn't happen to you; it happens for you. Recognition is the only tool you need.</p>
              </div>
              <div className="pillar-card">
                <h3>02 COMMUNITY FIRST</h3>
                <p>Ran by the people. For the people. A collective consciousness focused on the long-term signal.</p>
              </div>
              <div className="pillar-card">
                <h3>03 NO RUG CULTURE</h3>
                <p>Transparency isn't a feature; it's the foundation. We are here to build, not to blink.</p>
              </div>
              <div className="pillar-card">
                <h3>04 LONG-TERM ALIGNMENT</h3>
                <p>For the ones who stay early. Conviction is the highest form of intelligence.</p>
              </div>
              <div className="pillar-card">
                <h3>05 QUIET SIGNAL</h3>
                <p>Quiet, smart, focused, early, intentional. The loudest rooms often have nothing to say.</p>
              </div>
            </div>
          </section>

          <section className="about-section observer-focus">
            <div className="observer-info">
              <h2 className="section-header">THE OBSERVER</h2>
              <p className="section-text">
                He is the silent witness. He doesn't gamble; he waits.
              </p>
            </div>
            <div className="observer-media">
              <img src="/mr-observer.png" alt="Mr. Observer" className="mr-observer-img" />
            </div>
          </section>

          <section className="about-section cta-box">
            <button className="main-site-btn" onClick={onClose}>
              ENTER THE SIGNAL
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AboutPage

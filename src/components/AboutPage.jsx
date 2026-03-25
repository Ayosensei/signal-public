import React from 'react'

const AboutPage = ({ setView }) => {
  return (
    <div className="about-page">
      <div className="top-bar">
        <div className="logo-text">SIGNAL</div>
        <div className="close-about" onClick={() => setView('splash')}>✕</div>
      </div>

      <div className="about-content">
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
              He is the symbol of pattern detection in a chaotic market.
              "You're either early or you're watching."
            </p>
          </div>
          <div className="observer-media">
            <img src="/mr-observer.png" alt="Mr. Observer" className="mr-observer-img" />
          </div>
        </section>

        <section className="about-section cta-box">
          <a href="https://cloverboys.vercel.app/" target="_blank" rel="noopener noreferrer" className="main-site-btn">
            EXPLORE THE MAIN HUB
          </a>
        </section>
      </div>
    </div>
  )
}

export default AboutPage

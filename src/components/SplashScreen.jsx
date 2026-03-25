import React from 'react'

const SplashScreen = ({ setView, highScore, gameMode, setGameMode }) => {
  return (
    <div className="splash-screen">
      <div className="top-bar">
        <div className="logo-text">SIGNAL</div>
        <div className="high-score-display">HIGH-SCORE: {highScore.toLocaleString()}</div>
        <div className="menu-icon">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>

      <div className="main-content">
        <div className="diagnostics-card">
          <p className="diag-header">SYSTEM DIAGNOSTICS</p>
          <p>ENCRYPTION: ACTIVE</p>
          <p>PULSE_LOAD: 88.4%</p>
        </div>

        <div className="center-branding">
          <h1 className="hero-title">SIGNAL</h1>
          <p className="hero-tagline">NOT LUCK &gt; TIMING</p>
        </div>

        <div className="mode-selection">
          <button className={`mode-btn ${gameMode === 'observation' ? 'active' : ''}`} onClick={() => setGameMode('observation')}>OBSERVATION</button>
          <button className={`mode-btn ${gameMode === 'signal' ? 'active' : ''}`} onClick={() => setGameMode('signal')}>SIGNAL</button>
          <button className={`mode-btn ${gameMode === 'conviction' ? 'active' : ''}`} onClick={() => setGameMode('conviction')}>CONVICTION</button>
        </div>

        <div className="action-buttons">
          <button className="start-game-btn" onClick={() => setView('game')}>
            START {gameMode.toUpperCase()}
          </button>
          <p className="tutorial-link">INITIALIZE TUTORIAL</p>
        </div>
      </div>

      <div className="bottom-info">
        <div className="version-info">VER_2.0.84_STABLE | LATENCY: 12MS</div>
        <div className="copyright">© 2124 SYNTHETIC PULSE LABS. ALL TRANSMISSIONS MONITORED.</div>
      </div>
    </div>
  )
}

export default SplashScreen

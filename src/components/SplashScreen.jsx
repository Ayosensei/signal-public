import React from 'react'

const SplashScreen = ({ setView, highScore, gameMode, setGameMode, onCampaignClick, onAuthClick, profile }) => {
  return (
    <div className="splash-screen">
      <div className="top-bar">
        <div className="logo-text">SIGNAL</div>
        <div className="top-bar-right">
          {profile ? (
            <div className="user-profile glow-text">[{profile.username}]</div>
          ) : (
            <button className="auth-trigger-btn" onClick={onAuthClick}>CONNECT_UPLINK</button>
          )}
          <div className="high-score-display">HIGH-SCORE: {highScore.toLocaleString()}</div>
          <div className="settings-trigger" onClick={() => setView('settings')}>⚙</div>
        </div>
      </div>

      <div className="main-content">
        <div className="center-branding">
          <h1 className="hero-title">SIGNAL</h1>
          <p className="hero-tagline">NOT LUCK &gt; TIMING</p>
        </div>

        <div className="action-buttons">
          <button className="campaign-btn" onClick={onCampaignClick}>
            CAMPAIGN MODE
            <span className="btn-subtitle">DECODE SEQUENCES</span>
          </button>

          <div className="divider"><span>OR</span></div>

          <div className="quick-play-section">
            <div className="mode-selection">
              <button className={`mode-btn ${gameMode === 'observation' ? 'active' : ''}`} onClick={() => setGameMode('observation')}>OBSERVATION</button>
              <button className={`mode-btn ${gameMode === 'signal' ? 'active' : ''}`} onClick={() => setGameMode('signal')}>SIGNAL</button>
              <button className={`mode-btn ${gameMode === 'conviction' ? 'active' : ''}`} onClick={() => setGameMode('conviction')}>CONVICTION</button>
            </div>
            <button className="start-game-btn" onClick={() => setView('game')}>
              QUICK START: {gameMode.toUpperCase()}
            </button>
          </div>
        </div>

        <div className="diagnostics-card">
          <p className="diag-header">SYSTEM DIAGNOSTICS</p>
          <div className="diag-grid">
            <span>ENCRYPTION: ACTIVE</span>
            <span>PULSE_LOAD: 88.4%</span>
            <span>CORES: 6 / ONLINE</span>
            <span>LATENCY: 12MS</span>
          </div>
        </div>
      </div>

      <div className="bottom-info">
        <div className="version-info">VER_2.1.0_PROG | HANDSHAKE_STABLE</div>
        <div className="copyright">© 2124 SYNTHETIC PULSE LABS. ALL TRANSMISSIONS MONITORED.</div>
      </div>
    </div>
  )
}

export default SplashScreen

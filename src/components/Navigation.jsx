import React from 'react'

const GameNavigation = ({ view, setView }) => {
  return (
    <div className="footer-nav">
      <div className={`nav-item ${view === 'about' ? 'active' : ''}`} onClick={() => setView('about')}>
        <span className="nav-icon">⌂</span>
        <span className="nav-label">HOME</span>
      </div>
      <div className={`nav-item ${view === 'game' ? 'active' : ''}`} onClick={() => setView('game')}>
        <span className="nav-icon">🎮</span>
        <span className="nav-label">PLAY</span>
      </div>
      <div className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => setView('settings')}>
        <span className="nav-icon">⚙</span>
        <span className="nav-label">SETTINGS</span>
      </div>
    </div>
  )
}

export default GameNavigation

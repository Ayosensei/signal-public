/**
 * App.jsx — THE SIGNAL
 * Core game engine for a match-3 movement disguised as a game.
 */

import { useState, useEffect, useCallback } from 'react'
import './index.css'
import { useGameLogic } from './hooks/useGameLogic'
import GameBoard from './components/GameBoard'
import SplashScreen from './components/SplashScreen'
import AboutPage from './components/AboutPage'
import GameNavigation from './components/Navigation'
import { SEQUENCES } from './data/levels'
import SettingsPage from './components/SettingsPage'
import GameMenu from './components/GameMenu'
import AuthModal from './components/AuthModal'
import LeaderboardPage from './components/LeaderboardPage'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import { supabase } from './lib/supabaseClient'

function App() {
  // 1. STATE HOOKS
  const [view, setView] = useState('splash')
  const [showAbout, setShowAbout] = useState(true)
  const [showGameMenu, setShowGameMenu] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false)
  const [gameMode, setGameMode] = useState('observation')
  const [selectedSequence, setSelectedSequence] = useState(null)
  const [unlockedSequence, setUnlockedSequence] = useState(() => {
    const saved = localStorage.getItem('signal_unlocked_sequence')
    return saved ? parseInt(saved, 10) : 1
  })
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('signal_high_score')
    return saved ? parseInt(saved, 10) : 0
  })
  const [audioSettings, setAudioSettings] = useState(() => {
    const saved = localStorage.getItem('signal_audio_settings')
    return saved ? JSON.parse(saved) : { volume: 80, sfx: true, music: true, shake: true }
  })

  // 2. CUSTOM HOOKS (Stable Order)
  const { user, profile } = useAuth()
  
  const { 
    grid, 
    score, 
    timer, 
    movesLeft, 
    isGameOver, 
    isWin, 
    isProcessing, 
    isPaused,
    setIsPaused,
    swapTiles, 
    generateBoard,
    currentSequence 
  } = useGameLogic(gameMode, selectedSequence)

  // 3. EFFECT HOOKS
  useEffect(() => {
    localStorage.setItem('signal_audio_settings', JSON.stringify(audioSettings))
  }, [audioSettings])

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('signal_high_score', score.toString())
    }
    if (isWin && currentSequence) {
      const nextLevel = currentSequence.id + 1
      if (nextLevel > unlockedSequence) {
        setUnlockedSequence(nextLevel)
        localStorage.setItem('signal_unlocked_sequence', nextLevel.toString())
      }
    }
  }, [score, highScore, isWin, currentSequence, unlockedSequence])

  useEffect(() => {
    if (view === 'settings' || showGameMenu) {
      setIsPaused(true)
    } else {
      setIsPaused(false)
    }
  }, [view, showGameMenu, setIsPaused])

  useEffect(() => {
    if (isGameOver && !currentSequence && gameMode === 'signal' && user && !hasSubmittedScore) {
      setHasSubmittedScore(true)
      const submitScore = async () => {
        try {
          const { error } = await supabase.from('leaderboard').insert({
            player_id: user.id,
            score: score,
            game_mode: 'signal'
          })
          if (error) throw error
          console.log('Score pushed to uplink')
        } catch (err) {
          console.error('Failed to transmit score:', err)
        }
      }
      submitScore()
    }
    
    if (!isGameOver) {
      setHasSubmittedScore(false)
    }
  }, [isGameOver, gameMode, currentSequence, user, score, hasSubmittedScore])

  // 4. CALLBACK HANDLERS
  const handleSetView = (newView) => {
    if (newView === 'about') {
      setShowAbout(true)
    } else if (newView === 'sequence-hub') {
      setView('sequence-hub')
      setShowAbout(false)
    } else if (newView === 'settings') {
      setView('settings')
      setShowAbout(false)
    } else if (newView === 'leaderboard') {
      setView('leaderboard')
      setShowAbout(false)
    } else {
      if (newView === 'splash') setSelectedSequence(null)
      setView(newView)
      setShowAbout(false)
    }
  }

  const resetProgress = () => {
    if (window.confirm("ARE_YOU_SURE_YOU_WANT_TO_PURGE_ALL_DATA?")) {
      localStorage.removeItem('signal_unlocked_sequence')
      setUnlockedSequence(1)
      setView('splash')
    }
  }

  const startSequence = (seq) => {
    setSelectedSequence(seq)
    setGameMode(seq.mode)
    setView('game')
    setShowGameMenu(false)
  }

  const handleMenuAction = (action) => {
    setShowGameMenu(false)
    if (action === 'resume') return
    if (action === 'settings') {
      setView('settings')
      return
    }
    if (action === 'hub') {
      setView('sequence-hub')
      return
    }
    if (action === 'home') {
      setView('splash')
      setSelectedSequence(null)
      return
    }
  }

  const renderContent = () => {
    if (view === 'splash') {
      return (
        <SplashScreen 
          setView={setView} 
          highScore={highScore} 
          gameMode={gameMode} 
          setGameMode={setGameMode}
          onCampaignClick={() => setView('sequence-hub')}
          onAuthClick={() => setShowAuth(true)}
          profile={profile}
        />
      )
    }

    if (view === 'leaderboard') {
      return <LeaderboardPage setView={setView} />
    }

    if (view === 'sequence-hub') {
      return (
        <div className="sequence-hub">
          <header className="hub-header">
            <div className="hub-header-left">
              <button className="hub-back-minimal" onClick={() => setView('splash')}>←</button>
              <h2 className="hub-title">NETWORK SEQUENCES</h2>
            </div>
            <div className="hub-stats">
              <div className="hub-stat">
                <span className="label">DECRYPTION_PROGRESS:</span>
                <span className="value">{Math.round((unlockedSequence / SEQUENCES.length) * 100)}%</span>
              </div>
              <div className="hub-stat">
                <span className="label">ACTIVE_NODES:</span>
                <span className="value">{unlockedSequence}/{SEQUENCES.length}</span>
              </div>
            </div>
          </header>

          <div className="sequence-grid">
            {SEQUENCES.map(seq => {
              const status = seq.id < unlockedSequence ? 'COMPLETE' : seq.id === unlockedSequence ? 'ACTIVE' : 'LOCKED'
              return (
                <div 
                  key={seq.id} 
                  className={`sequence-card ${status.toLowerCase()}`}
                  onClick={() => seq.id <= unlockedSequence && startSequence(seq)}
                >
                  <div className="seq-number">0{seq.id}</div>
                  <div className="seq-header">
                    <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
                    {seq.difficulty && (
                      <span className="difficulty-rating">
                        {"I".repeat(seq.difficulty)}
                      </span>
                    )}
                  </div>
                  <div className="seq-content">
                    <h3 className="seq-name">{seq.name}</h3>
                    <p className="seq-desc">{seq.description}</p>
                  </div>
                  {seq.id <= unlockedSequence && (
                    <div className="seq-footer">
                      <div className="seq-meta">
                        <span className="label">OBJECTIVE:</span>
                        <span className="value">{seq.objective.target.toLocaleString()} PTS</span>
                      </div>
                      <div className="seq-meta">
                        <span className="label">PARAMS:</span>
                        <span className="value">
                          {seq.mode === 'conviction' ? `${seq.moves} MOVES` : `${seq.time} SECS`}
                        </span>
                      </div>
                      {seq.reward && (
                        <div className="seq-meta reward">
                          <span className="label">DATA_RECOVERY:</span>
                          <span className="value">{seq.reward}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {status === 'LOCKED' && <div className="lock-overlay"><span>ENCRYPTED_NODE</span></div>}
                </div>
              )
            })}
          </div>
          
          <div className="hub-footer">
            <button className="hub-back-btn" onClick={() => setView('splash')}>
              DISCONNECT_SESSION
            </button>
          </div>
        </div>
      )
    }
    
    return (
      <div className="game-main-layout">
        <div className="board-container">
          <GameBoard grid={grid} isProcessing={isProcessing} swapTiles={swapTiles} />
          
          {(isGameOver || isWin) && (
            <div className={`game-over-overlay ${isWin ? 'win' : 'loss'}`}>
              <h2 className="status-text">{isWin ? 'SEQUENCE DECRYPTED' : 'SIGNAL LOST'}</h2>
              <div className="results-box">
                <div className="stat">
                  <span>FINAL SCORE</span>
                  <span>{score.toLocaleString()}</span>
                </div>
                {currentSequence && (
                  <div className="stat">
                    <span>TARGET</span>
                    <span>{currentSequence.objective.target.toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <div className="overlay-actions">
                {isWin && currentSequence && currentSequence.id < SEQUENCES.length ? (
                  <button onClick={() => startSequence(SEQUENCES[currentSequence.id])}>NEXT SEQUENCE</button>
                ) : (
                  <button onClick={() => generateBoard()}>REBOOT SYSTEM</button>
                )}
                <button onClick={() => setView('sequence-hub')}>SEQUENCE HUB</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`app-container ${isGameOver ? 'game-over' : ''}`}>
      {view === 'game' && (
        <div className="game-header">
          <div className="header-left">
            <h1 className="game-title">SIGNAL</h1>
            <div className="game-score">SCORE: {score.toLocaleString()}</div>
            {currentSequence && (
              <div className="level-info">
                <span className="level-id">SEQ {currentSequence.id}</span>
                <span className="level-target">TARGET: {currentSequence.objective.target.toLocaleString()}</span>
              </div>
            )}
            {!currentSequence && gameMode === 'signal' && <div className="game-timer">TIME: {timer}s</div>}
            {!currentSequence && gameMode === 'conviction' && <div className="game-moves">MOVES: {movesLeft}</div>}
            {currentSequence?.mode === 'signal' && <div className="game-timer">TIME: {timer}s</div>}
            {currentSequence?.mode === 'conviction' && <div className="game-moves">MOVES: {movesLeft}</div>}
          </div>
          <div className="header-right">
            <div className="header-icon" onClick={() => generateBoard()}>↺</div>
            <div className="header-icon" onClick={() => setShowGameMenu(true)}>≡</div>
          </div>
        </div>
      )}

      {renderContent()}

      {view !== 'game' && <GameNavigation view={view} setView={handleSetView} />}

      {showAbout && (
        <AboutPage onClose={() => setShowAbout(false)} />
      )}

      <AnimatePresence>
        {view === 'settings' && (
          <SettingsPage 
            audioSettings={audioSettings}
            setAudioSettings={setAudioSettings}
            onClose={() => setView(selectedSequence ? 'game' : 'splash')} 
            onResetProgress={resetProgress} 
          />
        )}
        {showGameMenu && (
          <GameMenu 
            onAction={handleMenuAction}
            onClose={() => setShowGameMenu(false)}
          />
        )}
        {showAuth && (
          <AuthModal onClose={() => setShowAuth(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App

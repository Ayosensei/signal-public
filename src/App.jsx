/**
 * App.jsx — THE SIGNAL
 * Core game engine for a match-3 movement disguised as a game.
 */

import { useState, useEffect } from 'react'
import './index.css'
import { useGameLogic } from './hooks/useGameLogic'
import GameBoard from './components/GameBoard'
import SplashScreen from './components/SplashScreen'
import AboutPage from './components/AboutPage'
import Navigation from './components/Navigation'

function App() {
  const [view, setView] = useState('splash')
  const [gameMode, setGameMode] = useState('observation')
  const { grid, score, timer, movesLeft, isGameOver, isProcessing, swapTiles, generateBoard } = useGameLogic(gameMode)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('signal_high_score')
    return saved ? parseInt(saved, 10) : 0
  })

  // Persist high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('signal_high_score', score.toString())
    }
  }, [score, highScore])

  if (view === 'about') {
    return (
      <div className="about-page">
        <AboutPage setView={setView} />
        <Navigation view={view} setView={setView} />
      </div>
    )
  }

  if (view === 'splash') {
    return (
      <div className="splash-screen">
        <SplashScreen setView={setView} highScore={highScore} gameMode={gameMode} setGameMode={setGameMode} />
        <Navigation view={view} setView={setView} />
      </div>
    )
  }

  return (
    <div className={`app-container ${isGameOver ? 'game-over' : ''}`}>
      <div className="game-header">
        <div className="header-left">
          <h1 className="game-title">SIGNAL</h1>
          <div className="game-score">SCORE: {score.toLocaleString()}</div>
          {gameMode === 'signal' && <div className="game-timer">TIME: {timer}s</div>}
          {gameMode === 'conviction' && <div className="game-moves">MOVES: {movesLeft}</div>}
        </div>
        <div className="header-right">
          <div className="header-icon" onClick={() => generateBoard()}>↺</div>
          <div className="header-icon">≡</div>
        </div>
      </div>

      <div className="game-main-layout">
        {/* ... */}
        <div className="board-container">
          <GameBoard grid={grid} isProcessing={isProcessing} swapTiles={swapTiles} />
          {isGameOver && (
            <div className="game-over-overlay">
              <h2>SIGNAL LOST</h2>
              <p>FINAL SCORE: {score.toLocaleString()}</p>
              <button onClick={() => generateBoard()}>REBOOT SYSTEM</button>
            </div>
          )}
        </div>
      </div>

      <Navigation view={view} setView={setView} />
    </div>
  )
}

export default App

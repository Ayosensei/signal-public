/**
 * App.jsx — THE SIGNAL
 * Core game engine for a match-3 movement disguised as a game.
 * Features: 8x8 Grid, Recursive Cascadence, Multi-Input Support, Cinematic Navigation.
 */

import { useState, useEffect, useCallback } from 'react'
import './index.css'

// --- Configuration ---
const GRID_SIZE = 8
const TILE_TYPES = 6

function App() {
  // --- [STATE] ---
  const [view, setView] = useState('splash') // Current View: 'splash', 'game', 'about'
  const [grid, setGrid] = useState([])       // 8x8 Board State
  const [selectedTile, setSelectedTile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false) // Input Lock during cascades
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(12450)

  // --- [GAME INITIALIZATION] ---

  /**
   * Generates a randomized 8x8 board.
   * Ensures no natural matches exist at start-up.
   */
  const generateBoard = useCallback(() => {
    const newGrid = []
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = []
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push(Math.floor(Math.random() * TILE_TYPES))
      }
      newGrid.push(row)
    }

    // Pattern Check: Regenerate if matches exist naturally
    while (checkMatches(newGrid)) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          newGrid[r][c] = Math.floor(Math.random() * TILE_TYPES)
        }
      }
    }
    setGrid(newGrid)
  }, [])

  useEffect(() => {
    generateBoard()
  }, [generateBoard])

  // --- [MATCH DETECTION] ---

  /**
   * Scans the grid for horizontal and vertical matches of 3+.
   * @returns {Array|null} Array of matching tile coordinates or null.
   */
  const checkMatches = (currentGrid) => {
    const matches = []

    // Horizontal Scan
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        const type = currentGrid[r][c]
        if (type !== null && type === currentGrid[r][c + 1] && type === currentGrid[r][c + 2]) {
          matches.push({ r, c })
          matches.push({ r, c: c + 1 })
          matches.push({ r, c: c + 2 })
        }
      }
    }

    // Vertical Scan
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        const type = currentGrid[r][c]
        if (type !== null && type === currentGrid[r + 1][c] && type === currentGrid[r + 2][c]) {
          matches.push({ r, c })
          matches.push({ r: r + 1, c })
          matches.push({ r: r + 2, c })
        }
      }
    }

    return matches.length > 0 ? matches : null
  }

  // --- [GAME LOOP: CASCADE LOGIC] ---

  /**
   * Core Game Loop: Clears matches, applies gravity, refills board, and recurses.
   * This function locks inputs until the board is stable.
   */
  const handleMatches = async (currentGrid) => {
    const matches = checkMatches(currentGrid)
    if (!matches) {
      setIsProcessing(false) // Finish cascade loop
      return
    }

    setIsProcessing(true) // Lock inputs

    // 1. CLEAR: Nullify matching tiles
    const newGrid = currentGrid.map(row => [...row])
    matches.forEach(({ r, c }) => {
      newGrid[r][c] = null
    })
    setGrid(newGrid)
    setScore(prev => prev + matches.length * 10)

    await new Promise(resolve => setTimeout(resolve, 300))

    // 2. GRAVITY: Shift tiles down to fill gaps
    for (let c = 0; c < GRID_SIZE; c++) {
      let emptyRow = GRID_SIZE - 1
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        if (newGrid[r][c] !== null) {
          const val = newGrid[r][c]
          newGrid[r][c] = null
          newGrid[emptyRow][c] = val
          emptyRow--
        }
      }
    }
    setGrid([...newGrid])
    await new Promise(resolve => setTimeout(resolve, 200))

    // 3. REFILL: Spawn new randomized tiles at the top
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE; r++) {
        if (newGrid[r][c] === null) {
          newGrid[r][c] = Math.floor(Math.random() * TILE_TYPES)
        }
      }
    }
    setGrid([...newGrid])
    await new Promise(resolve => setTimeout(resolve, 300))

    // 4. RECURSION: Check for secondary matches (cascades)
    handleMatches(newGrid)
  }

  // --- [INPUT HANDLERS] ---

  /**
   * Swaps two adjacent tiles if it results in a match.
   * Auto-reverts if no match occurs.
   */
  const swapTiles = async (tile1, tile2) => {
    setIsProcessing(true)
    const newGrid = [...grid.map(row => [...row])]
    const temp = newGrid[tile1.r][tile1.c]
    newGrid[tile1.r][tile1.c] = newGrid[tile2.r][tile2.c]
    newGrid[tile2.r][tile2.c] = temp

    const matches = checkMatches(newGrid)
    if (matches) {
      setGrid(newGrid)
      await handleMatches(newGrid)
    } else {
      // No match found -> Visual Revert
      setGrid(newGrid)
      await new Promise(resolve => setTimeout(resolve, 200))
      const revertedGrid = [...grid.map(row => [...row])]
      setGrid(revertedGrid)
      setIsProcessing(false)
    }
  }

  const handleTileClick = (r, c) => {
    if (isProcessing) return

    if (!selectedTile) {
      setSelectedTile({ r, c })
    } else {
      const isAdjacent =
        Math.abs(selectedTile.r - r) + Math.abs(selectedTile.c - c) === 1

      if (isAdjacent) {
        swapTiles(selectedTile, { r, c })
        setSelectedTile(null)
      } else {
        setSelectedTile({ r, c })
      }
    }
  }

  // --- [MULTI-INPUT: DRAG & SWIPE] ---

  const [touchStart, setTouchStart] = useState(null)

  const onDragStart = (e, r, c) => {
    if (isProcessing) return
    e.dataTransfer.setData('tile', JSON.stringify({ r, c }))
    setSelectedTile({ r, c })
  }

  const onDragOver = (e) => e.preventDefault()

  const onDrop = (e, r, c) => {
    e.preventDefault()
    if (isProcessing) return
    const draggedTile = JSON.parse(e.dataTransfer.getData('tile'))
    const isAdjacent = Math.abs(draggedTile.r - r) + Math.abs(draggedTile.c - c) === 1

    if (isAdjacent) {
      swapTiles(draggedTile, { r, c })
      setSelectedTile(null)
    }
  }

  const onTouchStart = (e, r, c) => {
    if (isProcessing) return
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY, r, c })
    setSelectedTile({ r, c })
  }

  const onTouchEnd = (e) => {
    if (!touchStart || isProcessing) return
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
    const dx = touchEnd.x - touchStart.x
    const dy = touchEnd.y - touchStart.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (Math.max(absDx, absDy) > 30) {
      let targetR = touchStart.r
      let targetC = touchStart.c
      if (absDx > absDy) targetC += dx > 0 ? 1 : -1
      else targetR += dy > 0 ? 1 : -1

      if (targetR >= 0 && targetR < GRID_SIZE && targetC >= 0 && targetC < GRID_SIZE) {
        swapTiles({ r: touchStart.r, c: touchStart.c }, { r: targetR, c: targetC })
        setSelectedTile(null)
      }
    }
    setTouchStart(null)
  }

  // --- [RENDER VIEWS] ---

  // 1. ABOUT PAGE (Project Manifesto)
  if (view === 'about') {
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

        <div className="footer-nav">
          <div className="nav-item active" onClick={() => setView('about')}>
            <span className="nav-icon">⌂</span>
            <span className="nav-label">HOME</span>
          </div>
          <div className="nav-item" onClick={() => setView('game')}>
            <span className="nav-icon">🎮</span>
            <span className="nav-label">PLAY</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">⚙</span>
            <span className="nav-label">SETTINGS</span>
          </div>
        </div>
      </div>
    )
  }

  // 2. SPLASH SCREEN (Home Page)
  if (view === 'splash') {
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

          <div className="action-buttons">
            <button className="start-game-btn" onClick={() => setView('game')}>
              START GAME
            </button>
            <p className="tutorial-link">INITIALIZE TUTORIAL</p>
          </div>
        </div>

        <div className="bottom-info">
          <div className="version-info">VER_2.0.84_STABLE | LATENCY: 12MS</div>
          <div className="copyright">© 2124 SYNTHETIC PULSE LABS. ALL TRANSMISSIONS MONITORED.</div>
        </div>

        <div className="footer-nav">
          <div className="nav-item" onClick={() => setView('about')}>
            <span className="nav-icon">⌂</span>
            <span className="nav-label">HOME</span>
          </div>
          <div className="nav-item active" onClick={() => setView('game')}>
            <span className="nav-icon">🎮</span>
            <span className="nav-label">PLAY</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">⚙</span>
            <span className="nav-label">SETTINGS</span>
          </div>
        </div>
      </div>
    )
  }

  // 3. GAME VIEW (Main 8x8 Grid)
  return (
    <div className="app-container">
      <div className="game-header">
        <div className="header-left">
          <h1 className="game-title">SIGNAL</h1>
          <div className="game-score">SCORE: {score.toLocaleString()}</div>
        </div>
        <div className="header-right">
          <div className="header-icon">⏸</div>
          <div className="header-icon">≡</div>
        </div>
      </div>

      <div className="game-main-layout">
        <aside className="game-sidebar">
          <div className="powerup-card">
            <span className="powerup-icon">💣</span>
            <span className="powerup-count">03</span>
          </div>
          <div className="powerup-card">
            <span className="powerup-icon">⚡</span>
            <span className="powerup-count">01</span>
          </div>
          <div className="powerup-card">
            <span className="powerup-icon">🖐</span>
            <span className="powerup-count">05</span>
          </div>
        </aside>

        <div className="board-container">
          <div className="board">
            {grid.map((row, r) => (
              row.map((tile, c) => {
                const isSelected = selectedTile?.r === r && selectedTile?.c === c
                // Map tile types to custom asset filenames
                const tileAssets = [
                  'Alpha.png',
                  'Clover.png',
                  'Eyes.png',
                  'Lightbulb.png',
                  'Mr Observer.png',
                  'Signal Node.png'
                ]

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`tile tile-${tile} ${isSelected ? 'selected' : ''} ${tile === null ? 'cleared' : ''}`}
                    onClick={() => handleTileClick(r, c)}
                    draggable={!isProcessing}
                    onDragStart={(e) => onDragStart(e, r, c)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, r, c)}
                    onTouchStart={(e) => onTouchStart(e, r, c)}
                    onTouchEnd={onTouchEnd}
                    data-row={r}
                    data-col={c}
                  >
                    <div className="tile-icon">
                      {tile !== null && (
                        <img
                          src={`/tiles/${tileAssets[tile]}`}
                          alt={`Tile ${tile}`}
                          className="tile-img"
                        />
                      )}
                    </div>
                    {hasTag && <div className="tile-tag">24</div>}
                  </div>
                )
              })
            ))}
          </div>
        </div>
      </div>

      <div className="footer-nav">
        <div className="nav-item" onClick={() => setView('about')}>
          <span className="nav-icon">⌂</span>
          <span className="nav-label">HOME</span>
        </div>
        <div className="nav-item active" onClick={() => setView('game')}>
          <span className="nav-icon">🎮</span>
          <span className="nav-label">PLAY</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">⚙</span>
          <span className="nav-label">SETTINGS</span>
        </div>
      </div>
    </div>
  )
}

export default App

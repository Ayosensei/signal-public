import { useState, useEffect, useCallback } from 'react'
import './index.css'

const GRID_SIZE = 8
const TILE_TYPES = 5

function App() {
  const [grid, setGrid] = useState([])
  const [selectedTile, setSelectedTile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const generateBoard = useCallback(() => {
    const newGrid = []
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = []
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push(Math.floor(Math.random() * TILE_TYPES))
      }
      newGrid.push(row)
    }
    // Ensure no matches on start
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

  const checkMatches = (currentGrid) => {
    const matches = []
    
    // Horizontal
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
    
    // Vertical
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

  const handleMatches = async (currentGrid) => {
    const matches = checkMatches(currentGrid)
    if (!matches) {
        setIsProcessing(false)
        return
    }

    setIsProcessing(true)
    
    // 1. Clear matches
    const newGrid = currentGrid.map(row => [...row])
    matches.forEach(({ r, c }) => {
      newGrid[r][c] = null
    })
    setGrid(newGrid)

    // Delay for "feeling" the clear
    await new Promise(resolve => setTimeout(resolve, 300))

    // 2. Gravity (Collapse)
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

    // 3. Refill
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE; r++) {
        if (newGrid[r][c] === null) {
          newGrid[r][c] = Math.floor(Math.random() * TILE_TYPES)
        }
      }
    }
    setGrid([...newGrid])
    await new Promise(resolve => setTimeout(resolve, 300))

    // 4. Recursive check for cascading matches
    handleMatches(newGrid)
  }

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
        // Swap back if no match
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

  return (
    <div className="app-container">
      <h1 className="game-title">SIGNAL</h1>
      <div className="board">
        {grid.map((row, r) => (
          row.map((tile, c) => {
            const isSelected = selectedTile?.r === r && selectedTile?.c === c
            return (
              <div 
                key={`${r}-${c}`} 
                className={`tile tile-${tile} ${isSelected ? 'selected' : ''} ${tile === null ? 'cleared' : ''}`}
                onClick={() => handleTileClick(r, c)}
                data-row={r}
                data-col={c}
              />
            )
          })
        ))}
      </div>
      <div className="controls">
        <button onClick={generateBoard} disabled={isProcessing} className="restart-btn">RESET SIGNAL</button>
      </div>
    </div>
  )
}

export default App

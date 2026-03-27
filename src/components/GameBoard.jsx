import React, { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Tile from './Tile'

const GameBoard = ({ grid, isProcessing, swapTiles }) => {
  const [selectedTile, setSelectedTile] = useState(null)
  const [swipeOrigin, setSwipeOrigin] = useState(null)

  const processTap = useCallback((r, c) => {
    if (isProcessing) return
    
    if (selectedTile && selectedTile.r === r && selectedTile.c === c) {
      setSelectedTile(null)
      return
    }

    if (!selectedTile) {
      setSelectedTile({ r, c })
    } else {
      const isAdjacent = Math.abs(selectedTile.r - r) + Math.abs(selectedTile.c - c) === 1
      if (isAdjacent) {
        swapTiles(selectedTile, { r, c })
        setSelectedTile(null)
      } else {
        setSelectedTile({ r, c })
      }
    }
  }, [isProcessing, selectedTile, swapTiles])

  const handlePointerDown = useCallback((e, r, c) => {
    if (isProcessing) return
    setSwipeOrigin({ x: e.clientX, y: e.clientY, r, c })
  }, [isProcessing])

  const handlePointerMove = useCallback((e) => {
    if (!swipeOrigin || isProcessing) return

    const dx = e.clientX - swipeOrigin.x
    const dy = e.clientY - swipeOrigin.y
    const threshold = 40 

    let targetR = swipeOrigin.r
    let targetC = swipeOrigin.c

    if (Math.abs(dx) > threshold) {
      targetC = dx > 0 ? swipeOrigin.c + 1 : swipeOrigin.c - 1
    } else if (Math.abs(dy) > threshold) {
      targetR = dy > 0 ? swipeOrigin.r + 1 : swipeOrigin.r - 1
    } else {
      return 
    }

    if (targetR < 0 || targetR >= 8 || targetC < 0 || targetC >= 8) {
      setSwipeOrigin(null)
      return
    }

    swapTiles({ r: swipeOrigin.r, c: swipeOrigin.c }, { r: targetR, c: targetC })
    setSelectedTile(null)
    setSwipeOrigin(null) 
  }, [swipeOrigin, isProcessing, swapTiles])

  const handlePointerUp = useCallback(() => {
    if (swipeOrigin) {
      processTap(swipeOrigin.r, swipeOrigin.c)
      setSwipeOrigin(null)
    }
  }, [swipeOrigin, processTap])

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  return (
    <div className="board">
      <AnimatePresence>
        {grid.flatMap((row, r) => 
          row.map((tile, c) => tile && (
            <Tile
              key={tile.id}
              r={r}
              c={c}
              tile={tile}
              isSelected={selectedTile?.r === r && selectedTile?.c === c}
              isProcessing={isProcessing}
              onPointerDown={handlePointerDown}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  )
}

export default GameBoard

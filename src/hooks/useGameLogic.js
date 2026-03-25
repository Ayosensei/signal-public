import { useState, useCallback, useEffect } from 'react'

const GRID_SIZE = 8
const NORMAL_TILE_TYPES = 5
const OBSERVER_TYPE = 5

export const useGameLogic = (mode = 'observation') => {
  const [grid, setGrid] = useState([])
  const [score, setScore] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [timer, setTimer] = useState(60) // Signal Mode
  const [movesLeft, setMovesLeft] = useState(25) // Conviction Mode
  const [isGameOver, setIsGameOver] = useState(false)

  const findMatchGroups = useCallback((currentGrid) => {
    const horizontalMatches = []
    const verticalMatches = []

    for (let r = 0; r < GRID_SIZE; r++) {
      let matchCount = 1
      for (let c = 0; c < GRID_SIZE; c++) {
        const current = currentGrid[r][c]
        const next = c < GRID_SIZE - 1 ? currentGrid[r][c + 1] : null

        if (current && next && current.type === next.type && current.type !== null && current.type !== OBSERVER_TYPE) {
          matchCount++
        } else {
          if (matchCount >= 3) {
            const line = []
            for (let i = 0; i < matchCount; i++) line.push({ r, c: c - i })
            horizontalMatches.push(line)
          }
          matchCount = 1
        }
      }
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      let matchCount = 1
      for (let r = 0; r < GRID_SIZE; r++) {
        const current = currentGrid[r][c]
        const next = r < GRID_SIZE - 1 ? currentGrid[r + 1][c] : null

        if (current && next && current.type === next.type && current.type !== null && current.type !== OBSERVER_TYPE) {
          matchCount++
        } else {
          if (matchCount >= 3) {
            const line = []
            for (let i = 0; i < matchCount; i++) line.push({ r: r - i, c })
            verticalMatches.push(line)
          }
          matchCount = 1
        }
      }
    }

    const allLines = [...horizontalMatches, ...verticalMatches]
    if (allLines.length === 0) return []

    const groups = []
    const visitedIndices = new Set()

    for (let i = 0; i < allLines.length; i++) {
      if (visitedIndices.has(i)) continue

      const currentGroup = new Set(allLines[i].map(pt => `${pt.r},${pt.c}`))
      const type = currentGrid[allLines[i][0].r][allLines[i][0].c].type
      let addedToGroup = true

      const linesInCurrentGroup = [allLines[i]]

      while (addedToGroup) {
        addedToGroup = false
        for (let j = i + 1; j < allLines.length; j++) {
          if (visitedIndices.has(j)) continue
          const otherLineType = currentGrid[allLines[j][0].r][allLines[j][0].c].type
          if (type !== otherLineType) continue

          const hasIntersection = allLines[j].some(pt => currentGroup.has(`${pt.r},${pt.c}`))
          if (hasIntersection) {
            allLines[j].forEach(pt => currentGroup.add(`${pt.r},${pt.c}`))
            linesInCurrentGroup.push(allLines[j])
            visitedIndices.add(j)
            addedToGroup = true
          }
        }
      }

      // Metadata for special tile spawning
      const groupCoords = Array.from(currentGroup).map(str => {
        const [r, c] = str.split(',').map(Number)
        return { r, c }
      })

      const maxLineLength = Math.max(...linesInCurrentGroup.map(l => l.length))
      const hasIntersection = linesInCurrentGroup.length > 1 && 
        horizontalMatches.some(h => linesInCurrentGroup.includes(h)) && 
        verticalMatches.some(v => linesInCurrentGroup.includes(v))

      groups.push({
        coords: groupCoords,
        type: type,
        maxLineLength,
        hasIntersection
      })
    }

    return groups
  }, [])

  useEffect(() => {
    if (mode === 'signal' && !isGameOver) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsGameOver(true)
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [mode, isGameOver])

  const generateBoard = useCallback(() => {
    const newGrid = []
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = []
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push({ type: Math.floor(Math.random() * NORMAL_TILE_TYPES), special: null })
      }
      newGrid.push(row)
    }

    while (findMatchGroups(newGrid).length > 0) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          newGrid[r][c] = { type: Math.floor(Math.random() * NORMAL_TILE_TYPES), special: null }
        }
      }
    }
    setGrid(newGrid)
    setScore(0)
    setTimer(60)
    setMovesLeft(25)
    setIsGameOver(false)
  }, [findMatchGroups])

  const activateSpecial = async (currentGrid, r, c, tileType) => {
    const tile = currentGrid[r][c]
    if (!tile || !tile.special) return currentGrid

    const newGrid = currentGrid.map(row => [...row])
    newGrid[r][c] = null // Consume the special tile

    let coordsToClear = []

    if (tile.special === 'linear-h') {
      for (let i = 0; i < GRID_SIZE; i++) coordsToClear.push({ r, c: i })
    } else if (tile.special === 'linear-v') {
      for (let i = 0; i < GRID_SIZE; i++) coordsToClear.push({ r: i, c })
    } else if (tile.special === 'pulse') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) coordsToClear.push({ r: nr, c: nc })
        }
      }
    } else if (tile.special === 'observer') {
      const randomType = tileType !== undefined ? tileType : Math.floor(Math.random() * NORMAL_TILE_TYPES)
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          if (newGrid[i][j]?.type === randomType) coordsToClear.push({ r: i, c: j })
        }
      }
    }

    coordsToClear.forEach(({ r: cr, c: cc }) => {
      if (newGrid[cr][cc]) {
        // Recursively activate if we hit another special tile
        if (newGrid[cr][cc].special && (cr !== r || cc !== c)) {
          // This would be complex to handle async here, so we'll just mark it for clearing
          // and the next gravity/refill cycle will handle consequences
        }
        newGrid[cr][cc] = null
      }
    })

    return newGrid
  }

  const runMatches = async (currentGrid, swapPos1 = null, swapPos2 = null) => {
    const groups = findMatchGroups(currentGrid)
    if (groups.length === 0) {
      setIsProcessing(false)
      return
    }

    setIsProcessing(true)

    let newGrid = currentGrid.map(row => [...row])
    let clearedCount = 0

    // Check for special tiles in the cleared areas BEFORE clearing them
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const isMatched = groups.some(g => g.coords.some(pt => pt.r === r && pt.c === c))
        if (isMatched && newGrid[r][c]?.special) {
          newGrid = await activateSpecial(newGrid, r, c, newGrid[r][c].type)
        }
      }
    }

    groups.forEach(group => {
      clearedCount += group.coords.length
      
      let specialToSpawn = null
      if (group.maxLineLength >= 5 && !group.hasIntersection) {
        specialToSpawn = 'observer'
      } else if (group.hasIntersection) {
        specialToSpawn = 'pulse'
      } else if (group.maxLineLength === 4) {
        // Randomly choose H or V for now, or based on the line direction
        specialToSpawn = Math.random() > 0.5 ? 'linear-h' : 'linear-v'
      }

      let spawnCoord = group.coords[0]
      if (swapPos1 && swapPos2) {
        const inGroup1 = group.coords.some(pt => pt.r === swapPos1.r && pt.c === swapPos1.c)
        const inGroup2 = group.coords.some(pt => pt.r === swapPos2.r && pt.c === swapPos2.c)
        if (inGroup1) spawnCoord = swapPos1
        else if (inGroup2) spawnCoord = swapPos2
      }

      group.coords.forEach(({ r, c }) => {
        if (newGrid[r][c] !== null) newGrid[r][c] = null
      })

      if (specialToSpawn !== null) {
        newGrid[spawnCoord.r][spawnCoord.c] = { 
          type: specialToSpawn === 'observer' ? OBSERVER_TYPE : group.type, 
          special: specialToSpawn 
        }
      }
    })

    setGrid(newGrid)
    setScore(prev => prev + clearedCount * 10)

    await new Promise(resolve => setTimeout(resolve, 300))
    await runGravity(newGrid)
  }

  const runGravity = async (currentGrid) => {
    const newGrid = currentGrid.map(row => [...row])

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

    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE; r++) {
        if (newGrid[r][c] === null) {
          newGrid[r][c] = { type: Math.floor(Math.random() * NORMAL_TILE_TYPES), special: null }
        }
      }
    }
    setGrid([...newGrid])
    await new Promise(resolve => setTimeout(resolve, 300))

    await runMatches(newGrid)
  }

  const swapTiles = useCallback(async (tile1, tile2) => {
    if (isGameOver) return
    setIsProcessing(true)
    
    if (mode === 'conviction' && movesLeft <= 0) {
      setIsGameOver(true)
      setIsProcessing(false)
      return
    }

    let newGrid = grid.map(row => [...row])
    const t1 = newGrid[tile1.r][tile1.c]
    const t2 = newGrid[tile2.r][tile2.c]
    
    newGrid[tile1.r][tile1.c] = t2
    newGrid[tile2.r][tile2.c] = t1

    // Check for special match combinations or manual activations
    const isT1Special = t1?.special
    const isT2Special = t2?.special

    if (isT1Special && isT2Special) {
      // Massive combo! For now just activate both
      newGrid = await activateSpecial(newGrid, tile1.r, tile1.c, t2?.type)
      newGrid = await activateSpecial(newGrid, tile2.r, tile2.c, t1?.type)
      if (mode === 'conviction') setMovesLeft(prev => prev - 1)
      setGrid(newGrid)
      await runGravity(newGrid)
      return
    }

    // Unify Observer Logic
    if (t1?.special === 'observer' || t2?.special === 'observer') {
      const observerPos = t1?.special === 'observer' ? tile1 : tile2
      const otherPos = t1?.special === 'observer' ? tile2 : tile1
      const otherType = newGrid[otherPos.r][otherPos.c]?.type
      
      newGrid = await activateSpecial(newGrid, observerPos.r, observerPos.c, otherType)
      if (mode === 'conviction') setMovesLeft(prev => prev - 1)
      setGrid(newGrid)
      await runGravity(newGrid)
      return
    }

    const groups = findMatchGroups(newGrid)
    if (groups.length > 0) {
      if (mode === 'conviction') setMovesLeft(prev => prev - 1)
      setGrid(newGrid)
      await runMatches(newGrid, tile1, tile2)
    } else {
      setGrid(newGrid)
      await new Promise(resolve => setTimeout(resolve, 200))
      setGrid(grid.map(row => [...row]))
      setIsProcessing(false)
    }
  }, [grid, mode, movesLeft, isGameOver, findMatchGroups])

  return {
    grid,
    score,
    timer,
    movesLeft,
    isGameOver,
    isProcessing,
    swapTiles,
    generateBoard
  }
}

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
    // ... (rest of findMatchGroups remains the same)
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

      while (addedToGroup) {
        addedToGroup = false
        for (let j = i + 1; j < allLines.length; j++) {
          if (visitedIndices.has(j)) continue
          const otherLineType = currentGrid[allLines[j][0].r][allLines[j][0].c].type
          if (type !== otherLineType) continue

          const hasIntersection = allLines[j].some(pt => currentGroup.has(`${pt.r},${pt.c}`))
          if (hasIntersection) {
            allLines[j].forEach(pt => currentGroup.add(`${pt.r},${pt.c}`))
            visitedIndices.add(j)
            addedToGroup = true
          }
        }
      }

      groups.push({
        coords: Array.from(currentGroup).map(str => {
          const [r, c] = str.split(',').map(Number)
          return { r, c }
        }),
        type: type,
        linesInvolved: horizontalMatches.filter(l => l.some(pt => currentGroup.has(`${pt.r},${pt.c}`))).length +
          verticalMatches.filter(l => l.some(pt => currentGroup.has(`${pt.r},${pt.c}`))).length,
        maxLength: Math.max(...allLines.filter(l => l.some(pt => currentGroup.has(`${pt.r},${pt.c}`))).map(l => l.length))
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

  // Define logic functions inside the hook but not as useCallbacks to avoid closure issues
  // We will wrap the public entry points in useCallback
  const runMatches = async (currentGrid, swapPos1 = null, swapPos2 = null) => {
    const groups = findMatchGroups(currentGrid)
    if (groups.length === 0) {
      setIsProcessing(false)
      return
    }

    setIsProcessing(true)

    const newGrid = currentGrid.map(row => [...row])
    let clearedCount = 0

    groups.forEach(group => {
      clearedCount += group.coords.length
      let specialToSpawn = group.maxLength >= 5 ? OBSERVER_TYPE : null
      let spawnCoord = group.coords[0]

      if (swapPos1 && swapPos2) {
        const inGroup1 = group.coords.some(pt => pt.r === swapPos1.r && pt.c === swapPos1.c)
        const inGroup2 = group.coords.some(pt => pt.r === swapPos2.r && pt.c === swapPos2.c)
        if (inGroup1) spawnCoord = swapPos1
        else if (inGroup2) spawnCoord = swapPos2
      }

      group.coords.forEach(({ r, c }) => {
        newGrid[r][c] = null
      })

      if (specialToSpawn !== null) {
        newGrid[spawnCoord.r][spawnCoord.c] = { type: specialToSpawn, special: null }
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

    const newGrid = grid.map(row => [...row])
    const temp = newGrid[tile1.r][tile1.c]
    newGrid[tile1.r][tile1.c] = newGrid[tile2.r][tile2.c]
    newGrid[tile2.r][tile2.c] = temp

    const t1IsObserver = newGrid[tile1.r][tile1.c]?.type === OBSERVER_TYPE
    const t2IsObserver = newGrid[tile2.r][tile2.c]?.type === OBSERVER_TYPE

    if (t1IsObserver || t2IsObserver) {
      if (mode === 'conviction') setMovesLeft(prev => prev - 1)
      setGrid(newGrid)
      await new Promise(resolve => setTimeout(resolve, 200))

      const targetColor = t1IsObserver ? newGrid[tile2.r][tile2.c]?.type : newGrid[tile1.r][tile1.c]?.type

      const clearedGrid = newGrid.map(row => [...row])
      let clearedCount = 0
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (clearedGrid[r][c] && (clearedGrid[r][c].type === targetColor || clearedGrid[r][c].type === OBSERVER_TYPE)) {
            clearedGrid[r][c] = null
            clearedCount++
          }
        }
      }
      setGrid(clearedGrid)
      setScore(prev => prev + clearedCount * 10)
      await new Promise(resolve => setTimeout(resolve, 300))

      await runGravity(clearedGrid)
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

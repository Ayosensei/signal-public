import { useState, useCallback, useEffect, useRef } from 'react'

const GRID_SIZE = 8
const NORMAL_TILE_TYPES = 5
const WILDCARD_TYPE = 5

export const useGameLogic = (mode = 'observation', levelConfig = null) => {
  // --- 1. STATE HOOKS ---
  const [grid, setGrid] = useState([])
  const [score, setScore] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [timer, setTimer] = useState(60)
  const [movesLeft, setMovesLeft] = useState(25)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isWin, setIsWin] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentSequence, setCurrentSequence] = useState(levelConfig)
  const [gameStartTime, setGameStartTime] = useState(null)
  
  // --- 2. REF HOOKS ---
  const tileIdRef = useRef(0)
  const scoreRef = useRef(0) // Track score for win detection within async loops

  // --- 3. CORE UTILITIES (NO HOOKS) ---
  const getNextId = () => `tile-${tileIdRef.current++}`
  
  const getRandomTileType = () => {
    const r = Math.random()
    if (r < 0.18) return 0
    if (r < 0.43) return 1 // Gem 2 (25%)
    if (r < 0.62) return 2
    if (r < 0.81) return 3
    return 4
  }

  const findMatchGroups = (currentGrid) => {
    const horizontalMatches = []
    const verticalMatches = []
    for (let r = 0; r < GRID_SIZE; r++) {
      let matchCount = 1
      for (let c = 0; c < GRID_SIZE; c++) {
        const current = currentGrid[r][c]
        const next = c < GRID_SIZE - 1 ? currentGrid[r][c + 1] : null
        if (current && next && current.type === next.type && current.type !== null && current.type !== WILDCARD_TYPE) {
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
        if (current && next && current.type === next.type && current.type !== null && current.type !== WILDCARD_TYPE) {
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
          if (type !== currentGrid[allLines[j][0].r][allLines[j][0].c].type) continue
          if (allLines[j].some(pt => currentGroup.has(`${pt.r},${pt.c}`))) {
            allLines[j].forEach(pt => currentGroup.add(`${pt.r},${pt.c}`))
            linesInCurrentGroup.push(allLines[j])
            visitedIndices.add(j)
            addedToGroup = true
          }
        }
      }
      const groupCoords = Array.from(currentGroup).map(str => {
        const [r, c] = str.split(',').map(Number)
        return { r, c }
      })
      const maxLineLength = Math.max(...linesInCurrentGroup.map(l => l.length))
      const longestLine = linesInCurrentGroup.find(l => l.length === maxLineLength)
      const orientation = horizontalMatches.includes(longestLine) ? 'horizontal' : 'vertical'
      const hasIntersection = linesInCurrentGroup.length > 1 && 
        horizontalMatches.some(h => linesInCurrentGroup.includes(h)) && 
        verticalMatches.some(v => linesInCurrentGroup.includes(v))
      groups.push({ coords: groupCoords, type, maxLineLength, orientation, hasIntersection })
    }
    return groups
  }
  
  const hasPossibleMoves = useCallback((currentGrid) => {
    // Check for any potential match by simulating every possible swap
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        // Horizontal swap check
        if (c < GRID_SIZE - 1) {
          const nextGrid = currentGrid.map(row => [...row])
          const t1 = nextGrid[r][c]
          const t2 = nextGrid[r][c + 1]
          if (t1 && t2) {
            nextGrid[r][c] = t2
            nextGrid[r][c + 1] = t1
            if (findMatchGroups(nextGrid).length > 0) return true
            // Support wildcard swaps
            if (t1.type === WILDCARD_TYPE || t2.type === WILDCARD_TYPE) return true
            // Support linear combos
            const isT1Linear = t1.special === 'linear-h' || t1.special === 'linear-v'
            const isT2Linear = t2.special === 'linear-h' || t2.special === 'linear-v'
            if (isT1Linear && isT2Linear) return true
          }
        }
        // Vertical swap check
        if (r < GRID_SIZE - 1) {
          const nextGrid = currentGrid.map(row => [...row])
          const t1 = nextGrid[r][c]
          const t2 = nextGrid[r + 1][c]
          if (t1 && t2) {
            nextGrid[r][c] = t2
            nextGrid[r + 1][c] = t1
            if (findMatchGroups(nextGrid).length > 0) return true
            // Support wildcard swaps
            if (t1.type === WILDCARD_TYPE || t2.type === WILDCARD_TYPE) return true
            // Support linear combos
            const isT1Linear = t1.special === 'linear-h' || t1.special === 'linear-v'
            const isT2Linear = t2.special === 'linear-h' || t2.special === 'linear-v'
            if (isT1Linear && isT2Linear) return true
          }
        }
      }
    }
    return false
  }, [])

  const reshuffleBoard = useCallback(async (currentGrid) => {
    setIsProcessing(true)
    let tempGrid = currentGrid.map(row => [...row])
    let flatTiles = tempGrid.flat().filter(t => t !== null)
    
    let attempts = 0
    let validShuffle = false
    while (!validShuffle && attempts < 100) {
      attempts++
      // Shuffle the tiles
      for (let i = flatTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flatTiles[i], flatTiles[j]] = [flatTiles[j], flatTiles[i]]
      }
      
      // Place back into grid
      let newGrid = []
      for (let r = 0; r < GRID_SIZE; r++) {
        newGrid.push(flatTiles.slice(r * GRID_SIZE, (r + 1) * GRID_SIZE))
      }
      
      if (findMatchGroups(newGrid).length === 0 && hasPossibleMoves(newGrid)) {
        setGrid(newGrid)
        validShuffle = true
        await new Promise(res => setTimeout(res, 400))
      }
    }
    setIsProcessing(false)
  }, [hasPossibleMoves])

  // --- 4. THE CHAIN PROCESSOR (Unified Logic) ---
  const processGridLogic = useCallback(async (initialGrid, interactionTile = null) => {
    let currentGrid = initialGrid.map(row => [...row])
    let totalPoints = 0

    const triggerSpecial = (r, c, special, type, grid) => {
      const affected = new Set()
      affected.add(`${r},${c}`)
      if (special === 'linear-h') for (let i = 0; i < GRID_SIZE; i++) affected.add(`${r},${i}`)
      else if (special === 'linear-v') for (let i = 0; i < GRID_SIZE; i++) affected.add(`${i},${c}`)
      else if (special === 'pulse') {
        for (let i = r - 1; i <= r + 1; i++) 
          for (let j = c - 1; j <= c + 1; j++) 
            if (i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE) affected.add(`${i},${j}`)
      }
      else if (special === 'wildcard') {
        for (let i = 0; i < GRID_SIZE; i++) 
          for (let j = 0; j < GRID_SIZE; j++) 
            if (grid[i][j]?.type === type) affected.add(`${i},${j}`)
      }
      return Array.from(affected).map(s => {
        const [ar, ac] = s.split(',').map(Number)
        return { r: ar, c: ac }
      })
    }

    const evaluate = async (gridState, firstTrigger = false) => {
      const groups = findMatchGroups(gridState)
      if (groups.length === 0) {
        // Check for empty spaces anyway (critical for Wildcard clears)
        const hasNulls = gridState.some(row => row.some(tile => tile === null))
        if (hasNulls) {
          await applyGravity(gridState)
        } else {
          // Check for no moves possible
          if (!hasPossibleMoves(gridState)) {
            await reshuffleBoard(gridState)
          } else {
            if (mode === 'conviction' && movesLeft <= 0 && scoreRef.current < (currentSequence?.objective?.target || 10000)) {
              setIsGameOver(true)
            }
            setIsProcessing(false)
          }
        }
        return
      }

      const nextGrid = gridState.map(row => [...row])
      const toClear = new Set()
      
      groups.forEach(group => {
        let groupPoints = group.coords.length * 100

        let spawnPos = group.coords[0]
        if (firstTrigger && interactionTile) {
          const match = group.coords.find(p => p.r === interactionTile.r && p.c === interactionTile.c)
          if (match) spawnPos = match
        }

        let spawnType = null
        if (group.coords.length >= 5) spawnType = 'wildcard'
        else if (group.hasIntersection) spawnType = 'pulse'
        else if (group.coords.length === 4) spawnType = group.orientation === 'horizontal' ? 'linear-v' : 'linear-h'

        group.coords.forEach(({ r, c }) => {
          const tile = gridState[r][c]
          if (tile?.special) {
            if (tile.special === 'linear-h' || tile.special === 'linear-v') {
              groupPoints += 500 // Bonus points for triggering linear tiles
            }
            triggerSpecial(r, c, tile.special, tile.type, gridState).forEach(p => toClear.add(`${p.r},${p.c}`))
          }
          toClear.add(`${r},${c}`)
        })
        
        totalPoints += groupPoints

        if (spawnType) {
          nextGrid[spawnPos.r][spawnPos.c] = {
            id: getNextId(),
            type: spawnType === 'wildcard' ? WILDCARD_TYPE : group.type,
            special: spawnType
          }
        }
      })

      toClear.forEach(s => {
        const [r, c] = s.split(',').map(Number)
        if (!nextGrid[r][c] || nextGrid[r][c].id === gridState[r][c]?.id) nextGrid[r][c] = null
      })

      const pointsToAward = totalPoints
      setScore(prev => {
        const nextScore = prev + pointsToAward
        scoreRef.current = nextScore
        if (currentSequence && nextScore >= currentSequence.objective.target) setIsWin(true)
        return nextScore
      })
      totalPoints = 0 // Reset for next cascade
      
      setGrid(nextGrid)
      await new Promise(res => setTimeout(res, 350))
      await applyGravity(nextGrid)
    }

    const applyGravity = async (gridState) => {
      const nextGrid = gridState.map(row => [...row])
      let changed = false
      for (let c = 0; c < GRID_SIZE; c++) {
        let empty = -1
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          if (nextGrid[r][c] === null && empty === -1) empty = r
          else if (nextGrid[r][c] !== null && empty !== -1) {
            nextGrid[empty][c] = nextGrid[r][c]
            nextGrid[r][c] = null
            empty--
            changed = true
          }
        }
        for (let r = 0; r < GRID_SIZE; r++) {
          if (nextGrid[r][c] === null) {
            nextGrid[r][c] = { id: getNextId(), type: getRandomTileType(), special: null }
            changed = true
          }
        }
      }
      if (changed) {
        setGrid(nextGrid)
        await new Promise(res => setTimeout(res, 350))
        await evaluate(nextGrid)
      }
    }

    await evaluate(currentGrid, true)
  }, [mode, currentSequence, movesLeft])

  // --- 5. SWAP HOOK ---
  const swapTiles = useCallback(async (tile1, tile2) => {
    if (isGameOver || isPaused || isProcessing) return
    setIsProcessing(true)
    if (mode === 'conviction' && movesLeft <= 0) { setIsProcessing(false); return; }

    const t1 = grid[tile1.r][tile1.c]
    const t2 = grid[tile2.r][tile2.c]

    if (t1.type === WILDCARD_TYPE || t2.type === WILDCARD_TYPE) {
      if (mode === 'conviction') setMovesLeft(prev => prev - 1)
      const observer = t1.type === WILDCARD_TYPE ? t1 : t2
      const target = t1.type === WILDCARD_TYPE ? t2 : t1
      let finalGrid = grid.map(row => [...row])
      finalGrid[tile1.r][tile1.c] = null; finalGrid[tile2.r][tile2.c] = null;

      if (target.type === WILDCARD_TYPE) {
        for (let r = 0; r < GRID_SIZE; r++) for (let c = 0; c < GRID_SIZE; c++) finalGrid[r][c] = null
      } else if (target.special) {
        for (let r = 0; r < GRID_SIZE; r++) for (let c = 0; c < GRID_SIZE; c++) {
          if (finalGrid[r][c]?.type === target.type) finalGrid[r][c].special = target.special
        }
      } else {
        for (let r = 0; r < GRID_SIZE; r++) for (let c = 0; c < GRID_SIZE; c++) {
          if (finalGrid[r][c]?.type === target.type) finalGrid[r][c] = null
        }
      }
      setGrid(finalGrid)
      await new Promise(res => setTimeout(res, 400))
      await processGridLogic(finalGrid)
      return
    }

    const isT1Linear = t1.special === 'linear-h' || t1.special === 'linear-v'
    const isT2Linear = t2.special === 'linear-h' || t2.special === 'linear-v'

    if (isT1Linear && isT2Linear) {
      if (mode === 'conviction') setMovesLeft(prev => prev - 1)
      let finalGrid = grid.map(row => [...row])
      
      const toClear = new Set()
      
      for (let i = 0; i < GRID_SIZE; i++) {
        toClear.add(`${tile1.r},${i}`)
        toClear.add(`${i},${tile1.c}`)
        toClear.add(`${tile2.r},${i}`)
        toClear.add(`${i},${tile2.c}`)
      }
      
      let comboPoints = 0
      toClear.forEach(pos => {
        const [r, c] = pos.split(',').map(Number)
        if (finalGrid[r][c]) {
          comboPoints += 100
          finalGrid[r][c] = null
        }
      })
      
      setScore(prev => {
        const nextScore = prev + comboPoints
        scoreRef.current = nextScore
        if (currentSequence && nextScore >= currentSequence.objective.target) setIsWin(true)
        return nextScore
      })
      
      setGrid(finalGrid)
      await new Promise(res => setTimeout(res, 400))
      await processGridLogic(finalGrid)
      return
    }

    const nextGrid = grid.map(row => [...row])
    nextGrid[tile1.r][tile1.c] = t2; nextGrid[tile2.r][tile2.c] = t1;
    setGrid(nextGrid)
    await new Promise(res => setTimeout(res, 350))

    if (findMatchGroups(nextGrid).length > 0) {
      if (mode === 'conviction') setMovesLeft(prev => prev - 1)
      await processGridLogic(nextGrid, tile2)
    } else {
      const reverted = grid.map(row => [...row])
      setGrid(reverted)
      await new Promise(res => setTimeout(res, 350))
      setIsProcessing(false)
    }
  }, [grid, isGameOver, isPaused, isProcessing, mode, movesLeft, processGridLogic])

  // --- 6. INITIALIZATION & TIMER ---
  const generateBoard = useCallback(() => {
    let newGrid = []
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = []
      for (let c = 0; c < GRID_SIZE; c++) row.push({ id: getNextId(), type: getRandomTileType(), special: null })
      newGrid.push(row)
    }
    while (findMatchGroups(newGrid).length > 0) {
      for (let r = 0; r < GRID_SIZE; r++) for (let c = 0; c < GRID_SIZE; c++) {
        newGrid[r][c] = { id: getNextId(), type: getRandomTileType(), special: null }
      }
    }
    setGrid(newGrid); setScore(0); scoreRef.current = 0;
    setTimer(currentSequence?.time || 60); setMovesLeft(currentSequence?.moves || 25);
    setIsGameOver(false); setIsWin(false); setIsProcessing(false);
    setGameStartTime(Date.now());
  }, [currentSequence])

  useEffect(() => {
    generateBoard()
  }, [generateBoard])

  useEffect(() => {
    const gameMode = currentSequence?.mode || mode
    if (gameMode === 'signal' && !isGameOver && !isWin && !isPaused) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) { setIsGameOver(true); clearInterval(interval); return 0; }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [mode, isGameOver, isWin, currentSequence, isPaused])

  return {
    grid, score, timer, movesLeft, isGameOver, isWin, isProcessing, isPaused,
    setIsPaused, swapTiles, generateBoard, currentSequence, gameStartTime
  }
}

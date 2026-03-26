import { useState, useCallback, useEffect, useRef } from 'react'

const GRID_SIZE = 8
const NORMAL_TILE_TYPES = 5
const OBSERVER_TYPE = 5

export const useGameLogic = (mode = 'observation', levelConfig = null) => {
  const [grid, setGrid] = useState([])
  const [score, setScore] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [timer, setTimer] = useState(60)
  const [movesLeft, setMovesLeft] = useState(25)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isWin, setIsWin] = useState(false)
  const [currentSequence, setCurrentSequence] = useState(levelConfig)
  
  const tileIdRef = useRef(0)
  const getNextId = useCallback(() => `tile-${tileIdRef.current++}`, [])

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
      const longestLine = linesInCurrentGroup.find(l => l.length === maxLineLength)
      const orientation = horizontalMatches.includes(longestLine) ? 'horizontal' : 'vertical'
      
      const hasIntersection = linesInCurrentGroup.length > 1 && 
        horizontalMatches.some(h => linesInCurrentGroup.includes(h)) && 
        verticalMatches.some(v => linesInCurrentGroup.includes(v))

      groups.push({
        coords: groupCoords,
        type: type,
        maxLineLength,
        orientation,
        hasIntersection
      })
    }

    return groups
  }, [])

  useEffect(() => {
    const gameMode = currentSequence?.mode || mode
    if (gameMode === 'signal' && !isGameOver && !isWin) {
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
  }, [mode, isGameOver, isWin, currentSequence])

  const generateBoard = useCallback(() => {
    const newGrid = []
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = []
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push({ 
          id: getNextId(), 
          type: Math.floor(Math.random() * NORMAL_TILE_TYPES), 
          special: null 
        })
      }
      newGrid.push(row)
    }

    while (findMatchGroups(newGrid).length > 0) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          newGrid[r][c] = { 
            id: getNextId(), 
            type: Math.floor(Math.random() * NORMAL_TILE_TYPES), 
            special: null 
          }
        }
      }
    }
    setGrid(newGrid)
    setScore(0)
    
    if (currentSequence) {
      setTimer(currentSequence.time || 60)
      setMovesLeft(currentSequence.moves || 25)
    } else {
      setTimer(60)
      setMovesLeft(25)
    }
    
    setIsGameOver(false)
    setIsWin(false)
  }, [findMatchGroups, currentSequence, getNextId])

  // Generate board when level or mode changes
  useEffect(() => {
    setCurrentSequence(levelConfig)
  }, [levelConfig])

  useEffect(() => {
    generateBoard()
  }, [generateBoard, mode])

  const activateSpecial = async (currentGrid, r, c, tileType) => {
    let newGrid = currentGrid.map(row => [...row])
    let tilesToProcess = [{ r, c }]
    let processedTiles = new Set()
    let finalCoordsToClear = []

    while (tilesToProcess.length > 0) {
      const { r: curR, c: curC } = tilesToProcess.shift()
      const key = `${curR},${curC}`
      if (processedTiles.has(key)) continue
      processedTiles.add(key)

      const tile = newGrid[curR][curC]
      if (!tile || !tile.special) {
        finalCoordsToClear.push({ r: curR, c: curC })
        continue
      }

      finalCoordsToClear.push({ r: curR, c: curC })
      let area = []

      if (tile.special === 'linear-h') {
        for (let i = 0; i < GRID_SIZE; i++) area.push({ r: curR, c: i })
      } else if (tile.special === 'linear-v') {
        for (let i = 0; i < GRID_SIZE; i++) area.push({ r: i, c: curC })
      } else if (tile.special === 'pulse') {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = curR + dr, nc = curC + dc
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) area.push({ r: nr, c: nc })
          }
        }
      } else if (tile.special === 'observer') {
        const targetType = (tileType !== undefined && tileType !== OBSERVER_TYPE) 
          ? tileType 
          : Math.floor(Math.random() * NORMAL_TILE_TYPES)
        
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            if (newGrid[i][j]?.type === targetType) area.push({ r: i, c: j })
          }
        }
      }

      area.forEach(pt => {
        const ptKey = `${pt.r},${pt.c}`
        if (!processedTiles.has(ptKey)) {
          if (newGrid[pt.r][pt.c]?.special) {
            tilesToProcess.push(pt)
          } else {
            finalCoordsToClear.push(pt)
            processedTiles.add(ptKey)
          }
        }
      })
    }

    finalCoordsToClear.forEach(({ r: fr, c: fc }) => {
      newGrid[fr][fc] = null
    })

    return { grid: newGrid, clearedCount: finalCoordsToClear.length }
  }

  const runMatches = async (currentGrid, swapPos1 = null, swapPos2 = null, cascadeCount = 1) => {
    const groups = findMatchGroups(currentGrid)
    if (groups.length === 0) {
      setIsProcessing(false)
      return
    }

    setIsProcessing(true)

    let newGrid = currentGrid.map(row => [...row])
    let clearedCount = 0
    let pointsFromSpecials = 0

    // Check for special tiles in the cleared areas BEFORE clearing them
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const isMatched = groups.some(g => g.coords.some(pt => pt.r === r && pt.c === c))
        if (isMatched && newGrid[r][c]?.special) {
          const result = await activateSpecial(newGrid, r, c, newGrid[r][c].type)
          newGrid = result.grid
          clearedCount += result.clearedCount
          pointsFromSpecials += result.clearedCount * 15 // Bonus for special tile clears
        }
      }
    }

    let pointsFromMatches = 0
    groups.forEach(group => {
      const basePoints = group.coords.length * 10
      // Match length multiplier: 3=1x, 4=2x, 5=4x
      const lengthMult = group.maxLineLength === 4 ? 2 : group.maxLineLength >= 5 ? 4 : 1
      pointsFromMatches += basePoints * lengthMult
      
      let specialToSpawn = null
      if (group.maxLineLength >= 5 && !group.hasIntersection) {
        specialToSpawn = 'observer'
      } else if (group.hasIntersection) {
        specialToSpawn = 'pulse'
      } else if (group.maxLineLength === 4) {
        specialToSpawn = group.orientation === 'horizontal' ? 'linear-v' : 'linear-h'
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
          id: getNextId(),
          type: specialToSpawn === 'observer' ? OBSERVER_TYPE : group.type, 
          special: specialToSpawn 
        }
      }
    })

    setGrid(newGrid)
    
    // Final score calculation for this step
    const cascadeMult = 1 + (cascadeCount - 1) * 0.5
    const totalAdded = Math.round((pointsFromMatches + pointsFromSpecials) * cascadeMult)

    setScore(currentScore => {
      const totalScore = currentScore + totalAdded

      if (currentSequence && currentSequence.objective.type === 'score') {
        if (totalScore >= currentSequence.objective.target && !isWin) {
          setIsWin(true)
          // Award end-of-level bonus if winning
          const bonus = (currentSequence.mode === 'conviction' ? movesLeft * 100 : timer * 50)
          return totalScore + bonus
        }
      }
      return totalScore
    })

    if (isWin) {
      setIsProcessing(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 300))
    await runGravity(newGrid, cascadeCount)
  }

  const runGravity = async (currentGrid, cascadeCount = 1) => {
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

    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE; r++) {
        if (newGrid[r][c] === null) {
          newGrid[r][c] = { 
            id: getNextId(),
            type: Math.floor(Math.random() * NORMAL_TILE_TYPES), 
            special: null 
          }
        }
      }
    }

    setGrid(newGrid)
    await new Promise(resolve => setTimeout(resolve, 400)) 

    await runMatches(newGrid, null, null, cascadeCount + 1)
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

    // Check for special match combinations
    const isT1Special = t1?.special
    const isT2Special = t2?.special

    if (isT1Special && isT2Special) {
      if (mode === 'conviction') setMovesLeft(prev => prev - 1)
      
      let finalGrid = newGrid.map(row => [...row])
      finalGrid[tile1.r][tile1.c] = null
      finalGrid[tile2.r][tile2.c] = null
      
      let coordsToClear = []
      let clearedCountFromCombo = 0
      
      // CASE 1: Pulse + Pulse -> 5x5 Explosion
      if (t1.special === 'pulse' && t2.special === 'pulse') {
        const centerR = tile1.r, centerC = tile1.c
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = centerR + dr, nc = centerC + dc
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) coordsToClear.push({ r: nr, c: nc })
          }
        }
      }
      // CASE 2: Stripe + Pulse -> 3 Rows + 3 Columns Clear
      else if ((t1.special?.includes('linear') && t2.special === 'pulse') || 
               (t2.special?.includes('linear') && t1.special === 'pulse')) {
        const centerR = tile1.r, centerC = tile1.c
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let offset = -1; offset <= 1; offset++) {
            const r1 = centerR + offset, c1 = centerC + offset
            if (r1 >= 0 && r1 < GRID_SIZE) coordsToClear.push({ r: r1, c: i }) // 3 Rows
            if (c1 >= 0 && c1 < GRID_SIZE) coordsToClear.push({ r: i, c: c1 }) // 3 Cols
          }
        }
      }
      // CASE 3: Stripe + Stripe -> Row + Column (Cross)
      else if (t1.special?.includes('linear') && t2.special?.includes('linear')) {
        for (let i = 0; i < GRID_SIZE; i++) {
          coordsToClear.push({ r: tile1.r, c: i }) // Row
          coordsToClear.push({ r: i, c: tile1.c }) // Col
        }
      }
      // CASE 4: Double Observer -> Clear Entire Board
      else if (t1.special === 'observer' && t2.special === 'observer') {
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) coordsToClear.push({ r: i, c: j })
        }
      }
      // CASE 5: Observer + Special -> Transform all color tiles then activate
      else if (t1.special === 'observer' || t2.special === 'observer') {
        const observerCurrentPos = t1.special === 'observer' ? tile2 : tile1
        const otherType = t1.special === 'observer' ? t2.type : t1.type
        const otherSpecial = t1.special === 'observer' ? t2.special : t1.special
        
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (finalGrid[r][c]?.type === otherType) {
              finalGrid[r][c] = { ...finalGrid[r][c], special: otherSpecial }
            }
          }
        }
        const result = await activateSpecial(finalGrid, observerCurrentPos.r, observerCurrentPos.c, otherType)
        finalGrid = result.grid
        clearedCountFromCombo = result.clearedCount
      }
      // Default: Just activate both
      else {
        const res1 = await activateSpecial(finalGrid, tile1.r, tile1.c, t2?.type)
        const res2 = await activateSpecial(res1.grid, tile2.r, tile2.c, t1?.type)
        finalGrid = res2.grid
        clearedCountFromCombo = res1.clearedCount + res2.clearedCount
      }

      if (coordsToClear.length > 0) {
        coordsToClear.forEach(({ r, c }) => {
          finalGrid[r][c] = null
        })
      }

      setGrid(finalGrid)
      setScore(prev => prev + (coordsToClear.length || clearedCountFromCombo || 25) * 10)
      await runGravity(finalGrid)
      return
    }

    // CASE: Observer + Normal Tile (Consumes moves and activates)
    if (t1?.special === 'observer' || t2?.special === 'observer') {
      const observerCurrentPos = t1?.special === 'observer' ? tile2 : tile1
      const targetType = t1?.special === 'observer' ? t2?.type : t1?.type
      
      const { grid: finalGrid, clearedCount } = await activateSpecial(newGrid, observerCurrentPos.r, observerCurrentPos.c, targetType)
      if (mode === 'conviction') setMovesLeft(prev => prev - 1)
      setGrid(finalGrid)
      setScore(prev => prev + clearedCount * 10)
      await runGravity(finalGrid)
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
    isWin,
    isProcessing,
    swapTiles,
    generateBoard,
    currentSequence
  }
}

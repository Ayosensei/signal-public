import React, { memo } from 'react'
import { motion } from 'framer-motion'

const TILE_ASSETS = [
  'Alpha.png',
  'Clover.png',
  'Eyes.png',
  'Lightbulb.png',
  'Signal Node.png',
  'Mr Observer.png'
]

const Tile = memo(({ 
  r, 
  c, 
  tile, 
  isSelected, 
  isProcessing, 
  onPointerDown
}) => {
  if (!tile) return null
  const tileType = tile.type

  return (
    <motion.div
      layout
      key={tile.id}
      initial={{ scale: 0.9, opacity: 0, y: -20 }}
      animate={{ 
        scale: isSelected ? 1.15 : 1, 
        opacity: 1, 
        y: 0,
        zIndex: isSelected ? 10 : 1
      }}
      exit={{ scale: 0.9, opacity: 0 }}
      whileHover={{ scale: isProcessing ? 1 : (isSelected ? 1.15 : 1.05) }}
      whileTap={{ scale: isProcessing ? 1 : 0.95 }}
      transition={{ 
        type: 'spring', 
        stiffness: 800, 
        damping: 40,
        mass: 0.4,
        layout: { 
          type: 'spring', 
          stiffness: 900, 
          damping: 45, 
          mass: 0.3
        }
      }}
      style={{
        gridRow: r + 1,
        gridColumn: c + 1,
        touchAction: 'none'
      }}
      className={`tile tile-${tileType} ${tile?.special ? 'special-' + tile.special : ''} ${isSelected ? 'selected' : ''}`}
      onPointerDown={(e) => onPointerDown(e, r, c)}
      draggable={false}
      data-row={r}
      data-col={c}
    >
      <div className="tile-icon">
        {tileType !== null && (
          <img
            src={`/tiles/${TILE_ASSETS[tileType]}`}
            alt={`Tile ${tileType}`}
            className="tile-img"
            draggable={false}
          />
        )}
      </div>
    </motion.div>
  )
})

export default Tile

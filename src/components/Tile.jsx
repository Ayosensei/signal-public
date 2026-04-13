import React, { memo } from 'react'
import { motion } from 'framer-motion'

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

  // Use wildcard/gem specific classing
  const isWildcard = tileType === 5 || tile?.special === 'observer'

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
        stiffness: 400, 
        damping: 30,
        mass: 0.8,
        layout: { 
          type: 'spring', 
          stiffness: 500, 
          damping: 35, 
          mass: 0.6
        }
      }}
      style={{
        gridRow: r + 1,
        gridColumn: c + 1,
        touchAction: 'none'
      }}
      className={`tile tile-${tileType} ${tile?.special ? 'special-' + tile.special : ''} ${isWildcard ? 'special-wildcard' : ''} ${isSelected ? 'selected' : ''}`}
      onPointerDown={(e) => onPointerDown(e, r, c)}
      draggable={false}
      data-row={r}
      data-col={c}
    >
      <div className="tile-icon">
        {tileType !== null && (
          <div className={`css-shape shape-${tileType}`}></div>
        )}
      </div>
    </motion.div>
  )
})

export default Tile

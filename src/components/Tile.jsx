import React from 'react'

const TILE_ASSETS = [
  'Alpha.png',
  'Clover.png',
  'Eyes.png',
  'Lightbulb.png',
  'Signal Node.png',
  'Mr Observer.png'
]

const Tile = ({ 
  r, 
  c, 
  tile, 
  isSelected, 
  isProcessing, 
  onClick, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onTouchStart, 
  onTouchEnd 
}) => {
  const tileType = tile ? tile.type : null

  return (
    <div
      className={`tile tile-${tileType} ${isSelected ? 'selected' : ''} ${tile === null ? 'cleared' : ''}`}
      onClick={() => onClick(r, c)}
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
        {tileType !== null && (
          <img
            src={`/tiles/${TILE_ASSETS[tileType]}`}
            alt={`Tile ${tileType}`}
            className="tile-img"
          />
        )}
      </div>
    </div>
  )
}

export default Tile

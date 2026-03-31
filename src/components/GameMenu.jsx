import React from 'react'
import { motion } from 'framer-motion'

const GameMenu = ({ onAction, onClose }) => {
  const menuItems = [
    { id: 'resume', label: 'RESUME GAME', icon: '▶' },
    { id: 'hub', label: 'CAMPAIGN MENU', icon: '≡' },
    { id: 'settings', label: 'SETTINGS', icon: '⚙' },
    { id: 'home', label: 'MAIN MENU', icon: '⌂' }
  ]

  return (
    <motion.div 
      className="game-menu-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="game-menu-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="menu-header">
          <div className="logo-text">PAUSED</div>
          <div className="close-menu" onClick={onClose}>✕</div>
        </div>

        <div className="menu-items">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              className="menu-item-btn"
              onClick={() => onAction(item.id)}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="menu-footer">
          <div className="status-indicator">
            <span className="dot"></span>
            GAME PAUSED
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default GameMenu

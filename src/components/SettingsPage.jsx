import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SettingsPage = ({ audioSettings, setAudioSettings, onClose, onResetProgress }) => {
  const updateSetting = (key, value) => {
    setAudioSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <motion.div 
      className="settings-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="settings-card"
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <div className="logo-text">SYSTEM_SETTINGS</div>
          <div className="close-card" onClick={onClose}>✕</div>
        </div>

        <div className="card-content">
          <section className="settings-section">
            <h2 className="section-header">VISUAL_ENGINE</h2>
            <div className="setting-item toggle">
              <span className="label">SCREEN_SHAKE</span>
              <button 
                className={`toggle-btn ${audioSettings.shake ? 'active' : ''}`}
                onClick={() => updateSetting('shake', !audioSettings.shake)}
              >
                {audioSettings.shake ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
            <div className="setting-item">
              <span className="label">UI_SCALE</span>
              <span className="value">OPTIMIZED</span>
            </div>
          </section>

          <section className="settings-section links">
            <h2 className="section-header">EXTERNAL_UPLINKS</h2>
            <div className="links-grid">
              <a href="#" className="link-item">X_FEED</a>
              <a href="#" className="link-item">TELEGRAM</a>
              <a href="#" className="link-item">DEX_SCREENER</a>
              <a href="#" className="link-item">MANIFESTO</a>
            </div>
          </section>

          <section className="settings-section danger-zone">
            <h2 className="section-header">DATA_PURGE</h2>
            <button className="reset-progress-btn" onClick={onResetProgress}>
              RESET_DECRYPTION_PROGRESS
            </button>
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SettingsPage

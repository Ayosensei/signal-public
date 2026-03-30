import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

const SettingsPage = ({ audioSettings, setAudioSettings, onClose, onResetProgress }) => {
  const { user, profile } = useAuth()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [authMsg, setAuthMsg] = useState('')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onClose()
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) return
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setAuthMsg(error.message)
    } else {
      setAuthMsg('KEY_UPDATED_SUCCESSFULLY')
      setNewPassword('')
      setTimeout(() => {
        setIsChangingPassword(false)
        setAuthMsg('')
      }, 2000)
    }
  }
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
          {user && profile && (
            <section className="settings-section">
              <h2 className="section-header">UPLINK_CONNECTION</h2>
              <div className="setting-item">
                <span className="label">AGENT_HANDLE</span>
                <span className="value glow-text">[{profile.username}]</span>
              </div>
              
              {!isChangingPassword ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem'}}>
                  <button className="reset-progress-btn" style={{margin: 0, borderColor: 'rgba(0,255,136,0.3)', color: '#00ff88', background: 'rgba(0,255,136,0.05)'}} onClick={() => setIsChangingPassword(true)}>
                    CHANGE_ACCESS_KEY
                  </button>
                  <button className="reset-progress-btn" style={{margin: 0}} onClick={handleLogout}>
                    SEVER_CONNECTION (LOGOUT)
                  </button>
                </div>
              ) : (
                <form className="auth-form" onSubmit={handlePasswordUpdate} style={{padding: '0.5rem 0', marginTop: '0.5rem'}}>
                  {authMsg && <div className={authMsg === 'KEY_UPDATED_SUCCESSFULLY' ? 'auth-success' : 'auth-error'}>{authMsg}</div>}
                  <div className="setting-item auth-input">
                    <span className="label">NEW_ACCESS_KEY</span>
                    <input 
                      type="password" 
                      required 
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="ENTER_NEW_PASSWORD"
                    />
                  </div>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <button type="submit" className="campaign-btn" style={{flex: 1, padding: '0.8rem'}}>UPDATE</button>
                    <button type="button" className="campaign-btn" style={{flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid #ff4444', color: '#ff4444'}} onClick={() => { setIsChangingPassword(false); setAuthMsg(''); setNewPassword(''); }}>CANCEL</button>
                  </div>
                </form>
              )}
            </section>
          )}

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

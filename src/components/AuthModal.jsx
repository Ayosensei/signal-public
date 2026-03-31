import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

const AuthModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [wallet, setWallet] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const evaluatePassword = (pass) => {
    let score = 0
    if (pass.length > 5) score += 1
    if (pass.length > 8) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1
    return Math.min(score, 4) // Max score of 4
  }

  const handlePasswordChange = (e) => {
    const val = e.target.value
    setPassword(val)
    if (!isLogin) {
      setPasswordStrength(evaluatePassword(val))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        onClose() // Close on success
      } else {
        // --- REGISTRATION FLOW ---
        if (passwordStrength < 3) {
          throw new Error('PASSWORD_SECURITY_LEVEL_TOO_LOW')
        }

        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .maybeSingle()
        if (existingUser) throw new Error('USERNAME_ALREADY_IN_USE')

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (authError) throw authError

        // 2. Insert into custom profiles table
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              username: username,
              wallet_address: wallet
            })
          
          if (profileError) throw profileError
        }
        
        onClose() // Close on success
      }
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      className="settings-overlay auth-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="settings-card auth-card"
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <div className="logo-text">{isLogin ? 'SECURE LOGIN' : 'CREATE ACCOUNT'}</div>
          <div className="close-card" onClick={onClose}>✕</div>
        </div>

        <div className="card-content">
          <form className="auth-form" onSubmit={handleSubmit}>
            {errorMsg && <div className="auth-error">{errorMsg}</div>}

            {!isLogin && (
              <>
                <div className="setting-item auth-input">
                  <span className="label">PLAYER HANDLE</span>
                  <input 
                    type="text" 
                    required 
                    maxLength={16}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ENTER USERNAME"
                  />
                </div>
                <div className="setting-item auth-input">
                  <span className="label">WALLET_ADDRESS</span>
                  <input 
                    type="text" 
                    required 
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    placeholder="SOL/ETH_ADDRESS"
                  />
                </div>
              </>
            )}

            <div className="setting-item auth-input">
              <span className="label">EMAIL ADDRESS</span>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER EMAIL"
              />
            </div>

            <div className="setting-item auth-input">
              <span className="label">PASSWORD</span>
              <input 
                type="password" 
                required 
                minLength={6}
                value={password}
                onChange={handlePasswordChange}
                placeholder="ENTER_PASSWORD"
              />
              {!isLogin && password.length > 0 && (
                <div className="password-strength">
                  <span className="strength-label">SECURITY_LEVEL:</span>
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map(level => (
                      <div 
                        key={level} 
                        className={`strength-bar ${passwordStrength >= level ? 'active' : ''} level-${passwordStrength}`}
                      />
                    ))}
                  </div>
                  <span className={`strength-text level-${passwordStrength}`}>
                    {passwordStrength < 2 ? 'WEAK' : passwordStrength === 2 ? 'MODERATE' : passwordStrength === 3 ? 'STRONG' : 'MAXIMUM'}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" className="campaign-btn auth-submit" disabled={loading || (!isLogin && passwordStrength < 3)}>
              {loading ? 'PROCESSING...' : isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="auth-toggle">
            <span className="toggle-text">
              {isLogin ? 'NEED AN ACCOUNT?' : 'ALREADY REGISTERED?'}
            </span>
            <button 
              type="button" 
              className="toggle-link" 
              onClick={() => {
                setIsLogin(!isLogin)
                setErrorMsg('')
              }}
            >
              {isLogin ? 'CREATE_ONE' : 'LOGIN_HERE'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AuthModal

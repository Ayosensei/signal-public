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
          <div className="logo-text">{isLogin ? 'SECURE_LOGIN' : 'AGENT_REGISTRATION'}</div>
          <div className="close-card" onClick={onClose}>✕</div>
        </div>

        <div className="card-content">
          <form className="auth-form" onSubmit={handleSubmit}>
            {errorMsg && <div className="auth-error">{errorMsg}</div>}

            {!isLogin && (
              <>
                <div className="setting-item auth-input">
                  <span className="label">HACKER_HANDLE</span>
                  <input 
                    type="text" 
                    required 
                    maxLength={16}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ENTER_HANDLE"
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
              <span className="label">CONTACT_UPLINK (EMAIL)</span>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER_EMAIL"
              />
            </div>

            <div className="setting-item auth-input">
              <span className="label">ACCESS_KEY (PASSWORD)</span>
              <input 
                type="password" 
                required 
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER_PASSWORD"
              />
            </div>

            <button type="submit" className="campaign-btn auth-submit" disabled={loading}>
              {loading ? 'PROCESSING...' : isLogin ? 'INITIATE_LOGIN' : 'REGISTER_PROFILE'}
            </button>
          </form>

          <div className="auth-toggle">
            <span className="toggle-text">
              {isLogin ? 'NO_PROFILE_FOUND?' : 'ALREADY_HAVE_ACCESS?'}
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

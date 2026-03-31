import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const getStartOfWeek = () => {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  const day = d.getUTCDay()
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1)
  d.setUTCDate(diff)
  return d.toISOString()
}

const LeaderboardPage = ({ setView }) => {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select(`
            player_id,
            score,
            profiles (
              username,
              wallet_address
            )
          `)
          .eq('game_mode', 'signal')
          .gte('created_at', getStartOfWeek())
          .order('score', { ascending: false })
          .limit(200)

        if (error) throw error
        
        const uniquePlayers = new Set()
        const topScores = []
        for (const entry of data) {
          if (!uniquePlayers.has(entry.player_id)) {
            uniquePlayers.add(entry.player_id)
            topScores.push(entry)
            if (topScores.length === 50) break
          }
        }
        
        setScores(topScores)
      } catch (err) {
        console.error("Failed to load leaderboard:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const maskWallet = (wallet) => {
    if (!wallet) return 'UNKNOWN_WALLET'
    if (wallet.length < 8) return wallet
    return `${wallet.substring(0, 4)}...${wallet.substring(wallet.length - 4)}`
  }

  return (
    <div className="sequence-hub leaderboard-page">
      <header className="hub-header">
        <div className="hub-header-left">
          <button className="hub-back-minimal" onClick={() => setView('splash')}>←</button>
          <h2 className="hub-title">GLOBAL LEADERBOARD (SIGNAL)</h2>
        </div>
      </header>

      <div className="leaderboard-container">
        {loading ? (
          <div className="leaderboard-loading">LOADING SCORES...</div>
        ) : scores.length === 0 ? (
          <div className="leaderboard-empty">NO SCORES FOUND. BE THE FIRST.</div>
        ) : (
          <div className="table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>PLAYER HANDLE</th>
                  <th>WALLET</th>
                  <th>FINAL_SCORE</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((entry, idx) => (
                  <tr key={idx} className={idx === 0 ? 'rank-one' : idx < 3 ? 'rank-top' : ''}>
                    <td className="rank-cell">{idx === 0 ? '👑' : idx + 1}</td>
                    <td className="agent-handle">{entry.profiles?.username || 'UNKNOWN PLAYER'}</td>
                    <td className="agent-wallet">{maskWallet(entry.profiles?.wallet_address)}</td>
                    <td className="agent-score">{entry.score.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="hub-footer">
        <button className="hub-back-btn" onClick={() => setView('splash')}>
          RETURN TO MENU
        </button>
      </div>
    </div>
  )
}

export default LeaderboardPage

import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const LeaderboardPage = ({ setView }) => {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select(`
            score,
            profiles (
              username,
              wallet_address
            )
          `)
          .eq('game_mode', 'signal')
          .order('score', { ascending: false })
          .limit(50)

        if (error) throw error
        setScores(data)
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
          <h2 className="hub-title">GLOBAL RANKINGS (SIGNAL_MODE)</h2>
        </div>
      </header>

      <div className="leaderboard-container">
        {loading ? (
          <div className="leaderboard-loading">FETCHING_UPLINK_DATA...</div>
        ) : scores.length === 0 ? (
          <div className="leaderboard-empty">NO_DATA_FOUND. BE_THE_FIRST.</div>
        ) : (
          <div className="table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>AGENT_HANDLE</th>
                  <th>WALLET</th>
                  <th>FINAL_SCORE</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((entry, idx) => (
                  <tr key={idx} className={idx === 0 ? 'rank-one' : idx < 3 ? 'rank-top' : ''}>
                    <td className="rank-cell">{idx === 0 ? '👑' : idx + 1}</td>
                    <td className="agent-handle">{entry.profiles?.username || 'UNKNOWN_AGENT'}</td>
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
          RETURN_TO_MAIN
        </button>
      </div>
    </div>
  )
}

export default LeaderboardPage

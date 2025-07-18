import React, { useEffect, useState } from 'react';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import '../../App.css';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    teams: 0,
    events: 0,
    topScores: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamRes, eventRes, scoreRes] = await Promise.all([
          API.get('/teams'),
          API.get('/events'),
          API.get('/scoring/leaderboard')
        ]);

        setStats({
          teams: teamRes.data.length,
          events: eventRes.data.length,
          topScores: scoreRes.data.slice(0, 3) // top 3 teams
        });
      } catch (err) {
        console.error('❌ Failed to fetch dashboard data:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h2>🌟 Genesis Admin Overview</h2>
        <div className="dashboard-cards">
          <div className="card">
            <h3>🧑‍🤝‍🧑 Teams Registered</h3>
            <p>{stats.teams}</p>
          </div>
          <div className="card">
            <h3>📅 Events Created</h3>
            <p>{stats.events}</p>
          </div>
        </div>

        <div className="leaderboard-section">
          <h3>🏆 Top 3 Teams</h3>
          <ol>
            {stats.topScores.map((team, i) => (
              <li key={i}>
                <strong>{team.teamName}</strong> ({team.college}) — {team.total} pts
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
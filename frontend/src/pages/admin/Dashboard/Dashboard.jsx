import React, { useEffect, useState } from 'react';
import axios from 'axios';
import getApiBase from '../../../utils/getApiBase';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {
  const [stats, setStats] = useState({
    teams: 0,
    events: 0,
    topScores: []
  });

  const baseURL = getApiBase();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamRes, eventRes, scoreRes] = await Promise.all([
          axios.get(`${baseURL}/api/admin/teams`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`
            },
            withCredentials: true
          }),
          axios.get(`${baseURL}/api/admin/events`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`
            },
            withCredentials: true
          }),
          axios.get(`${baseURL}/api/admin/scoring/leaderboard`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`
            },
            withCredentials: true
          })
        ]);

        setStats({
          teams: teamRes.data.length,
          events: eventRes.data.length,
          topScores: scoreRes.data.slice(0, 3)
        });
      } catch {
        toast.error('❌ Failed to load dashboard data');
      }
    };

    fetchStats();
  }, [baseURL]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container-fluid bg-dark text-light min-vh-100 py-5 px-4">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-info">🌟 Genesis Admin Overview</h2>
          <p className="text-muted">Quick stats and top performers</p>
        </div>

        <div className="row g-4 justify-content-center mb-5">
          <div className="col-md-4">
            <div className="card bg-secondary text-light border-0 shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title text-uppercase fw-semibold">🧑‍🤝‍🧑 Teams Registered</h5>
                <p className="display-6 fw-bold text-info">{stats.teams}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-secondary text-light border-0 shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title text-uppercase fw-semibold">📅 Events Created</h5>
                <p className="display-6 fw-bold text-warning">{stats.events}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto" style={{ maxWidth: '720px' }}>
          <h4 className="text-info border-bottom pb-2 mb-3">🏆 Top 3 Teams</h4>
          <div className="list-group">
            {stats.topScores.map((team, i) => (
              <div
                key={i}
                className="list-group-item bg-dark border border-secondary rounded mb-3 shadow-sm"
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="text-info">{team.teamName}</strong>
                    <span className="text-white ms-2">({team.college})</span>
                  </div>
                  <span className="badge bg-info text-dark fs-6">{team.total} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
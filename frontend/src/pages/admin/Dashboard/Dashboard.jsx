import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    teams: 0,
    events: 0,
    vegCount: 0,
    nonVegCount: 0,
    leaderboard: []
  });
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  // Function to fetch fresh data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [teamsRes, eventsRes, cateringRes, leaderboardRes] = await Promise.all([
        adminApi.get('/teams'),
        adminApi.get('/events'),
        adminApi.get('/teams/catering-report'),
        adminApi.get('/teams/leaderboard/overall')
      ]);

      // Filter out teams with 0 points to prevent ghost data display
      const freshLeaderboard = Array.isArray(leaderboardRes.data) 
        ? leaderboardRes.data
            .filter(team => (team.score || team.points || 0) > 0)
            .slice(0, 5) 
        : [];

      setStats({
        teams: teamsRes.data?.length || 0,
        events: eventsRes.data?.length || 0,
        vegCount: cateringRes.data?.summary?.veg || 0,
        nonVegCount: cateringRes.data?.summary?.nonVeg || 0,
        leaderboard: freshLeaderboard
      });
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      toast.error('❌ Data uplink failed. Check backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  // 🚀 NEW: EMERGENCY RESET FUNCTION
  const handleEmergencyReset = async () => {
    const confirmation = window.confirm(
      "⚠️ CRITICAL ACTION: This will permanently wipe ALL team scores and reset the leaderboard to zero. This cannot be undone. Proceed?"
    );
    
    if (!confirmation) return;

    try {
      setResetting(true);
      // Assuming you create this route in your backend (code provided below)
      await adminApi.post('/teams/reset-all-scores'); 
      toast.success("🔥 All scores purged and reset to zero!");
      fetchDashboardData(); // Refresh UI
    } catch (err) {
      toast.error("❌ Reset failed: " + (err.response?.data?.message || "Internal Error"));
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row position-relative" style={{ zIndex: 1 }}>
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5" style={{ pointerEvents: 'auto' }}>

        <header className="mb-4 mb-lg-5 mt-2 mt-lg-0 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="text-center text-md-start">
            <h2 className="fw-bold text-white mb-1 text-uppercase tracking-tighter">Genesis Overview</h2>
            <p className="text-light opacity-75 small uppercase tracking-widest">Real-time statistics and master standings</p>
          </div>
          
          {/* 🚀 Emergency Reset Button */}
          <button 
            className="btn btn-sm btn-outline-danger fw-bold px-3 py-2 border-opacity-25" 
            onClick={handleEmergencyReset}
            disabled={resetting}
          >
            {resetting ? 'PURGING...' : <><i className="bi bi-trash3-fill me-2"></i>RESET ALL SCORES</>}
          </button>
        </header>

        {/* Stats Cards Row */}
        <div className="row g-3 g-lg-4 mb-4 mb-lg-5">
          <StatCard title="Total Teams" value={stats.teams} icon="bi-people" color="info" loading={loading} />
          <StatCard title="Active Events" value={stats.events} icon="bi-trophy" color="warning" loading={loading} />
          <StatCard title="Veg Count" value={stats.vegCount} icon="bi-leaf" color="success" loading={loading} />
          <StatCard title="Non-Veg Count" value={stats.nonVegCount} icon="bi-egg-fried" color="danger" loading={loading} />
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card bg-glass border-secondary h-100 shadow-lg border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4 gap-3">
                    <h5 className="fw-bold d-flex align-items-center gap-2 text-white mb-0">
                      <i className="bi bi-award text-warning"></i> MASTER Standings (Live)
                    </h5>
                    <button className="btn btn-sm btn-outline-info w-100 w-sm-auto" onClick={fetchDashboardData}>
                        <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i> Sync Fresh Data
                    </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle border-secondary mb-0">
                    <thead>
                      <tr className="text-white x-small text-uppercase opacity-50 ls-1">
                        <th className="border-secondary py-3">Rank</th>
                        <th className="border-secondary py-3">Identity / College</th>
                        <th className="border-secondary py-3 text-end">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && stats.leaderboard.length > 0 ? (
                        stats.leaderboard.map((team, index) => (
                          <tr key={index} className="border-secondary">
                            <td className="fw-bold text-info py-3">#{index + 1}</td>
                            <td className="py-3">
                              <div className="fw-black text-white text-uppercase ls-1 small mb-0">
                                {team.teamName || team.college}
                              </div>
                              <div className="x-small text-light opacity-40 italic">
                                {team.teamName ? team.college : team.leader}
                              </div>
                            </td>
                            <td className="text-end fw-bold text-warning py-3">
                              {team.score || team.points || 0}
                            </td>
                          </tr>
                        ))
                      ) : !loading ? (
                        <tr>
                          <td colSpan="3" className="text-center py-5 text-light opacity-50 fst-italic small">
                            No active scores found in registry.
                          </td>
                        </tr>
                      ) : (
                        <tr>
                            <td colSpan="3" className="text-center py-5">
                                <div className="spinner-border spinner-border-sm text-info"></div>
                            </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card bg-glass border-secondary shadow-lg mb-4 border-opacity-10">
              <div className="card-body p-4 text-center">
                <div className="p-3 rounded-circle bg-dark d-inline-block mb-3 border border-info shadow-glow">
                  <i className="bi bi-lightning-charge-fill text-info fs-3"></i>
                </div>
                <h5 className="text-white fw-bold">Audit Mode</h5>
                <p className="small text-light opacity-75 mb-4">
                  Scores shown are fetched directly from the master collection for accuracy.
                </p>
                <div className="d-grid gap-2">
                    <button className="btn btn-info fw-bold py-2 shadow-sm" onClick={() => window.print()}>
                        <i className="bi bi-printer me-2"></i> Print Report
                    </button>
                    <button className="btn btn-outline-secondary btn-sm text-white border-secondary opacity-50 py-2" disabled>
                        Standings Finalized
                    </button>
                </div>
              </div>
            </div>

            <div className="card bg-glass border-secondary shadow-lg border-opacity-10">
                <div className="card-body p-3">
                    <label className="text-info x-small fw-bold text-uppercase ls-1 mb-2 d-block tracking-widest">Database Sync</label>
                    <div className="progress bg-dark border border-secondary" style={{height: '8px'}}>
                        <div className={`progress-bar bg-info shadow-glow ${loading ? 'progress-bar-animated progress-bar-striped' : ''}`} style={{width: '100%'}}></div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (min-width: 992px) { .dashboard-content { margin-left: 280px; } }
        @media (max-width: 991.98px) { .dashboard-content { margin-left: 0; padding-top: 10px; } }
        .bg-glass { background: rgba(15, 15, 15, 0.9) !important; backdrop-filter: blur(10px) !important; border-radius: 20px; isolation: isolate; }
        .stat-card { transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .stat-card:hover { transform: translateY(-8px); }
        .shadow-glow { box-shadow: 0 0 15px rgba(13, 202, 240, 0.2); }
        .ls-1 { letter-spacing: 0.5px; }
        .x-small { font-size: 0.7rem; }
        .fw-black { font-weight: 900; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .pulse { animation: pulse-animation 1.5s infinite ease-in-out; }
        @keyframes pulse-animation { 
          0% { opacity: 1; transform: scale(1); } 
          50% { opacity: 0.6; transform: scale(0.98); } 
          100% { opacity: 1; transform: scale(1); } 
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, loading }) => (
  <div className="col-6 col-xl-3 stat-card">
    <div className="card bg-glass border-secondary h-100 shadow-lg border-opacity-10">
      <div className="card-body p-3 p-lg-4 d-flex flex-column flex-md-row align-items-center text-center text-md-start">
        <div className={`rounded-4 bg-${color} bg-opacity-10 p-2 p-md-3 mb-2 mb-md-0 me-md-3 text-${color} border border-${color} border-opacity-25 shadow-glow`}>
          <i className={`bi ${icon} fs-3 fs-lg-2`}></i>
        </div>
        <div className="overflow-hidden">
          <h6 className="text-white opacity-50 x-small fw-bold text-uppercase mb-1 tracking-wider text-truncate">
            {title}
          </h6>
          <h2 className={`fw-bold mb-0 text-white ${loading ? 'pulse' : ''} fs-3 fs-lg-2`}>
            {loading ? '---' : value}
          </h2>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;
import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    teams: 0,
    events: 0,
    vegCount: 0,
    nonVegCount: 0,
    leaderboard: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        /**
         * 🛠️ SYNC CHECK:
         * Using optional chaining ?. and default fallbacks || 
         * to prevent crashes if one API is slower than the other.
         */
        const [teamsRes, eventsRes, cateringRes, leaderboardRes] = await Promise.all([
          adminApi.get('/teams'),
          adminApi.get('/events'),
          adminApi.get('/teams/catering-report'),
          adminApi.get('/teams/leaderboard/overall') // Ensure this matches your team.js route
        ]);

        setStats({
          teams: teamsRes.data?.length || 0,
          events: eventsRes.data?.length || 0,
          // Extracting from the nested summary object provided by your catering route
          vegCount: cateringRes.data?.summary?.veg || 0,
          nonVegCount: cateringRes.data?.summary?.nonVeg || 0,
          leaderboard: Array.isArray(leaderboardRes.data) ? leaderboardRes.data.slice(0, 5) : []
        });
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
        toast.error('❌ Data sync failed. Check backend connectivity.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="d-flex bg-dark min-vh-100">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-4 p-lg-5">
        <ToastContainer theme="dark" />

        <header className="mb-5">
          <h2 className="fw-bold text-white mb-1">Genesis Overview</h2>
          <p className="text-light opacity-75">Real-time statistics and master standings</p>
        </header>

        {/* Stats Cards Row */}
        <div className="row g-4 mb-5">
          <StatCard title="Total Teams" value={stats.teams} icon="bi-people" color="info" loading={loading} />
          <StatCard title="Active Events" value={stats.events} icon="bi-trophy" color="warning" loading={loading} />
          <StatCard title="Veg Count" value={stats.vegCount} icon="bi-leaf" color="success" loading={loading} />
          <StatCard title="Non-Veg Count" value={stats.nonVegCount} icon="bi-egg-fried" color="danger" loading={loading} />
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card bg-glass border-secondary h-100 shadow-lg">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold d-flex align-items-center gap-2 text-white mb-0">
                      <i className="bi bi-award text-warning"></i> Master स्टैंडिंग्स (Top 5)
                    </h5>
                    <button className="btn btn-sm btn-outline-info" onClick={() => window.location.reload()}>
                        <i className="bi bi-arrow-clockwise"></i> Refresh
                    </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle border-secondary mb-0">
                    <thead>
                      <tr className="text-white small text-uppercase opacity-75">
                        <th className="border-secondary py-3">Rank</th>
                        <th className="border-secondary py-3">College</th>
                        <th className="border-secondary py-3 text-end">Total Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && stats.leaderboard.length > 0 ? (
                        stats.leaderboard.map((team, index) => (
                          <tr key={index} className="border-secondary">
                            <td className="fw-bold text-info py-3">#{index + 1}</td>
                            <td className="py-3">
                              <div className="fw-bold text-white text-uppercase ls-1">{team.college}</div>
                              <div className="small text-light opacity-50">{team.leader}</div>
                            </td>
                            <td className="text-end fw-bold text-warning fs-5 py-3">
                              {team.score}
                            </td>
                          </tr>
                        ))
                      ) : !loading ? (
                        <tr>
                          <td colSpan="3" className="text-center py-5 text-light opacity-50 fst-italic">
                            Waiting for scoring data...
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
            <div className="card bg-glass border-secondary shadow-lg mb-4">
              <div className="card-body p-4 text-center">
                <div className="p-3 rounded-circle bg-dark d-inline-block mb-3 border border-info shadow-glow">
                  <i className="bi bi-lightning-charge-fill text-info fs-3"></i>
                </div>
                <h5 className="text-white fw-bold">Normalization Engine</h5>
                <p className="small text-light opacity-75 mb-4">
                  Leaderboard calculates trophy points using the Genesis weighted algorithm.
                </p>
                <div className="d-grid gap-2">
                    <button className="btn btn-info fw-bold py-2 shadow-sm" onClick={() => window.print()}>
                        <i className="bi bi-printer me-2"></i> Print Dashboard
                    </button>
                    <button className="btn btn-outline-secondary btn-sm text-white border-secondary opacity-50 py-2" disabled>
                        Finalize All Scores
                    </button>
                </div>
              </div>
            </div>

            <div className="card bg-glass border-secondary shadow-lg">
                <div className="card-body p-3">
                    <label className="text-info x-small fw-bold text-uppercase ls-1 mb-2 d-block">Fest Health</label>
                    <div className="progress bg-dark border border-secondary" style={{height: '8px'}}>
                        <div className="progress-bar bg-info" style={{width: stats.teams > 0 ? '100%' : '0%'}}></div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-content { margin-left: 260px; transition: margin 0.3s ease; }
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(12px); border-radius: 18px; }
        .stat-card { transition: transform 0.3s ease; }
        .stat-card:hover { transform: translateY(-5px); }
        .shadow-glow { box-shadow: 0 0 15px rgba(13, 202, 240, 0.2); }
        .ls-1 { letter-spacing: 0.5px; }
        .x-small { font-size: 0.65rem; }
        @media (max-width: 991.98px) { .dashboard-content { margin-left: 0; padding-top: 80px; } }
        .pulse { animation: pulse-animation 1.5s infinite ease-in-out; }
        @keyframes pulse-animation { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, loading }) => (
  <div className="col-sm-6 col-xl-3 stat-card">
    <div className="card bg-glass border-secondary h-100 shadow-lg">
      <div className="card-body p-4 d-flex align-items-center">
        <div className={`rounded-4 bg-${color} bg-opacity-10 p-3 me-3 text-${color} border border-${color} border-opacity-25`}>
          <i className={`bi ${icon} fs-2`}></i>
        </div>
        <div>
          <h6 className="text-white opacity-50 x-small fw-bold text-uppercase mb-1" style={{ letterSpacing: '1px' }}>
            {title}
          </h6>
          <h2 className={`fw-bold mb-0 text-white ${loading ? 'pulse' : ''}`}>
            {loading ? '---' : value}
          </h2>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;
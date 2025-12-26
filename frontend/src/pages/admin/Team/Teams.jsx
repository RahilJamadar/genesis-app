import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/teams');
      setTeams(res.data);
    } catch (err) {
      toast.error('❌ Failed to synchronize team data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('🚨 Warning: Deleting this team will remove all associated participant records and scoring data. Proceed?')) return;
    try {
      await adminApi.delete(`/teams/${id}`);
      setTeams(prev => prev.filter(t => t._id !== id));
      toast.success('🗑️ Team purged successfully');
    } catch (err) {
      toast.error('❌ Failed to delete team');
    }
  };

  // Helper to render payment status badges
  const renderPaymentBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="badge bg-success border border-success bg-opacity-10 text-success"><i className="bi bi-shield-check me-1"></i>VERIFIED</span>;
      case 'paid':
        return <span className="badge bg-info border border-info bg-opacity-10 text-info"><i className="bi bi-cash-stack me-1"></i>PAID</span>;
      default:
        return <span className="badge bg-warning border border-warning bg-opacity-10 text-warning"><i className="bi bi-clock-history me-1"></i>PENDING</span>;
    }
  };

  return (
    <div className="d-flex bg-dark min-vh-100">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-4 p-lg-5">
        <ToastContainer theme="dark" position="top-right" autoClose={2000} />

        <header className="mb-5 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold text-white mb-1">Team Management</h2>
            <p className="text-light opacity-75">Audit participating colleges, payments, and catering choices</p>
          </div>
          <div className="bg-glass px-4 py-2 rounded border border-secondary text-center">
            <div className="text-info fw-bold fs-4 leading-none">{teams.length}</div>
            <div className="text-white x-small text-uppercase ls-1">Colleges</div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status"></div>
          </div>
        ) : (
          <div className="row g-4">
            {teams.map(team => (
              <div key={team._id} className="col-xl-6">
                <div className="card bg-glass border-secondary h-100 team-card shadow-lg">
                  <div className="card-body p-4">
                    {/* Header Section */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h4 className="text-info fw-bold mb-1">{team.college}</h4>
                        <div className="d-flex flex-wrap align-items-center gap-2 text-white opacity-75 small">
                          <i className="bi bi-person-badge text-warning"></i>
                          <span>Leader: <strong>{team.leader}</strong></span>
                          <span className="opacity-25">|</span>
                          <i className="bi bi-telephone text-warning"></i>
                          <span>{team.contact}</span>
                        </div>
                      </div>
                      <div className="text-end">
                        {renderPaymentBadge(team.paymentStatus)}
                        <div className="mt-2 text-white opacity-50 x-small fw-bold">
                          {team.isOutstation ? '🏠 OUTSTATION' : '📍 LOCAL'}
                        </div>
                      </div>
                    </div>

                    {/* Transaction Info (If any) */}
                    {team.transactionId && (
                      <div className="mb-3 px-2 py-1 bg-dark bg-opacity-50 rounded border border-secondary border-opacity-25">
                         <span className="text-secondary x-small fw-bold text-uppercase me-2">TXN ID:</span>
                         <span className="text-info x-small font-monospace">{team.transactionId}</span>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="bg-dark bg-opacity-50 rounded p-3 mb-4 border border-secondary border-opacity-50">
                      <div className="row text-center text-white">
                        <div className="col-4 border-end border-secondary border-opacity-50">
                          <div className="text-secondary x-small fw-bold text-uppercase mb-1">Members</div>
                          <div className="fw-bold fs-5">{team.members?.length || 0}</div>
                        </div>
                        <div className="col-4 border-end border-secondary border-opacity-50">
                          <div className="text-success x-small fw-bold text-uppercase mb-1">Veg</div>
                          <div className="fw-bold fs-5">{team.vegCount || 0}</div>
                        </div>
                        <div className="col-4">
                          <div className="text-danger x-small fw-bold text-uppercase mb-1">Non-Veg</div>
                          <div className="fw-bold fs-5">{team.nonVegCount || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2 pt-2">
                      <button className="btn btn-outline-info btn-sm flex-grow-1 fw-bold text-uppercase py-2" 
                        onClick={() => navigate(`/admin/teams/view/${team._id}`)}>
                        <i className="bi bi-eye me-2"></i>Profile
                      </button>
                      <button className="btn btn-outline-warning btn-sm px-3 py-2"
                        onClick={() => navigate(`/admin/teams/edit/${team._id}`)}
                        title="Edit Team">
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="btn btn-outline-danger btn-sm px-3 py-2"
                        onClick={() => handleDelete(team._id)}
                        title="Purge Record">
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {teams.length === 0 && (
              <div className="col-12 text-center py-5">
                <div className="card bg-glass border-secondary p-5">
                  <i className="bi bi-people text-secondary fs-1 mb-3"></i>
                  <h5 className="text-white opacity-50">No colleges registered yet.</h5>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .dashboard-content { margin-left: 260px; }
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(12px); border-radius: 18px; }
        .team-card { transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.1); }
        .team-card:hover { transform: translateY(-5px); border-color: #0dcaf0 !important; box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; }
        .x-small { font-size: 0.65rem; }
        .ls-1 { letter-spacing: 1px; }
        .leading-none { line-height: 1; }
        @media (max-width: 991.98px) { .dashboard-content { margin-left: 0; padding-top: 80px; } }
      `}</style>
    </div>
  );
};

export default Teams;
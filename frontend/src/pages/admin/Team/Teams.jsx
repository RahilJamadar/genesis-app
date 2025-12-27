import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
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
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">

        <header className="mb-4 mb-lg-5 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <div className="text-center text-sm-start">
            <h2 className="fw-bold text-white mb-1">Team Management</h2>
            <p className="text-light opacity-75 small mb-0">Audit participating colleges, payments, and catering choices</p>
          </div>
          <div className="bg-glass px-4 py-2 rounded border border-secondary text-center shadow-glow w-100 w-sm-auto">
            <div className="text-info fw-bold fs-3 fs-md-4 leading-none">{teams.length}</div>
            <div className="text-white x-small text-uppercase ls-1">Colleges</div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status"></div>
          </div>
        ) : (
          <div className="row g-3 g-lg-4">
            {teams.map(team => (
              <div key={team._id} className="col-12 col-xl-6">
                <div className="card bg-glass border-secondary team-card shadow-lg border-opacity-10">
                  <div className="card-body p-3 p-md-4">
                    {/* Header Section */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-3">
                      <div className="flex-grow-1">
                        <h4 className="text-info fw-bold mb-1 fs-5 fs-md-4">{team.college}</h4>
                        <div className="d-flex flex-wrap align-items-center gap-2 text-white opacity-75 x-small">
                          <span className="d-flex align-items-center gap-1">
                            <i className="bi bi-person-badge text-warning"></i>
                            <strong>{team.leader}</strong>
                          </span>
                          <span className="opacity-25 d-none d-sm-inline">|</span>
                          <span className="d-flex align-items-center gap-1">
                            <i className="bi bi-telephone text-warning"></i>
                            {team.contact}
                          </span>
                        </div>
                      </div>
                      <div className="d-flex flex-row flex-md-column align-items-center align-items-md-end gap-2 w-100 w-md-auto justify-content-between mt-2 mt-md-0">
                        {renderPaymentBadge(team.paymentStatus)}
                        <div className="text-white opacity-50 x-small fw-bold">
                          {team.isOutstation ? '🏠 OUTSTATION' : '📍 LOCAL'}
                        </div>
                      </div>
                    </div>

                    {/* Transaction Info */}
                    {team.transactionId && (
                      <div className="mb-3 px-3 py-2 bg-black bg-opacity-40 rounded border border-secondary border-opacity-25 overflow-hidden">
                         <div className="text-secondary x-small fw-bold text-uppercase mb-1">TXN ID:</div>
                         <div className="text-info x-small font-monospace text-truncate">{team.transactionId}</div>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="bg-black bg-opacity-40 rounded p-3 mb-4 border border-secondary border-opacity-50 shadow-inner">
                      <div className="row text-center text-white g-0">
                        <div className="col-4 border-end border-secondary border-opacity-30">
                          <div className="text-secondary x-small fw-bold text-uppercase mb-1">Units</div>
                          <div className="fw-bold fs-5">{team.members?.length || 0}</div>
                        </div>
                        <div className="col-4 border-end border-secondary border-opacity-30">
                          <div className="text-success x-small fw-bold text-uppercase mb-1">Veg</div>
                          <div className="fw-bold fs-5">{team.vegCount || 0}</div>
                        </div>
                        <div className="col-4">
                          <div className="text-danger x-small fw-bold text-uppercase mb-1">Non</div>
                          <div className="fw-bold fs-5">{team.nonVegCount || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex flex-wrap gap-2 pt-2">
                      <button className="btn btn-info btn-sm flex-grow-1 fw-bold text-uppercase py-2 shadow-sm text-black" 
                        onClick={() => navigate(`/admin/teams/view/${team._id}`)}>
                        <i className="bi bi-eye me-2"></i>Profile
                      </button>
                      <div className="d-flex gap-2 w-100 w-sm-auto">
                        <button className="btn btn-outline-warning btn-sm px-3 py-2 flex-grow-1"
                          onClick={() => navigate(`/admin/teams/edit/${team._id}`)}
                          title="Edit Team">
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="btn btn-outline-danger btn-sm px-3 py-2 flex-grow-1"
                          onClick={() => handleDelete(team._id)}
                          title="Purge Record">
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {teams.length === 0 && (
              <div className="col-12 text-center py-5">
                <div className="card bg-glass border-secondary p-5 border-opacity-10">
                  <i className="bi bi-people text-secondary fs-1 mb-3"></i>
                  <h5 className="text-white opacity-50">No colleges registered yet.</h5>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        /* Desktop: Standard Sidebar Offset */
        @media (min-width: 992px) {
          .dashboard-content { margin-left: 280px; }
          .team-card:hover { 
            transform: translateY(-5px); 
            border-color: #0dcaf0 !important; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; 
          }
        }

        /* Mobile Adjustments */
        @media (max-width: 991.98px) {
          .dashboard-content { 
            margin-left: 0; 
            padding-top: 20px; 
          }
          .team-card { margin-bottom: 5px; }
        }

        .bg-glass { 
          background: rgba(255, 255, 255, 0.03) !important; 
          backdrop-filter: blur(20px); 
          border-radius: 20px; 
        }

        .team-card { 
          transition: all 0.3s ease; 
          border: 1px solid rgba(255,255,255,0.08); 
        }

        .shadow-glow { box-shadow: 0 0 15px rgba(13, 202, 240, 0.15); }
        .x-small { font-size: 0.7rem; }
        .ls-1 { letter-spacing: 1px; }
        .leading-none { line-height: 1; }
      `}</style>
    </div>
  );
};

export default Teams;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const ViewTeam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setLoading(true);
        const res = await adminApi.get(`/teams/${id}`);
        setTeam(res.data);
      } catch (err) {
        toast.error('❌ Failed to load team profile');
        console.error('View fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [id]);

  // Helper to render payment status badges
  const renderPaymentBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="badge bg-success border border-success bg-opacity-10 text-success px-3 py-2"><i className="bi bi-shield-check me-1"></i>VERIFIED</span>;
      case 'paid':
        return <span className="badge bg-info border border-info bg-opacity-10 text-info px-3 py-2"><i className="bi bi-cash-stack me-1"></i>PAID (UNVERIFIED)</span>;
      default:
        return <span className="badge bg-warning border border-warning bg-opacity-10 text-warning px-3 py-2"><i className="bi bi-clock-history me-1"></i>PENDING</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-dark min-vh-100 d-flex align-items-center justify-content-center text-white">
        <div className="spinner-border text-info" role="status"></div>
      </div>
    );
  }

  if (!team) return null;

  return (
    <div className="d-flex bg-dark min-vh-100">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-4 p-lg-5">
        <ToastContainer theme="dark" position="top-right" autoClose={2000} />

        <header className="mb-5 d-flex justify-content-between align-items-start">
          <div>
            <h2 className="fw-bold text-white mb-1">{team.college}</h2>
            <p className="text-light opacity-75">Full Team Profile & Logistics Audit</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-warning fw-bold btn-sm" onClick={() => navigate(`/admin/teams/edit/${team._id}`)}>
              <i className="bi bi-pencil-square me-2"></i>EDIT PROFILE
            </button>
            <button className="btn btn-outline-secondary fw-bold btn-sm" onClick={() => navigate('/admin/teams')}>
              <i className="bi bi-arrow-left me-2"></i>BACK
            </button>
          </div>
        </header>

        <div className="row g-4">
          {/* Left Column: Administrative & Payment */}
          <div className="col-lg-5">
            <div className="card bg-glass border-secondary shadow-lg mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-2">
                    <h5 className="text-white fw-bold mb-0">Administrative Info</h5>
                    {renderPaymentBadge(team.paymentStatus)}
                </div>
                
                <div className="mb-4">
                  <label className="text-info x-small fw-bold mb-1 d-block text-uppercase ls-1">Team Leader</label>
                  <h5 className="text-white fw-bold">{team.leader}</h5>
                  <p className="text-secondary small mb-0">{team.email}</p>
                </div>

                <div className="mb-4">
                  <label className="text-info x-small fw-bold mb-1 d-block text-uppercase ls-1">Contact Number</label>
                  <h5 className="text-white fw-bold"><i className="bi bi-telephone me-2 text-warning"></i>{team.contact}</h5>
                </div>

                <div className="mb-4">
                  <label className="text-info x-small fw-bold mb-1 d-block text-uppercase ls-1">Faculty Coordinator</label>
                  <h5 className="text-white fw-bold">{team.faculty || "Not Assigned"}</h5>
                </div>

                {team.transactionId && (
                  <div className="mb-4 p-3 rounded bg-info bg-opacity-10 border border-info border-opacity-25">
                    <label className="text-info x-small fw-bold d-block mb-1 text-uppercase ls-1">Transaction ID</label>
                    <code className="text-info fs-6">{team.transactionId}</code>
                  </div>
                )}

                <div className="p-3 rounded bg-dark border border-secondary shadow-sm">
                   <div className="row text-center">
                      <div className="col-6 border-end border-secondary border-opacity-50">
                        <label className="text-info x-small fw-bold d-block mb-1 text-uppercase ls-1">Residency</label>
                        <span className="text-warning fw-bold">{team.isOutstation ? 'OUTSTATION' : 'LOCAL'}</span>
                      </div>
                      <div className="col-6">
                        <label className="text-info x-small fw-bold d-block mb-1 text-uppercase ls-1">Total Members</label>
                        <span className="text-white fw-bold fs-5">{team.members?.length || 0}</span>
                      </div>
                   </div>
                </div>

                <div className="mt-4 p-3 rounded border border-secondary bg-dark bg-opacity-25">
                    <label className="text-white x-small fw-bold d-block mb-3 text-uppercase text-center ls-1">Catering Aggregates</label>
                    <div className="d-flex justify-content-around">
                        <div className="text-center">
                            <h3 className="text-success fw-bold mb-0">{team.vegCount}</h3>
                            <span className="text-success x-small fw-bold">VEG</span>
                        </div>
                        <div className="text-center">
                            <h3 className="text-danger fw-bold mb-0">{team.nonVegCount}</h3>
                            <span className="text-danger x-small fw-bold">NON-VEG</span>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Member Registry */}
          <div className="col-lg-7">
            <div className="card bg-glass border-secondary shadow-lg h-100">
              <div className="card-body p-4">
                <h5 className="text-white fw-bold mb-4 border-bottom border-secondary pb-2">Student Registry</h5>
                
                <div className="member-list overflow-auto" style={{ maxHeight: '70vh' }}>
                  {team.members?.map((member, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded border border-secondary mb-3 bg-dark bg-opacity-25 shadow-sm"
                      style={{ borderLeft: `4px solid ${member.diet === 'veg' ? '#198754' : '#dc3545'} !important` }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 className="text-white fw-bold mb-0">{member.name}</h6>
                            <span className="text-secondary x-small">{member.contact || 'No contact provided'}</span>
                        </div>
                        <span className={`badge ${member.diet === 'veg' ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${member.diet === 'veg' ? 'text-success' : 'text-danger'} border ${member.diet === 'veg' ? 'border-success' : 'border-danger'} x-small text-uppercase`}>
                            {member.diet}
                        </span>
                      </div>
                      
                      {member.events?.length > 0 ? (
                        <div className="mt-3">
                          <label className="x-small text-info fw-bold d-block mb-2 text-uppercase ls-1">Participation</label>
                          <div className="d-flex flex-wrap gap-2">
                            {member.events.map((event, idx) => (
                              <span key={idx} className="badge bg-secondary bg-opacity-25 border border-secondary text-light fw-normal">{event}</span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-secondary small mb-0 mt-2 fst-italic">No specific events assigned to this member.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-content { margin-left: 260px; }
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(12px); border-radius: 18px; }
        .x-small { font-size: 0.68rem; }
        .ls-1 { letter-spacing: 0.8px; }
        .member-list::-webkit-scrollbar { width: 5px; }
        .member-list::-webkit-scrollbar-thumb { background: rgba(13, 202, 240, 0.2); border-radius: 10px; }
        @media (max-width: 991.98px) { .dashboard-content { margin-left: 0; padding-top: 80px; } }
      `}</style>
    </div>
  );
};

export default ViewTeam;
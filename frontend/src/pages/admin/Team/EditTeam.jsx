import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const EditTeam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeamAndEvents = async () => {
      try {
        const [teamRes, eventRes] = await Promise.all([
          adminApi.get(`/teams/${id}`),
          adminApi.get('/events')
        ]);
        setTeam(teamRes.data);
        setEvents(eventRes.data);
      } catch (err) {
        toast.error('❌ Failed to fetch team or events data');
      }
    };

    fetchTeamAndEvents();
  }, [id]);

  const handleChange = (field, value) => {
    setTeam(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...team.members];
    updated[index][field] = value;
    setTeam(prev => ({ ...prev, members: updated }));
  };

  const handleAddMember = () => {
    setTeam(prev => ({
      ...prev,
      members: [...prev.members, { name: '', diet: 'veg', events: [] }]
    }));
  };

  const handleRemoveMember = (index) => {
    const updated = [...team.members];
    updated.splice(index, 1);
    setTeam(prev => ({ ...prev, members: updated }));
  };

  const handleSave = async () => {
    if (!team.email) {
        return toast.error("Email is required for validation.");
    }

    setLoading(true);
    try {
      // Sync Logic: Map event names back to ObjectIds for the backend
      const selectedEventNames = [...new Set(team.members.flatMap(m => m.events || []))];
      const syncedEventIds = events
        .filter(ev => selectedEventNames.includes(ev.name))
        .map(ev => ev._id);

      const payload = {
        ...team,
        registeredEvents: syncedEventIds
      };

      await adminApi.put(`/teams/${id}`, payload);
      toast.success('✅ Team profile updated successfully');
      setTimeout(() => navigate('/admin/teams'), 1500);
    } catch (err) {
      toast.error('❌ Failed to save: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!team) return (
    <div className="bg-dark min-vh-100 d-flex align-items-center justify-content-center text-white">
      <div className="spinner-border text-info" role="status"></div>
    </div>
  );

  return (
    <div className="d-flex bg-dark min-vh-100">
      <Navbar />
      
      <main className="dashboard-content flex-grow-1 p-4 p-lg-5">
        <ToastContainer theme="dark" position="top-right" autoClose={2000} />

        <header className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold text-white mb-1">Edit Team: <span className="text-info">{team.college}</span></h2>
            <p className="text-light opacity-75">Update administrative details and member list</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/admin/teams')}>
            <i className="bi bi-arrow-left me-2"></i>Back to List
          </button>
        </header>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card bg-glass border-secondary shadow-lg mb-4">
              <div className="card-body p-4">
                <h5 className="text-white fw-bold mb-4 border-bottom border-secondary pb-2">Institution Info</h5>
                
                <div className="mb-3">
                  <label className="text-info x-small fw-bold mb-2 d-block">COLLEGE NAME</label>
                  <input type="text" className="form-control bg-dark text-white border-secondary shadow-none" 
                    value={team.college} onChange={e => handleChange('college', e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="text-info x-small fw-bold mb-2 d-block">TEAM LEADER</label>
                  <input type="text" className="form-control bg-dark text-white border-secondary shadow-none" 
                    value={team.leader} onChange={e => handleChange('leader', e.target.value)} />
                </div>

                {/* ✅ FIX: Added Email field to ensure it exists in the state */}
                <div className="mb-3">
                  <label className="text-info x-small fw-bold mb-2 d-block">LEADER EMAIL</label>
                  <input type="email" className="form-control bg-dark text-white border-secondary shadow-none" 
                    value={team.email} onChange={e => handleChange('email', e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="text-info x-small fw-bold mb-2 d-block">PRIMARY CONTACT</label>
                  <input type="text" className="form-control bg-dark text-white border-secondary shadow-none" 
                    value={team.contact} onChange={e => handleChange('contact', e.target.value)} />
                </div>

                <div className="mb-4">
                  <label className="text-info x-small fw-bold mb-2 d-block">FACULTY IN-CHARGE</label>
                  <input type="text" className="form-control bg-dark text-white border-secondary shadow-none" 
                    value={team.faculty} onChange={e => handleChange('faculty', e.target.value)} />
                </div>

                <h5 className="text-white fw-bold mb-3 border-bottom border-secondary pb-2">Status & Payment</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="text-info x-small fw-bold mb-2 d-block">PAYMENT STATUS</label>
                    <select className="form-select bg-dark text-white border-secondary shadow-none"
                      value={team.paymentStatus} onChange={e => handleChange('paymentStatus', e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="verified">Verified</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="text-info x-small fw-bold mb-2 d-block">RESIDENCY</label>
                    <select className="form-select bg-dark text-white border-secondary shadow-none"
                      value={team.isOutstation} onChange={e => handleChange('isOutstation', e.target.value === 'true')}>
                      <option value="false">Local</option>
                      <option value="true">Outstation</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="text-info x-small fw-bold mb-2 d-block">TRANSACTION ID</label>
                    <input type="text" className="form-control bg-dark text-white border-secondary shadow-none" 
                      value={team.transactionId || ''} onChange={e => handleChange('transactionId', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <button className="btn btn-info w-100 fw-bold py-3 shadow-sm" onClick={handleSave} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-cloud-check-fill me-2"></i>}
              UPDATE TEAM PROFILE
            </button>
          </div>

          <div className="col-lg-7">
            <div className="card bg-glass border-secondary shadow-lg">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-2">
                  <h5 className="text-white fw-bold mb-0">Member Registry ({team.members?.length})</h5>
                  <button className="btn btn-sm btn-outline-info fw-bold" onClick={handleAddMember}>
                    <i className="bi bi-plus-lg me-1"></i>ADD STUDENT
                  </button>
                </div>
                
                <div className="member-edit-list overflow-auto" style={{ maxHeight: '65vh' }}>
                  {team.members?.map((member, index) => (
                    <div key={index} className="p-3 rounded border border-secondary mb-3 bg-dark bg-opacity-25 position-relative">
                      <button className="btn btn-sm btn-link text-danger position-absolute top-0 end-0 mt-2 me-2 p-0"
                        onClick={() => handleRemoveMember(index)}>
                        <i className="bi bi-trash3 fs-5"></i>
                      </button>

                      <div className="row g-3">
                        <div className="col-md-7">
                          <label className="text-info x-small fw-bold mb-1 d-block">FULL NAME</label>
                          <input type="text" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none"
                            value={member.name} onChange={e => handleMemberChange(index, 'name', e.target.value)} />
                        </div>
                        <div className="col-md-5">
                          <label className="text-info x-small fw-bold mb-1 d-block">DIET</label>
                          <select className="form-select form-select-sm bg-dark text-white border-secondary shadow-none"
                            value={member.diet} onChange={e => handleMemberChange(index, 'diet', e.target.value)}>
                            <option value="veg">Veg</option>
                            <option value="non-veg">Non-Veg</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="text-info x-small fw-bold mb-1 d-block">EVENTS (Hold Ctrl)</label>
                          <select multiple className="form-select form-select-sm bg-dark text-white border-secondary shadow-none"
                            style={{ height: '100px' }}
                            value={member.events || []}
                            onChange={e => handleMemberChange(index, 'events', Array.from(e.target.selectedOptions, opt => opt.value))}
                          >
                            {events.map(ev => (
                              <option key={ev._id} value={ev.name}>{ev.name} ({ev.category})</option>
                            ))}
                          </select>
                        </div>
                      </div>
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
        .bg-glass { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(12px); border-radius: 18px; }
        .x-small { font-size: 0.7rem; letter-spacing: 0.5px; }
        @media (max-width: 991.98px) { .dashboard-content { margin-left: 0; padding-top: 80px; } }
      `}</style>
    </div>
  );
};

export default EditTeam;
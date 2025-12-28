import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';

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
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />
      
      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">

        <header className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <div className="text-center text-sm-start">
            <h2 className="fw-bold text-white mb-1 fs-3 fs-md-2">Edit Team: <span className="text-info">{team.teamName || team.college}</span></h2>
            <p className="text-light opacity-75 small">Update administrative details and member list</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm w-100 w-sm-auto" onClick={() => navigate('/admin/teams')}>
            <i className="bi bi-arrow-left me-2"></i>Back to List
          </button>
        </header>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card bg-glass border-secondary shadow-lg mb-4">
              <div className="card-body p-3 p-md-4">
                <h5 className="text-white fw-bold mb-4 border-bottom border-secondary pb-2">Institution Info</h5>
                
                {/* 🚀 NEW FIELD: ASSIGNED TEAM NAME */}
                <div className="mb-4 p-3 rounded bg-info bg-opacity-10 border border-info border-opacity-25">
                  <label className="text-info x-small fw-bold mb-2 d-block">ASSIGNED TEAM NAME (Fair Competition ID)</label>
                  <input 
                    type="text" 
                    className="form-control bg-dark text-white border-info shadow-none py-2" 
                    placeholder="e.g. Team Alpha / GEN-001"
                    value={team.teamName || ''} 
                    onChange={e => handleChange('teamName', e.target.value)} 
                  />
                  <small className="text-info opacity-50 x-small mt-1 d-block italic">This name will be visible to judges instead of the college name.</small>
                </div>

                <div className="mb-3">
                  <label className="text-white text-opacity-50 x-small fw-bold mb-2 d-block">COLLEGE NAME</label>
                  <input type="text" className="form-control bg-dark text-white border-secondary shadow-none py-2" 
                    value={team.college} onChange={e => handleChange('college', e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="text-white text-opacity-50 x-small fw-bold mb-2 d-block">TEAM LEADER</label>
                  <input type="text" className="form-control bg-dark text-white border-secondary shadow-none py-2" 
                    value={team.leader} onChange={e => handleChange('leader', e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="text-white text-opacity-50 x-small fw-bold mb-2 d-block">LEADER EMAIL</label>
                  <input type="email" className="form-control bg-dark text-white border-secondary shadow-none py-2" 
                    value={team.email} onChange={e => handleChange('email', e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="text-white text-opacity-50 x-small fw-bold mb-2 d-block">PRIMARY CONTACT</label>
                  <input type="text" className="form-control bg-dark text-white border-secondary shadow-none py-2" 
                    value={team.contact} onChange={e => handleChange('contact', e.target.value)} />
                </div>

                <div className="mb-4">
                  <label className="text-white text-opacity-50 x-small fw-bold mb-2 d-block">FACULTY IN-CHARGE</label>
                  <input type="text" className="form-control bg-dark text-white border-secondary shadow-none py-2" 
                    value={team.faculty} onChange={e => handleChange('faculty', e.target.value)} />
                </div>

                <h5 className="text-white fw-bold mb-3 border-bottom border-secondary pb-2">Status & Payment</h5>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="text-info x-small fw-bold mb-2 d-block">PAYMENT STATUS</label>
                    <select className="form-select bg-dark text-white border-secondary shadow-none py-2"
                      value={team.paymentStatus} onChange={e => handleChange('paymentStatus', e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="verified">Verified</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="text-info x-small fw-bold mb-2 d-block">RESIDENCY</label>
                    <select className="form-select bg-dark text-white border-secondary shadow-none py-2"
                      value={team.isOutstation} onChange={e => handleChange('isOutstation', e.target.value === 'true')}>
                      <option value="false">Local</option>
                      <option value="true">Outstation</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="text-info x-small fw-bold mb-2 d-block">TRANSACTION ID</label>
                    <input type="text" className="form-control bg-dark text-white border-secondary shadow-none py-2" 
                      value={team.transactionId || ''} onChange={e => handleChange('transactionId', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <button className="btn btn-info w-100 fw-bold py-3 shadow-sm mb-4 mb-lg-0" onClick={handleSave} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-cloud-check-fill me-2"></i>}
              UPDATE TEAM PROFILE
            </button>
          </div>

          <div className="col-lg-7">
            <div className="card bg-glass border-secondary shadow-lg">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3 gap-3">
                  <h5 className="text-white fw-bold mb-0">Member Registry ({team.members?.length})</h5>
                  <button className="btn btn-sm btn-outline-info fw-bold w-100 w-sm-auto" onClick={handleAddMember}>
                    <i className="bi bi-plus-lg me-1"></i>ADD STUDENT
                  </button>
                </div>
                
                <div className="member-edit-list overflow-auto" style={{ maxHeight: '65vh' }}>
                  {team.members?.map((member, index) => (
                    <div key={index} className="p-3 rounded border border-secondary mb-3 bg-dark bg-opacity-25 position-relative">
                      <button className="btn btn-sm btn-link text-danger position-absolute top-0 end-0 mt-1 mt-md-2 me-1 me-md-2 p-0"
                        onClick={() => handleRemoveMember(index)}>
                        <i className="bi bi-trash3 fs-5"></i>
                      </button>

                      <div className="row g-3">
                        <div className="col-12 col-md-7">
                          <label className="text-info x-small fw-bold mb-1 d-block">FULL NAME</label>
                          <input type="text" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none py-2"
                            value={member.name} onChange={e => handleMemberChange(index, 'name', e.target.value)} />
                        </div>
                        <div className="col-12 col-md-5">
                          <label className="text-info x-small fw-bold mb-1 d-block">DIET</label>
                          <select className="form-select form-select-sm bg-dark text-white border-secondary shadow-none py-2"
                            value={member.diet} onChange={e => handleMemberChange(index, 'diet', e.target.value)}>
                            <option value="veg">Veg</option>
                            <option value="non-veg">Non-Veg</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="text-info x-small fw-bold mb-1 d-block">EVENTS (Hold Ctrl to select multiple)</label>
                          <select multiple className="form-select form-select-sm bg-dark text-white border-secondary shadow-none"
                            style={{ height: '120px', fontSize: '14px' }}
                            value={member.events || []}
                            onChange={e => handleMemberChange(index, 'events', Array.from(e.target.selectedOptions, opt => opt.value))}
                          >
                            {events.map(ev => (
                              <option key={ev._id} value={ev.name} className="py-1 px-2">{ev.name} ({ev.category})</option>
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
        @media (min-width: 992px) {
          .dashboard-content { margin-left: 280px; }
        }
        @media (max-width: 991.98px) {
          .dashboard-content { 
            margin-left: 0; 
            padding-top: 10px; 
          }
        }
        .bg-glass { 
          background: rgba(255, 255, 255, 0.05) !important; 
          backdrop-filter: blur(20px); 
          border-radius: 20px; 
        }
        .x-small { font-size: 0.7rem; letter-spacing: 0.5px; }
        .member-edit-list::-webkit-scrollbar { width: 5px; }
        .member-edit-list::-webkit-scrollbar-track { background: transparent; }
        .member-edit-list::-webkit-scrollbar-thumb { 
          background: rgba(13, 202, 240, 0.2); 
          border-radius: 10px; 
        }
        select[multiple] {
          padding: 8px !important;
        }
        .italic { font-style: italic; }
      `}</style>
    </div>
  );
};

export default EditTeam;
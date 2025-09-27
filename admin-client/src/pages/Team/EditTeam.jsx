import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    API.get(`/admin/teams/${id}`)
      .then(res => {
        console.log('Fetched Team:', res.data);
        setTeam(res.data);
      })
      .catch(() => toast.error('❌ Failed to fetch team'));

    API.get('/admin/events')
      .then(res => {
        console.log('All Events:', res.data);
        setEvents(res.data); // No filter applied
      })
      .catch(() => toast.error('❌ Failed to fetch events'));
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
      members: [...prev.members, { name: '', events: [] }]
    }));
  };

  const handleRemoveMember = (index) => {
    const updated = [...team.members];
    updated.splice(index, 1);
    setTeam(prev => ({ ...prev, members: updated }));
  };

  const handleSave = async () => {
    try {
      await API.put(`/admin/teams/${id}`, team);
      toast.success('✅ Team updated');
      setTimeout(() => navigate('/teams'), 1500);
    } catch {
      toast.error('❌ Failed to update team');
    }
  };

  if (!team) return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <p className="text-center text-light mt-5">Loading team...</p>
    </>
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container py-5" style={{ backgroundColor: '#0c0d13', minHeight: '100vh' }}>
        <div className="mx-auto p-4 rounded shadow-sm" style={{ backgroundColor: '#161b22', border: '1px solid #2b2f3a', maxWidth: '720px' }}>
          <h2 className="text-center text-primary fw-bold mb-4">Edit Team: {team.leader}</h2>

          <div className="mb-3">
            <label className="form-label text-info">College</label>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              value={team.college}
              onChange={e => handleChange('college', e.target.value)}
              placeholder="College Name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-info">Faculty In-Charge</label>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              value={team.faculty}
              onChange={e => handleChange('faculty', e.target.value)}
              placeholder="Faculty In-Charge"
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-info">Contact</label>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              value={team.contact}
              onChange={e => handleChange('contact', e.target.value)}
              placeholder="Contact Number"
            />
          </div>

          <h4 className="text-white fw-semibold mt-4 mb-3 border-bottom pb-2">Team Members</h4>
          {Array.isArray(team.members) && team.members.map((member, index) => (
            <div key={index} className="mb-4 p-3 rounded border-start border-primary" style={{ backgroundColor: '#0e111a', border: '1px solid #2b2f3a' }}>
              <div className="mb-2">
                <label className="form-label text-info">Member Name</label>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary"
                  value={member.name}
                  onChange={e => handleMemberChange(index, 'name', e.target.value)}
                  placeholder={`Member ${index + 1} Name`}
                />
              </div>

              <div className="mb-2">
                <label className="form-label text-info">
                  Events <span className="text-muted">(Use Ctrl to choose multiple)</span>
                </label>
                <select
                  multiple
                  className="form-select bg-dark text-light border-secondary"
                  value={member.events || []}
                  onChange={e =>
                    handleMemberChange(index, 'events', Array.from(e.target.selectedOptions, opt => opt.value))
                  }
                >
                  {Array.isArray(events) && events.length > 0 ? (
                    events.map(event => (
                      <option key={event._id} value={event.name}>
                        {event.name} ({event.category})
                      </option>
                    ))
                  ) : (
                    <option disabled>No events available</option>
                  )}
                </select>
              </div>

              <div className="text-end">
                <button className="btn btn-sm btn-danger" onClick={() => handleRemoveMember(index)}>
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}

          <div className="d-grid gap-2 mt-4">
            <button className="btn btn-primary fw-semibold" onClick={handleAddMember}>
              ➕ Add Member
            </button>
            <button className="btn btn-success fw-semibold" onClick={handleSave}>
              💾 Save Changes
            </button>
            <button className="btn btn-secondary fw-semibold" onClick={() => navigate('/teams')}>
              🔙 Back to Teams
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditTeam;
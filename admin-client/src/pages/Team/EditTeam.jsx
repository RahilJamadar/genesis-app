import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/adminApi';
import './EditTeam.css';
import Navbar from '../../components/Navbar';

function EditTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Load team data
    API.get(`/teams/${id}`)
      .then(res => setTeam(res.data))
      .catch(err => console.error('Fetch error:', err));

    // Load event options from backend
    API.get('/events')
      .then(res => {
        const visibleEvents = res.data.filter(ev => ev.isVisible);
        setEvents(visibleEvents.map(ev => ev.name));
      })
      .catch(err => console.error('Event fetch error:', err));
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
      await API.put(`/teams/${id}`, team);
      alert('Team updated ✅');
      navigate('/teams');
    } catch (err) {
      console.error('Save error:', err);
      alert('Update failed');
    }
  };

  if (!team) return <p>Loading team...</p>;

  return (
    <>
      <Navbar />
    <div className="edit-team">
      <h2>Edit Team: {team.leader}</h2>

      <label>College</label>
      <input
        type="text"
        value={team.college}
        onChange={e => handleChange('college', e.target.value)}
        placeholder="College Name"
      />

      <label>Faculty In-Charge</label>
      <input
        type="text"
        value={team.faculty}
        onChange={e => handleChange('faculty', e.target.value)}
        placeholder="Faculty In-Charge"
      />

      <label>Contact</label>
      <input
        type="text"
        value={team.contact}
        onChange={e => handleChange('contact', e.target.value)}
        placeholder="Contact Number"
      />

      <h3>Team Members</h3>
      {team.members.map((member, index) => (
        <div key={index} className="member-block">
          <label>Member Name</label>
          <input
            type="text"
            value={member.name}
            onChange={e => handleMemberChange(index, 'name', e.target.value)}
            placeholder={`Member ${index + 1} Name`}
          />

          <label>Events (Hold Ctrl/Cmd to select multiple)</label>
          <select
            multiple
            value={member.events || []}
            onChange={e =>
              handleMemberChange(index, 'events', Array.from(e.target.selectedOptions, opt => opt.value))
            }
          >
            {events.map(event => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>

          <button onClick={() => handleRemoveMember(index)}>🗑 Remove</button>
        </div>
      ))}

      <button onClick={handleAddMember}>➕ Add Member</button>
      <button onClick={handleSave}>💾 Save Changes</button>
      <button onClick={() => navigate('/teams')}>🔙 Back to Teams</button>
    </div>
    </>
  );
}

export default EditTeam;
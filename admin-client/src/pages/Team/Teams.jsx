import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import './Teams.css';

function Teams() {
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/admin/teams')
      .then(res => setTeams(res.data))
      .catch(console.error);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team?')) return;
    await API.delete(`/admin/teams/${id}`);
    setTeams(teams.filter(t => t._id !== id));
  };

  const handleEdit = (id) => {
    navigate(`/teams/edit/${id}`);
  };

  return (
    <>
      <Navbar />
      <div className="teams">
        <h2>Team Manager</h2>
        <ul>
          {teams.map(team => (
            <li key={team._id}>
              <strong>{team.leader}</strong> from {team.college} — {team.members.length} members
              <div className="team-actions">
                <button onClick={() => handleDelete(team._id)}>❌ Delete</button>
                <button onClick={() => handleEdit(team._id)}>✏️ Edit</button>
                <button onClick={() => navigate(`/teams/view/${team._id}`)}> 🔍 View</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Teams;
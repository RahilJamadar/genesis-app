import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import './ViewTeam.css';

function ViewTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);

  useEffect(() => {
    API.get(`/admin/teams/${id}`)
      .then(res => setTeam(res.data))
      .catch(err => console.error('View fetch error:', err));
  }, [id]);

  if (!team) return <p>Loading team data...</p>;

  return (
    <>
      <Navbar />
      <div className="view-team">
        <h2>Team Details</h2>
        <p><strong>Leader:</strong> {team.leader}</p>
        <p><strong>College:</strong> {team.college}</p>
        <p><strong>Contact:</strong> {team.contact}</p>
        <p><strong>Faculty In-Charge:</strong> {team.faculty}</p>

        <h3>Members</h3>
        <ul>
          {team.members.map((member, i) => (
            <li key={i}>
              <strong>{member.name}</strong>
              {member.events?.length > 0 && (
                <span> — Events: {member.events.join(', ')}</span>
              )}
            </li>
          ))}
        </ul>

        <button onClick={() => navigate('/teams')}>🔙 Back to Teams</button>
      </div>
    </>
  );
}

export default ViewTeam;   
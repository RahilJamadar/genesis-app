import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import getApiBase from '../../utils/getApiBase';
import Navbar from '../../components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ViewTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const baseURL = getApiBase();

  useEffect(() => {
    axios.get(`${baseURL}/api/admin/teams/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      withCredentials: true
    })
      .then(res => setTeam(res.data))
      .catch(err => console.error('View fetch error:', err));
  }, [id, baseURL]);

  if (!team) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
        <p className="text-center text-light mt-5">Loading team data...</p>
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container py-5" style={{ backgroundColor: '#0d0d15', minHeight: '100vh' }}>
        <div className="mx-auto p-4 rounded shadow-sm" style={{ backgroundColor: '#161b22', border: '1px solid #2b2f3a', maxWidth: '700px' }}>
          <h2 className="text-center text-info fw-bold mb-4">Team Details</h2>

          <p><strong className="text-info">Leader:</strong> {team.leader}</p>
          <p><strong className="text-info">College:</strong> {team.college}</p>
          <p><strong className="text-info">Contact:</strong> {team.contact}</p>
          <p><strong className="text-info">Faculty In-Charge:</strong> {team.faculty}</p>

          <h4 className="text-info fw-semibold mt-4 mb-3 border-bottom pb-2">Members</h4>
          <ul className="list-unstyled">
            {team.members.map((member, i) => (
              <li
                key={i}
                className="mb-3 p-3 rounded"
                style={{
                  backgroundColor: '#10141f',
                  borderLeft: '4px solid #00ffe0',
                  boxShadow: '0 2px 12px rgba(0, 255, 224, 0.05)',
                  color: '#e0e6f0'
                }}
              >
                <strong className="text-info">{member.name}</strong>
                {member.events?.length > 0 && (
                  <span className="text-white"> — Events: {member.events.join(', ')}</span>
                )}
              </li>
            ))}
          </ul>

          <button
            className="btn btn-info fw-semibold w-100 mt-4"
            onClick={() => navigate('/teams')}
          >
            🔙 Back to Teams
          </button>
        </div>
      </div>
    </>
  );
}

export default ViewTeam;
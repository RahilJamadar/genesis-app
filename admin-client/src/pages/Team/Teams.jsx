import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getApiBase from '../../utils/getApiBase';
import Navbar from '../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Teams() {
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();
  const baseURL = getApiBase();

  useEffect(() => {
    axios.get(`${baseURL}/api/admin/teams`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      withCredentials: true
    })
      .then(res => setTeams(res.data))
      .catch(() => toast.error('❌ Failed to fetch teams'));
  }, [baseURL]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team?')) return;
    try {
      await axios.delete(`${baseURL}/api/admin/teams/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      setTeams(prev => prev.filter(t => t._id !== id));
      toast.success('🗑️ Team deleted');
    } catch {
      toast.error('❌ Failed to delete team');
    }
  };

  const handleEdit = (id) => {
    navigate(`/teams/edit/${id}`);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container py-5" style={{ backgroundColor: '#0d0d15', minHeight: '100vh' }}>
        <h2 className="text-center text-info fw-bold mb-4">Team Manager</h2>

        <div className="row gy-4">
          {teams.map(team => (
            <div key={team._id} className="col-md-6">
              <div
                className="p-3 rounded shadow-sm d-flex flex-column gap-2"
                style={{
                  backgroundColor: '#161b22',
                  borderLeft: '4px solid #00ffe0',
                  border: '1px solid #2a2f3a',
                  color: '#e0e6f0'
                }}
              >
                <div>
                  <strong className="text-info">{team.leader}</strong> from {team.college}<br />
                  <span className="text-white">{team.members.length} members</span>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(team._id)}>
                    ❌ Delete
                  </button>
                  <button className="btn btn-sm btn-warning" onClick={() => handleEdit(team._id)}>
                    ✏️ Edit
                  </button>
                  <button className="btn btn-sm btn-info" onClick={() => navigate(`/teams/view/${team._id}`)}>
                    🔍 View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Teams;
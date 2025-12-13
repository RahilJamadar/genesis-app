import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import getApiBase from '../../../utils/getApiBase';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function StudentCoordinatorsPage() {
  const [coordinators, setCoordinators] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isEditing, setIsEditing] = useState(null);

  const baseURL = getApiBase();

  const fetchCoordinators = useCallback(async () => {
    try {
      const res = await axios.get(`${baseURL}/api/admin/student-coordinators`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      setCoordinators(res.data);
    } catch {
      toast.error('❌ Failed to fetch coordinators');
    }
  }, [baseURL]);

  useEffect(() => {
    fetchCoordinators();
  }, [fetchCoordinators]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
    setIsEditing(null);
  };

  const validateFields = (data) => {
    const trimmed = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim()
    };
    if (!trimmed.name || !trimmed.email || !trimmed.phone) {
      return { valid: false, trimmed, message: 'All fields are required.' };
    }
    return { valid: true, trimmed };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valid, trimmed, message } = validateFields(formData);
    if (!valid) {
      toast.warn(`⚠️ ${message}`);
      return;
    }
    try {
      await axios.post(`${baseURL}/api/admin/student-coordinators`, trimmed, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      toast.success('✅ Coordinator added');
      resetForm();
      fetchCoordinators();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error creating coordinator';
      toast.error(`❌ ${msg}`);
    }
  };

  const handleUpdate = async () => {
    const { valid, trimmed, message } = validateFields(formData);
    if (!valid) {
      toast.warn(`⚠️ ${message}`);
      return;
    }
    try {
      await axios.put(`${baseURL}/api/admin/student-coordinators/${isEditing}`, trimmed, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      toast.success('✏️ Coordinator updated');
      resetForm();
      fetchCoordinators();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating coordinator';
      toast.error(`❌ ${msg}`);
    }
  };

  const startEdit = (coord) => {
    setIsEditing(coord._id);
    setFormData({ name: coord.name, email: coord.email, phone: coord.phone });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coordinator?')) return;
    try {
      await axios.delete(`${baseURL}/api/admin/student-coordinators/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      toast.success('🗑️ Coordinator deleted');
      fetchCoordinators();
    } catch {
      toast.error('❌ Failed to delete coordinator');
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container py-5" style={{ backgroundColor: '#0d0d15', minHeight: '100vh' }}>
        <h2 className="text-center text-info fw-bold mb-4">Student Coordinators</h2>

        <form
          onSubmit={handleSubmit}
          className="mx-auto p-4 rounded shadow-sm mb-5"
          style={{ backgroundColor: '#161b22', border: '1px solid #2b2f3a', maxWidth: '500px' }}
        >
          <div className="mb-3">
            <label className="form-label text-light">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              required
              className="form-control bg-dark text-light border-secondary"
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-light">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              required
              className="form-control bg-dark text-light border-secondary"
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-light">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
              required
              className="form-control bg-dark text-light border-secondary"
            />
          </div>
          <div className="text-end">
            {isEditing ? (
              <button type="button" className="btn btn-warning fw-semibold px-4" onClick={handleUpdate}>
                Update
              </button>
            ) : (
              <button type="submit" className="btn btn-info fw-semibold px-4">
                Add Coordinator
              </button>
            )}
          </div>
        </form>

        <div className="table-responsive">
          <table className="table table-dark table-bordered align-middle">
            <thead className="table-secondary text-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coordinators.map(coord => (
                <tr key={coord._id}>
                  <td className="fw-semibold text-info">{coord.name}</td>
                  <td>{coord.email}</td>
                  <td>{coord.phone}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(coord)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(coord._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default StudentCoordinatorsPage;
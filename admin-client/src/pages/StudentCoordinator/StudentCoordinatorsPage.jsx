import React, { useEffect, useState } from 'react';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import './StudentCoordinatorsPage.css';

function StudentCoordinatorsPage() {
  const [coordinators, setCoordinators] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const res = await API.get('/admin/student-coordinators');
      setCoordinators(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch coordinators:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
    setIsEditing(null);
    setError('');
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
      setError(message);
      return;
    }

    try {
      await API.post('/admin/student-coordinators', trimmed);
      resetForm();
      fetchCoordinators();
    } catch (err) {
      console.error('❌ Failed to create coordinator:', err);
      setError(err.response?.data?.message || 'Error creating coordinator');
    }
  };

  const handleUpdate = async () => {
    const { valid, trimmed, message } = validateFields(formData);
    if (!valid) {
      setError(message);
      return;
    }

    try {
      await API.put(`/admin/student-coordinators/${isEditing}`, trimmed);
      resetForm();
      fetchCoordinators();
    } catch (err) {
      console.error('❌ Failed to update coordinator:', err);
      setError(err.response?.data?.message || 'Error updating coordinator');
    }
  };

  const startEdit = (coord) => {
    setIsEditing(coord._id);
    setFormData({
      name: coord.name,
      email: coord.email,
      phone: coord.phone
    });
    setError('');
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/student-coordinators/${id}`);
      fetchCoordinators();
    } catch (err) {
      console.error('❌ Failed to delete coordinator:', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="coordinator-page">
        <h2>Student Coordinators</h2>

        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            required
          />

          <label>Phone</label>
          <input
            type="text"
            value={formData.phone}
            onChange={e => handleChange('phone', e.target.value)}
            required
          />

          {error && <p className="error-message">⚠️ {error}</p>}

          {isEditing ? (
            <button type="button" onClick={handleUpdate}>Update</button>
          ) : (
            <button type="submit">Add Coordinator</button>
          )}
        </form>

        <ul className="coordinator-list">
          {coordinators.map(coord => (
            <li key={coord._id} className="coordinator-card">
              <strong>{coord.name}</strong> — {coord.email}, {coord.phone}
              <div className="actions">
                <button onClick={() => startEdit(coord)}>Edit</button>
                <button onClick={() => handleDelete(coord._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default StudentCoordinatorsPage;
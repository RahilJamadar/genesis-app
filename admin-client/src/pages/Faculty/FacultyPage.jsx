import React, { useEffect, useState } from 'react';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import './FacultyPage.css';

function FacultyPage() {
  const [facultyList, setFacultyList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    password: ''
  });
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      const res = await API.get('/admin/faculty');
      setFacultyList(res.data);
    } catch (err) {
      console.error('❌ Failed to load faculty:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/faculty', formData);
      resetForm();
      loadFaculty();
    } catch (err) {
      console.error('❌ Failed to create faculty:', err);
    }
  };

  const startEdit = (faculty) => {
    setIsEditing(faculty._id);
    setFormData({
      name: faculty.name ?? '',
      number: faculty.number ?? '',
      password: '' // optional during edit
    });
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/admin/faculty/${isEditing}`, formData);
      setIsEditing(null);
      resetForm();
      loadFaculty();
    } catch (err) {
      console.error('❌ Failed to update faculty:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/faculty/${id}`);
      loadFaculty();
    } catch (err) {
      console.error('❌ Failed to delete faculty:', err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', number: '', password: '' });
  };

  return (
    <>
      <Navbar />
      <div className="faculty-page">
        <h2>👨‍🏫 Faculty Management</h2>

        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            required
          />

          <label>Number</label>
          <input
            type="text"
            value={formData.number}
            onChange={e => handleChange('number', e.target.value)}
            required
          />

          <label>{isEditing ? 'New Password (optional)' : 'Password'}</label>
          <input
            type="password"
            value={formData.password}
            onChange={e => handleChange('password', e.target.value)}
            placeholder={isEditing ? 'Leave blank to keep existing' : ''}
            required={!isEditing}
          />

          {isEditing ? (
            <button type="button" onClick={handleUpdate}>💾 Update Faculty</button>
          ) : (
            <button type="submit">➕ Add Faculty</button>
          )}
        </form>

        <ul className="faculty-list">
          {facultyList.map(faculty => (
            <li key={faculty._id} className="faculty-card">
              <strong>{faculty.name}</strong> — #{faculty.number}
              <div className="actions">
                <button onClick={() => startEdit(faculty)}>✏️ Edit</button>
                <button onClick={() => handleDelete(faculty._id)}>🗑️ Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default FacultyPage;
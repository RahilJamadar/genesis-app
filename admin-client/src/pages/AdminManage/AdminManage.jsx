import React, { useEffect, useState } from 'react';
import API from '../../api/adminApi';           // Token-aware Axios
import Navbar from '../../components/Navbar';   // Reused Navbar
import './AdminManage.css';                 // Consistent styling

function AdminManage() {
  const [adminList, setAdminList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  });
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const res = await API.get('/manage');
      setAdminList(res.data);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/manage', formData);
      resetForm();
      loadAdmins();
    } catch (err) {
      console.error('Failed to create admin:', err);
      alert('Failed to add admin');
    }
  };

const handleDelete = async (id) => {
  const loggedInId = localStorage.getItem('adminId');
  if (id === loggedInId) {
    alert("❌ You cannot delete your own admin account.");
    return;
  }

  if (!window.confirm('Delete this admin?')) return;
  try {
    await API.delete(`/manage/${id}`);
    loadAdmins();
  } catch (err) {
    console.error('Failed to delete admin:', err);
    alert('Failed to delete admin');
  }
};

  const startEdit = (admin) => {
    setIsEditing(admin._id);
    setFormData({
      name: admin.name ?? '',
      password: ''
    });
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/manage/${isEditing}`, formData);
      setIsEditing(null);
      resetForm();
      loadAdmins();
    } catch (err) {
      console.error('Failed to update admin:', err);
      alert('Failed to update');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', password: '' });
  };

  return (
    <>
      <Navbar />
      <div className="admin-manage-page">
        <h2>👤 Admin Management</h2>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            value={formData.name ?? ''}
            onChange={e => handleChange('name', e.target.value)}
            required
          />

          <label>{isEditing ? 'New Password (optional)' : 'Password'}</label>
          <input
            type="password"
            value={formData.password ?? ''}
            onChange={e => handleChange('password', e.target.value)}
            placeholder={isEditing ? 'Leave blank to keep existing' : ''}
          />

          {isEditing ? (
            <button type="button" onClick={handleUpdate}>💾 Update Admin</button>
          ) : (
            <button type="submit">➕ Add Admin</button>
          )}
        </form>

        <ul className="admin-list">
          {adminList.map(admin => (
            <li key={admin._id} className="admin-card">
              <strong>{admin.name}</strong>
              <div className="actions">
                <button onClick={() => startEdit(admin)}>✏️ Edit</button>
                <button onClick={() => handleDelete(admin._id)}>🗑 Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default AdminManage;
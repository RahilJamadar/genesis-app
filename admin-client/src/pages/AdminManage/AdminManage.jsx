import React, { useEffect, useState } from 'react';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminManage() {
  const [adminList, setAdminList] = useState([]);
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const res = await API.get('/admin/manage');
      setAdminList(res.data);
    } catch {
      toast.error('❌ Failed to fetch admins');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/manage', formData);
      toast.success('✅ Admin added');
      resetForm();
      loadAdmins();
    } catch {
      toast.error('❌ Failed to add admin');
    }
  };

  const handleDelete = async (id) => {
    const loggedInId = localStorage.getItem('adminId');
    if (id === loggedInId) {
      toast.warn('⚠️ You cannot delete your own admin account');
      return;
    }

    if (!window.confirm('Delete this admin?')) return;

    try {
      await API.delete(`/admin/manage/${id}`);
      toast.success('🗑 Admin deleted');
      loadAdmins();
    } catch {
      toast.error('❌ Failed to delete admin');
    }
  };

  const startEdit = (admin) => {
    setIsEditing(admin._id);
    setFormData({ name: admin.name ?? '', password: '' });
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/admin/manage/${isEditing}`, formData);
      toast.success('💾 Admin updated');
      setIsEditing(null);
      resetForm();
      loadAdmins();
    } catch {
      toast.error('❌ Failed to update admin');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', password: '' });
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container mt-5 text-light">
        <h2 className="text-center text-primary border-bottom pb-2 mb-4">👤 Admin Management</h2>

        <form
          onSubmit={handleSubmit}
          className="bg-dark border border-secondary rounded shadow p-4 mb-5"
        >
          <div className="mb-3">
            <label className="form-label text-primary">Username</label>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              value={formData.name ?? ''}
              onChange={e => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-primary">
              {isEditing ? 'New Password (optional)' : 'Password'}
            </label>
            <input
              type="password"
              className="form-control bg-dark text-light border-secondary"
              value={formData.password ?? ''}
              onChange={e => handleChange('password', e.target.value)}
              placeholder={isEditing ? 'Leave blank to keep existing' : ''}
            />
          </div>

          {isEditing ? (
            <button type="button" className="btn btn-primary fw-semibold" onClick={handleUpdate}>
              💾 Update Admin
            </button>
          ) : (
            <button type="submit" className="btn btn-primary fw-semibold">
              ➕ Add Admin
            </button>
          )}
        </form>

        <ul className="list-unstyled">
          {adminList.map(admin => (
            <li
              key={admin._id}
              className="bg-dark border border-secondary rounded shadow p-3 mb-3 d-flex justify-content-between align-items-center"
            >
              <strong className="text-light">{admin.name}</strong>
              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-success btn-sm fw-semibold"
                  onClick={() => startEdit(admin)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-danger btn-sm fw-semibold"
                  onClick={() => handleDelete(admin._id)}
                >
                  🗑 Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default AdminManage;
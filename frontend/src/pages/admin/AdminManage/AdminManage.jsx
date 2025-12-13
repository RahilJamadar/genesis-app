import React, { useEffect, useState } from 'react';
import axios from 'axios';
import getApiBase from '../../../utils/getApiBase';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminManage() {
  const [adminList, setAdminList] = useState([]);
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [isEditing, setIsEditing] = useState(null);

  const baseURL = `${getApiBase()}/api/admin/manage`;

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const res = await axios.get(baseURL, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          withCredentials: true
        });
        setAdminList(res.data);
      } catch {
        toast.error('❌ Failed to fetch admins');
      }
    };

    loadAdmins();
  }, [baseURL]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(baseURL, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      toast.success('✅ Admin added');
      resetForm();
      await refreshAdmins();
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
      await axios.delete(`${baseURL}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      toast.success('🗑 Admin deleted');
      await refreshAdmins();
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
      await axios.put(`${baseURL}/${isEditing}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      toast.success('💾 Admin updated');
      setIsEditing(null);
      resetForm();
      await refreshAdmins();
    } catch {
      toast.error('❌ Failed to update admin');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', password: '' });
  };

  const refreshAdmins = async () => {
    try {
      const res = await axios.get(baseURL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      setAdminList(res.data);
    } catch {
      toast.error('❌ Failed to refresh admins');
    }
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
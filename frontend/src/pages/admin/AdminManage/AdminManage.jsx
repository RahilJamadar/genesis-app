import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

function AdminManage() {
  const [adminList, setAdminList] = useState([]);
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [isEditing, setIsEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const res = await adminApi.get('/manage');
      setAdminList(res.data);
    } catch (err) {
      toast.error('❌ Failed to fetch admins');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.post('/manage', formData);
      toast.success('✅ Admin added successfully');
      resetForm();
      loadAdmins();
    } catch (err) {
      toast.error(err.response?.data?.error || '❌ Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Get current user ID from the stored user object
    const user = JSON.parse(localStorage.getItem('adminUser'));
    if (id === user?.id) {
      toast.warn('⚠️ You cannot delete your own admin account');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this admin?')) return;

    try {
      await adminApi.delete(`/manage/${id}`);
      toast.success('🗑 Admin removed');
      loadAdmins();
    } catch (err) {
      toast.error('❌ Failed to delete admin');
    }
  };

  const startEdit = (admin) => {
    setIsEditing(admin._id);
    setFormData({ name: admin.name || '', password: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await adminApi.put(`/manage/${isEditing}`, formData);
      toast.success('💾 Admin updated');
      setIsEditing(null);
      resetForm();
      loadAdmins();
    } catch (err) {
      toast.error('❌ Failed to update admin');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', password: '' });
    setIsEditing(null);
  };

  return (
    <div className="d-flex bg-dark min-vh-100">
      <Navbar />
      
      <main className="dashboard-content flex-grow-1 p-4 p-lg-5">
        <ToastContainer theme="dark" position="top-right" autoClose={2000} />

        <header className="mb-5">
          <h2 className="fw-bold text-white mb-1">Admin Management</h2>
          <p className="text-light opacity-75">Control system access and permissions</p>
        </header>

        <div className="row g-4">
          {/* Form Column */}
          <div className="col-lg-5">
            <div className="card bg-glass border-secondary shadow-lg sticky-lg-top" style={{ top: '2rem' }}>
              <div className="card-body p-4">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                  <i className={`bi ${isEditing ? 'bi-pencil-square text-warning' : 'bi-plus-circle text-info'}`}></i>
                  {isEditing ? 'Edit Administrator' : 'Add New Administrator'}
                </h5>
                
                <form onSubmit={isEditing ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit}>
                  <div className="mb-3">
                    <label className="text-white small fw-bold mb-2 opacity-75">Username</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary shadow-none py-2"
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="e.g. system_admin"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-white small fw-bold mb-2 opacity-75">
                      {isEditing ? 'New Password (Optional)' : 'Security Password'}
                    </label>
                    <input
                      type="password"
                      className="form-control bg-dark text-white border-secondary shadow-none py-2"
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      placeholder={isEditing ? "Leave blank to keep current" : "••••••••"}
                      required={!isEditing}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className={`btn ${isEditing ? 'btn-warning' : 'btn-info'} fw-bold flex-grow-1 py-2`}
                      disabled={loading}
                    >
                      {loading ? <span className="spinner-border spinner-border-sm"></span> : 
                        (isEditing ? 'Update Credentials' : 'Create Admin')}
                    </button>
                    {isEditing && (
                      <button type="button" className="btn btn-outline-secondary fw-bold" onClick={resetForm}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* List Column */}
          <div className="col-lg-7">
            <div className="card bg-glass border-secondary shadow-lg">
              <div className="card-body p-4">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-shield-lock text-info"></i>
                  Active Administrators
                </h5>
                
                <div className="d-flex flex-column gap-3">
                  {adminList.length > 0 ? adminList.map(admin => (
                    <div
                      key={admin._id}
                      className="admin-list-item d-flex justify-content-between align-items-center p-3 rounded-3 border border-secondary"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="admin-avatar bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center">
                          <i className="bi bi-person-fill fs-5"></i>
                        </div>
                        <div>
                          <h6 className="text-white fw-bold mb-0">{admin.name}</h6>
                          <span className="badge bg-dark border border-secondary text-info x-small">System Admin</span>
                        </div>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-warning btn-sm border-0"
                          onClick={() => startEdit(admin)}
                          title="Edit Admin"
                        >
                          <i className="bi bi-pencil-square fs-5"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm border-0"
                          onClick={() => handleDelete(admin._id)}
                          title="Delete Admin"
                        >
                          <i className="bi bi-trash3 fs-5"></i>
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-5 opacity-50 text-white">
                      No additional administrators found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-content {
          margin-left: 260px;
          transition: margin 0.3s ease;
        }

        .bg-glass {
          background: rgba(255, 255, 255, 0.05) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 18px;
        }

        .admin-list-item {
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.2s ease;
        }

        .admin-list-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: #0dcaf0 !important;
        }

        .admin-avatar {
          width: 45px;
          height: 45px;
        }

        .x-small { font-size: 0.7rem; }

        @media (max-width: 991.98px) {
          .dashboard-content { margin-left: 0; padding-top: 80px; }
        }
      `}</style>
    </div>
  );
}

export default AdminManage;
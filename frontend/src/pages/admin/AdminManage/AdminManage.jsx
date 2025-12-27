import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';

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
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />
      
      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">

        <header className="mb-4 mb-lg-5 text-center text-lg-start">
          <h2 className="fw-bold text-white mb-1 fs-3 fs-md-2">Admin Management</h2>
          <p className="text-light opacity-75 small uppercase tracking-widest">Control system access and permissions</p>
        </header>

        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-lg-5">
            <div className="card bg-glass border-secondary shadow-lg sticky-custom border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2 fs-6 fs-md-5">
                  <i className={`bi ${isEditing ? 'bi-pencil-square text-warning' : 'bi-plus-circle text-info'}`}></i>
                  {isEditing ? 'Edit Administrator' : 'Add New Administrator'}
                </h5>
                
                <form onSubmit={isEditing ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit} className="d-flex flex-column gap-3">
                  <div>
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Username</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary shadow-none py-2"
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="e.g. system_admin"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">
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

                  <div className="d-flex flex-column gap-2 mt-2">
                    <button 
                      type="submit" 
                      className={`btn ${isEditing ? 'btn-warning' : 'btn-info'} fw-bold py-2 text-dark shadow-sm`}
                      disabled={loading}
                    >
                      {loading ? <span className="spinner-border spinner-border-sm"></span> : 
                        (isEditing ? 'UPDATE CREDENTIALS' : 'CREATE ADMIN')}
                    </button>
                    {isEditing && (
                      <button type="button" className="btn btn-outline-secondary fw-bold text-white border-opacity-50 py-2" onClick={resetForm}>
                        CANCEL
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* List Column */}
          <div className="col-12 col-lg-7">
            <div className="card bg-glass border-secondary shadow-lg border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2 fs-6 fs-md-5">
                  <i className="bi bi-shield-lock text-info"></i>
                  Active Administrators
                </h5>
                
                <div className="d-flex flex-column gap-3">
                  {adminList.length > 0 ? adminList.map(admin => (
                    <div
                      key={admin._id}
                      className="admin-list-item d-flex justify-content-between align-items-center p-3 rounded-3 border border-secondary border-opacity-20 shadow-sm"
                    >
                      <div className="d-flex align-items-center gap-2 gap-md-3 overflow-hidden">
                        <div className="admin-avatar bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                          <i className="bi bi-person-fill fs-5"></i>
                        </div>
                        <div className="overflow-hidden">
                          <h6 className="text-white fw-bold mb-0 text-truncate small">{admin.name}</h6>
                          <span className="badge bg-black bg-opacity-40 border border-white border-opacity-10 text-info x-small-text">System Admin</span>
                        </div>
                      </div>
                      
                      <div className="d-flex gap-1 gap-md-2 flex-shrink-0">
                        <button
                          className="btn btn-outline-warning btn-sm border-0 p-2"
                          onClick={() => startEdit(admin)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square fs-5"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm border-0 p-2"
                          onClick={() => handleDelete(admin._id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash3 fs-5"></i>
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-5 opacity-50 text-white small">
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
        /* Desktop: Sidebar Offset and Sticky Form */
        @media (min-width: 992px) {
          .dashboard-content { margin-left: 280px; }
          .sticky-custom { position: sticky; top: 2rem; z-index: 10; }
        }

        /* Mobile View: No Offset */
        @media (max-width: 991.98px) {
          .dashboard-content { margin-left: 0; padding-top: 10px; }
        }

        .bg-glass {
          background: rgba(255, 255, 255, 0.03) !important;
          backdrop-filter: blur(20px);
          border-radius: 24px;
        }

        .admin-list-item {
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.3s ease;
        }

        .admin-list-item:hover {
          background: rgba(13, 202, 240, 0.05);
          border-color: rgba(13, 202, 240, 0.3) !important;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
        }

        .x-small { font-size: 0.7rem; }
        .x-small-text { font-size: 0.6rem; letter-spacing: 0.5px; }
        .ls-1 { letter-spacing: 1px; }

        @media (max-width: 576px) {
          .admin-avatar { width: 32px; height: 32px; }
          .admin-avatar i { font-size: 1rem !important; }
        }
      `}</style>
    </div>
  );
}

export default AdminManage;
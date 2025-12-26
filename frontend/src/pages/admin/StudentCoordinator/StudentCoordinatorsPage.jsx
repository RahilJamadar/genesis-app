import React, { useEffect, useState, useCallback } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const StudentCoordinatorsPage = () => {
  const [coordinators, setCoordinators] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isEditing, setIsEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCoordinators = useCallback(async () => {
    try {
      const res = await adminApi.get('/student-coordinators');
      setCoordinators(res.data);
    } catch (err) {
      toast.error('❌ Failed to fetch coordinators');
    }
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await adminApi.put(`/student-coordinators/${isEditing}`, formData);
        toast.success('✏️ Coordinator updated');
      } else {
        await adminApi.post('/student-coordinators', formData);
        toast.success('✅ Coordinator added');
      }
      resetForm();
      fetchCoordinators();
    } catch (err) {
      toast.error(`❌ ${err.response?.data?.message || 'Action failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (coord) => {
    setIsEditing(coord._id);
    setFormData({ name: coord.name, email: coord.email, phone: coord.phone });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('🚨 Delete this student coordinator? This may affect assigned event listings.')) return;
    try {
      await adminApi.delete(`/student-coordinators/${id}`);
      toast.success('🗑️ Coordinator removed');
      fetchCoordinators();
    } catch {
      toast.error('❌ Failed to delete coordinator');
    }
  };

  return (
    <div className="d-flex bg-dark min-vh-100">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-4 p-lg-5">
        <ToastContainer theme="dark" position="top-right" autoClose={2000} />

        <header className="mb-5">
          <h2 className="fw-bold text-white mb-1">Student Infrastructure</h2>
          <p className="text-light opacity-75">Manage student coordinators for seamless event execution</p>
        </header>

        <div className="row g-4">
          {/* Form Section */}
          <div className="col-lg-4">
            <div className="card bg-glass border-secondary shadow-lg sticky-lg-top" style={{ top: '2rem' }}>
              <div className="card-body p-4">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                  <i className={`bi ${isEditing ? 'bi-pencil-square text-warning' : 'bi-person-plus text-info'}`}></i>
                  {isEditing ? 'Edit Profile' : 'New Coordinator'}
                </h5>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="text-info small fw-bold mb-2 d-block">FULL NAME</label>
                    <input type="text" className="form-control bg-dark text-white border-secondary shadow-none"
                      value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="text-info small fw-bold mb-2 d-block">EMAIL ADDRESS</label>
                    <input type="email" className="form-control bg-dark text-white border-secondary shadow-none"
                      value={formData.email} onChange={e => handleChange('email', e.target.value)} required />
                  </div>
                  <div className="mb-4">
                    <label className="text-info small fw-bold mb-2 d-block">WHATSAPP / PHONE</label>
                    <input type="text" className="form-control bg-dark text-white border-secondary shadow-none"
                      value={formData.phone} onChange={e => handleChange('phone', e.target.value)} required />
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className={`btn ${isEditing ? 'btn-warning' : 'btn-info'} fw-bold flex-grow-1 py-2`} disabled={loading}>
                      {loading ? <span className="spinner-border spinner-border-sm"></span> : (isEditing ? 'UPDATE' : 'REGISTER')}
                    </button>
                    {isEditing && (
                      <button type="button" className="btn btn-outline-secondary fw-bold" onClick={resetForm}>CANCEL</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="col-lg-8">
            <div className="card bg-glass border-secondary shadow-lg">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0">
                    <thead className="bg-white bg-opacity-5">
                      <tr className="text-info small text-uppercase fw-bold border-secondary">
                        <th className="ps-4 py-3">Coordinator</th>
                        <th className="py-3">Contact Details</th>
                        <th className="text-center pe-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coordinators.length > 0 ? coordinators.map(coord => (
                        <tr key={coord._id} className="border-secondary">
                          <td className="ps-4 py-3">
                            <div className="fw-bold text-white">{coord.name}</div>
                            <div className="x-small text-info opacity-75">ID: {coord._id.slice(-6).toUpperCase()}</div>
                          </td>
                          <td className="py-3">
                            <div className="text-white small mb-1"><i className="bi bi-envelope me-2"></i>{coord.email}</div>
                            <div className="text-light opacity-75 small"><i className="bi bi-telephone me-2 text-warning"></i>{coord.phone}</div>
                          </td>
                          <td className="text-center pe-4 py-3">
                            <div className="d-flex justify-content-center gap-2">
                              <button className="btn btn-outline-warning btn-sm border-0" onClick={() => startEdit(coord)} title="Edit">
                                <i className="bi bi-pencil-square fs-5"></i>
                              </button>
                              <button className="btn btn-outline-danger btn-sm border-0" onClick={() => handleDelete(coord._id)} title="Delete">
                                <i className="bi bi-trash3 fs-5"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="text-center py-5 text-secondary opacity-50">No student coordinators found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-content { margin-left: 260px; }
        .bg-glass { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(12px); border-radius: 20px; }
        .x-small { font-size: 0.7rem; }
        @media (max-width: 991.98px) { .dashboard-content { margin-left: 0; padding-top: 80px; } }
      `}</style>
    </div>
  );
};

export default StudentCoordinatorsPage;
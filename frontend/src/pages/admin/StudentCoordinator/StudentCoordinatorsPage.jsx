import React, { useEffect, useState, useCallback } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
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
    // Smooth scroll to top for mobile users to see the form
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
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">

        <header className="mb-4 mb-lg-5 text-center text-lg-start">
          <h2 className="fw-bold text-white mb-1 fs-3 fs-md-2">Student Infrastructure</h2>
          <p className="text-light opacity-75 small uppercase tracking-widest">Manage student coordinators for seamless event execution</p>
        </header>

        <div className="row g-4">
          {/* Form Section */}
          <div className="col-lg-4">
            <div className="card bg-glass border-secondary shadow-lg sticky-custom border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2 fs-6 fs-md-5">
                  <i className={`bi ${isEditing ? 'bi-pencil-square text-warning' : 'bi-person-plus text-info'}`}></i>
                  {isEditing ? 'Edit Profile' : 'New Coordinator'}
                </h5>

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                  <div>
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Full Name</label>
                    <input type="text" className="form-control bg-dark text-white border-secondary shadow-none py-2"
                      placeholder="e.g. John Doe"
                      value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Email Address</label>
                    <input type="email" className="form-control bg-dark text-white border-secondary shadow-none py-2"
                      placeholder="name@example.com"
                      value={formData.email} onChange={e => handleChange('email', e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Whatsapp / Phone</label>
                    <input type="text" className="form-control bg-dark text-white border-secondary shadow-none py-2"
                      placeholder="Contact No."
                      value={formData.phone} onChange={e => handleChange('phone', e.target.value)} required />
                  </div>

                  <div className="d-flex flex-column gap-2 mt-2">
                    <button type="submit" className={`btn ${isEditing ? 'btn-warning' : 'btn-info'} fw-bold py-2 text-dark`} disabled={loading}>
                      {loading ? <span className="spinner-border spinner-border-sm"></span> : (isEditing ? 'UPDATE PROFILE' : 'REGISTER COORDINATOR')}
                    </button>
                    {isEditing && (
                      <button type="button" className="btn btn-outline-secondary fw-bold text-white border-opacity-50 py-2" onClick={resetForm}>CANCEL</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="col-lg-8">
            <div className="card bg-glass border-secondary shadow-lg border-opacity-10">
              <div className="card-body p-0">
                <div className="table-responsive custom-scroll">
                  <table className="table table-dark table-hover align-middle mb-0">
                    <thead className="bg-white bg-opacity-5">
                      <tr className="text-info x-small text-uppercase fw-bold ls-1 border-secondary">
                        <th className="ps-3 ps-md-4 py-3 min-w-150">Coordinator</th>
                        <th className="py-3 min-w-200">Contact Details</th>
                        <th className="text-center pe-3 pe-md-4 py-3 min-w-100">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="border-top-0">
                      {coordinators.length > 0 ? coordinators.map(coord => (
                        <tr key={coord._id} className="border-bottom border-secondary border-opacity-10">
                          <td className="ps-3 ps-md-4 py-3">
                            <div className="fw-bold text-white small text-uppercase">{coord.name}</div>
                            <div className="x-small text-info opacity-50">ID: {coord._id.slice(-6).toUpperCase()}</div>
                          </td>
                          <td className="py-3">
                            <div className="text-white x-small mb-1 d-flex align-items-center gap-2">
                              <i className="bi bi-envelope text-info opacity-50"></i>
                              <span className="text-truncate" style={{maxWidth: '180px'}}>{coord.email}</span>
                            </div>
                            <div className="text-light opacity-75 x-small d-flex align-items-center gap-2">
                              <i className="bi bi-telephone text-warning opacity-50"></i>
                              {coord.phone}
                            </div>
                          </td>
                          <td className="text-center pe-3 pe-md-4 py-3">
                            <div className="d-flex justify-content-center gap-1 gap-md-2">
                              <button className="btn btn-outline-warning btn-sm border-0 p-2" onClick={() => startEdit(coord)} title="Edit">
                                <i className="bi bi-pencil-square fs-5"></i>
                              </button>
                              <button className="btn btn-outline-danger btn-sm border-0 p-2" onClick={() => handleDelete(coord._id)} title="Delete">
                                <i className="bi bi-trash3 fs-5"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="text-center py-5 text-secondary opacity-50 small">No student coordinators found.</td>
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
        /* Desktop: Sidebar Offset */
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

        .x-small { font-size: 0.7rem; }
        .ls-1 { letter-spacing: 1px; }
        .min-w-150 { min-width: 150px; }
        .min-w-200 { min-width: 200px; }
        .min-w-100 { min-width: 100px; }

        .custom-scroll::-webkit-scrollbar { height: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(13, 202, 240, 0.2);
          border-radius: 10px;
        }

        .form-control::placeholder { color: rgba(255,255,255,0.2); font-size: 0.85rem; }
      `}</style>
    </div>
  );
};

export default StudentCoordinatorsPage;
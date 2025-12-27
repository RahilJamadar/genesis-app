import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
const FacultyPage = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [formData, setFormData] = useState({ name: '', number: '', password: '' });
  const [isEditing, setIsEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      const res = await adminApi.get('/faculty');
      setFacultyList(res.data);
    } catch (err) {
      toast.error('❌ Failed to load faculty list');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.post('/faculty', formData);
      toast.success('✅ Faculty added successfully');
      resetForm();
      loadFaculty();
    } catch (err) {
      toast.error('❌ Failed to add faculty');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (faculty) => {
    setIsEditing(faculty._id);
    setFormData({
      name: faculty.name ?? '',
      number: faculty.number ?? '',
      password: ''
    });
    // On mobile, scroll back up to the form for easy editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await adminApi.put(`/faculty/${isEditing}`, formData);
      toast.success('💾 Faculty updated');
      setIsEditing(null);
      resetForm();
      loadFaculty();
    } catch (err) {
      toast.error('❌ Failed to update faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this judge? This may affect assigned events.')) return;
    try {
      await adminApi.delete(`/faculty/${id}`);
      toast.success('🗑️ Faculty deleted');
      loadFaculty();
    } catch (err) {
      toast.error('❌ Failed to delete faculty');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', number: '', password: '' });
    setIsEditing(null);
  };

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">

        <header className="mb-4 mb-lg-5 text-center text-lg-start">
          <h2 className="fw-bold text-white mb-1 fs-3 fs-md-2">Judge Management</h2>
          <p className="text-light opacity-75 small">Register and manage faculty judges for events</p>
        </header>

        <div className="row g-4">
          {/* Form Section */}
          <div className="col-lg-4">
            <div className="card bg-glass border-secondary shadow-lg sticky-custom border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2 fs-6 fs-md-5">
                  <i className={`bi ${isEditing ? 'bi-pencil-square text-warning' : 'bi-person-plus text-info'}`}></i>
                  {isEditing ? 'Edit Judge' : 'Register New Judge'}
                </h5>

                <form onSubmit={isEditing ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit}>
                  <div className="mb-3">
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Full Name</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary shadow-none py-2"
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="e.g. Dr. Smith"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Phone Number</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary shadow-none py-2"
                      value={formData.number}
                      onChange={e => handleChange('number', e.target.value)}
                      placeholder="Contact No."
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">
                      {isEditing ? 'New Password (Optional)' : 'Access Password'}
                    </label>
                    <input
                      type="password"
                      className="form-control bg-dark text-white border-secondary shadow-none py-2"
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      placeholder={isEditing ? 'Keep blank to stay same' : '••••••••'}
                      required={!isEditing}
                    />
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <button
                      type="submit"
                      className={`btn ${isEditing ? 'btn-warning' : 'btn-info'} fw-bold py-2 text-dark`}
                      disabled={loading}
                    >
                      {loading ? <span className="spinner-border spinner-border-sm"></span> :
                        (isEditing ? 'UPDATE JUDGE' : 'ADD JUDGE')}
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

          {/* List Section */}
          <div className="col-lg-8">
            <div className="card bg-glass border-secondary shadow-lg border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2 fs-6 fs-md-5">
                  <i className="bi bi-person-lines-fill text-info"></i>
                  Active Faculty Directory
                </h5>

                <div className="table-responsive custom-scroll">
                  <table className="table table-dark table-hover align-middle border-secondary mb-0">
                    <thead>
                      <tr className="text-info x-small text-uppercase fw-bold ls-1 border-secondary">
                        <th className="py-3 px-2">#</th>
                        <th className="py-3 min-w-150">Judge Details</th>
                        <th className="py-3 min-w-150">Contact</th>
                        <th className="py-3 text-center min-w-100">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="border-top-0">
                      {facultyList.length > 0 ? facultyList.map((faculty, index) => (
                        <tr key={faculty._id} className="border-bottom border-secondary border-opacity-10">
                          <td className="text-secondary py-3 px-2 small">{index + 1}</td>
                          <td className="py-3">
                            <div className="fw-bold text-white small">{faculty.name}</div>
                            <div className="x-small text-info opacity-75">
                              Assigned: {faculty.assignedEvents?.length || 0} Events
                            </div>
                          </td>
                          <td className="text-light py-3 small">
                            <i className="bi bi-telephone me-2 x-small text-info opacity-50"></i>
                            {faculty.number || "N/A"}
                          </td>
                          <td className="text-center py-3">
                            <div className="d-flex justify-content-center gap-1 gap-md-2">
                              <button
                                className="btn btn-outline-warning btn-sm border-0 p-2"
                                onClick={() => startEdit(faculty)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil-square fs-5"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm border-0 p-2"
                                onClick={() => handleDelete(faculty._id)}
                                title="Delete"
                              >
                                <i className="bi bi-trash3 fs-5"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="text-center py-5 text-light opacity-50 small">
                            No faculty judges registered yet.
                          </td>
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
        /* Desktop Sidebar Offset */
        @media (min-width: 992px) {
          .dashboard-content { margin-left: 280px; }
          .sticky-custom { position: sticky; top: 2rem; z-index: 10; }
        }

        /* Mobile Adjustments */
        @media (max-width: 991.98px) {
          .dashboard-content { margin-left: 0; padding-top: 10px; }
        }

        .bg-glass { 
          background: rgba(255, 255, 255, 0.03) !important; 
          backdrop-filter: blur(20px); 
          border-radius: 20px; 
        }

        .x-small { font-size: 0.7rem; }
        .ls-1 { letter-spacing: 1px; }
        .min-w-150 { min-width: 150px; }
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

export default FacultyPage;
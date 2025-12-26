import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

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
    <div className="d-flex bg-dark min-vh-100">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-4 p-lg-5">
        <ToastContainer theme="dark" position="top-right" autoClose={2000} />

        <header className="mb-5">
          <h2 className="fw-bold text-white mb-1">Judge Management</h2>
          <p className="text-light opacity-75">Register and manage faculty judges for events</p>
        </header>

        <div className="row g-4">
          {/* Form Section */}
          <div className="col-lg-4">
            <div className="card bg-glass border-secondary shadow-lg sticky-lg-top" style={{ top: '2rem' }}>
              <div className="card-body p-4">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                  <i className={`bi ${isEditing ? 'bi-pencil-square text-warning' : 'bi-person-plus text-info'}`}></i>
                  {isEditing ? 'Edit Judge' : 'Register New Judge'}
                </h5>

                <form onSubmit={isEditing ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit}>
                  <div className="mb-3">
                    <label className="text-info small fw-bold mb-2 d-block">FULL NAME</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary shadow-none"
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-info small fw-bold mb-2 d-block">PHONE NUMBER</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary shadow-none"
                      value={formData.number}
                      onChange={e => handleChange('number', e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-info small fw-bold mb-2 d-block">
                      {isEditing ? 'NEW PASSWORD (OPTIONAL)' : 'ACCESS PASSWORD'}
                    </label>
                    <input
                      type="password"
                      className="form-control bg-dark text-white border-secondary shadow-none"
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      placeholder={isEditing ? 'Leave blank to keep current' : '••••••••'}
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
                        (isEditing ? 'UPDATE JUDGE' : 'ADD JUDGE')}
                    </button>
                    {isEditing && (
                      <button type="button" className="btn btn-outline-secondary fw-bold" onClick={resetForm}>
                        CANCEL
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* List Section */}
          {/* List Section */}
          <div className="col-lg-8">
            <div className="card bg-glass border-secondary shadow-lg">
              <div className="card-body p-4">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-person-lines-fill text-info"></i>
                  Active Faculty Directory
                </h5>

                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle border-secondary mb-0">
                    <thead>
                      <tr className="text-white small text-uppercase opacity-75">
                        <th className="border-secondary py-3">#</th>
                        <th className="border-secondary py-3">Judge Name</th>
                        <th className="border-secondary py-3">Contact</th>
                        <th className="border-secondary py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultyList.length > 0 ? facultyList.map((faculty, index) => (
                        <tr key={faculty._id} className="border-secondary">
                          <td className="text-secondary py-3">{index + 1}</td>
                          <td className="py-3">
                            <div className="fw-bold text-white">{faculty.name}</div>
                            <div className="x-small text-info">
                              Assigned: {faculty.assignedEvents?.length || 0} Events
                            </div>
                          </td>
                          {/* CHECK THIS COLUMN */}
                          <td className="text-light opacity-75 py-3">
                            <i className="bi bi-telephone me-2 small text-info"></i>
                            {faculty.number || "Not Available"}
                          </td>
                          <td className="text-center py-3">
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-outline-warning btn-sm border-0"
                                onClick={() => startEdit(faculty)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil-square fs-5"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm border-0"
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
                          <td colSpan="4" className="text-center py-5 text-light opacity-50">
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
        .dashboard-content { margin-left: 260px; }
        .bg-glass { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(12px); border-radius: 18px; }
        .x-small { font-size: 0.7rem; }
        @media (max-width: 991.98px) { .dashboard-content { margin-left: 0; padding-top: 80px; } }
      `}</style>
    </div>
  );
};

export default FacultyPage;
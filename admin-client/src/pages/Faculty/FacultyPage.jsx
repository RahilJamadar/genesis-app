import React, { useEffect, useState } from 'react';
import axios from 'axios';
import getApiBase from '../../utils/getApiBase';
import Navbar from '../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FacultyPage() {
  const [facultyList, setFacultyList] = useState([]);
  const [formData, setFormData] = useState({ name: '', number: '', password: '' });
  const [isEditing, setIsEditing] = useState(null);

  const baseURL = getApiBase();

  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/admin/faculty`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          withCredentials: true
        });
        setFacultyList(res.data);
      } catch {
        toast.error('Failed to load faculty list');
      }
    };

    loadFaculty();
  }, [baseURL]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${baseURL}/api/admin/faculty`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      toast.success('Faculty added');
      resetForm();
      await refreshFaculty();
    } catch {
      toast.error('Failed to add faculty');
    }
  };

  const startEdit = (faculty) => {
    setIsEditing(faculty._id);
    setFormData({
      name: faculty.name ?? '',
      number: faculty.number ?? '',
      password: ''
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${baseURL}/api/admin/faculty/${isEditing}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      toast.success('Faculty updated');
      setIsEditing(null);
      resetForm();
      await refreshFaculty();
    } catch {
      toast.error('Failed to update faculty');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseURL}/api/admin/faculty/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      toast.success('Faculty deleted');
      await refreshFaculty();
    } catch {
      toast.error('Failed to delete faculty');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', number: '', password: '' });
  };

  const refreshFaculty = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/admin/faculty`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      setFacultyList(res.data);
    } catch {
      toast.error('Failed to refresh faculty list');
    }
  };

  // JSX remains unchanged — your layout and table structure are already clean and compact
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="faculty-page">
        <h2 className="text-center mt-5">👨‍🏫 Faculty Management</h2>

        <form
          onSubmit={handleSubmit}
          className="d-flex flex-column align-items-center bg-dark text-light p-4 rounded shadow-sm"
          style={{ backgroundColor: '#0D0D15', maxWidth: '480px', margin: '0 auto' }}
        >
          <div className="mb-3 w-100">
            <label className="form-label text-light">Name</label>
            <input
              type="text"
              className="form-control bg-secondary text-light border-0"
              style={{ maxWidth: '300px', margin: '0 auto' }}
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="mb-3 w-100">
            <label className="form-label text-light">Number</label>
            <input
              type="text"
              className="form-control bg-secondary text-light border-0"
              style={{ maxWidth: '300px', margin: '0 auto' }}
              value={formData.number}
              onChange={e => handleChange('number', e.target.value)}
              required
            />
          </div>

          <div className="mb-4 w-100">
            <label className="form-label text-light">
              {isEditing ? 'New Password (optional)' : 'Password'}
            </label>
            <input
              type="password"
              className="form-control bg-secondary text-light border-0"
              style={{ maxWidth: '300px', margin: '0 auto' }}
              value={formData.password}
              onChange={e => handleChange('password', e.target.value)}
              placeholder={isEditing ? 'Leave blank to keep existing' : ''}
              required={!isEditing}
            />
          </div>

          {isEditing ? (
            <button type="button" className="btn btn-outline-info w-100" onClick={handleUpdate}>
              💾 Update Faculty
            </button>
          ) : (
            <button type="submit" className="btn btn-primary w-100">
              ➕ Add Faculty
            </button>
          )}
        </form>

        <div
          className="p-4 rounded shadow-sm mt-5"
          style={{
            backgroundColor: '#0D0D15',
            color: '#e0e6f0',
            border: '1px solid #2b2f3a',
            maxWidth: '960px',
            margin: '0 auto',
          }}
        >
          <h4 className="mb-4 text-center text-info fw-semibold">Faculty List</h4>

          <div className="table-responsive">
            <table className="table table-dark table-bordered align-middle">
              <thead className="table-secondary text-dark">>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Number</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {facultyList.map((faculty, index) => (
                  <tr key={faculty._id} style={{ borderBottom: '1px solid #2b2f3a' }}>
                    <td>{index + 1}</td>
                    <td className="fw-semibold text-info">{faculty.name}</td>
                    <td className="text-white">{faculty.number}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => startEdit(faculty)}
                        >
                          <i className="bi bi-pencil-square me-1"></i>Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(faculty._id)}
                        >
                          <i className="bi bi-trash me-1"></i>Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default FacultyPage;
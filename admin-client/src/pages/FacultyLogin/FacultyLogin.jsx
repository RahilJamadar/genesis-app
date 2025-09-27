import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import facultyAPI from '../../api/facultyApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FacultyLogin = () => {
  const [form, setForm] = useState({ name: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await facultyAPI.post('/login', form);
      localStorage.setItem('facultyToken', res.data.token);
      toast.success('✅ Login successful');
      setTimeout(() => navigate('/faculty/dashboard'), 1500);
    } catch {
      toast.error('❌ Invalid credentials');
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center" style={{ backgroundColor: '#0D0D15', minHeight: '100vh' }}>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <div className="card bg-dark text-light p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%', border: '1px solid #2b2f3a' }}>
        <h2 className="text-center text-info fw-bold mb-4">Faculty Login</h2>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label text-light">Name</label>
            <input
              name="name"
              type="text"
              className="form-control bg-secondary text-light border-0"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="form-label text-light">Password</label>
            <input
              name="password"
              type="password"
              className="form-control bg-secondary text-light border-0"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-info fw-semibold w-100">
            Login
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-light mb-2">Are you an admin?</p>
          <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/login')}>
            Go to Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;
import React, { useState } from 'react';
import axios from 'axios';
import getApiBase from '../../utils/getApiBase';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const baseURL = getApiBase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${baseURL}/api/admin/auth/login`, { name, password }, {
        withCredentials: true
      });

      const token = res.data.token;
      if (token) {
        localStorage.setItem('adminToken', token);
        toast.success('✅ Login successful');
        setTimeout(() => navigate('/admin/dashboard'), 1500);
      } else {
        toast.error('❌ No token received');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(`❌ ${msg}`);
    }
  };

  const goToFacultyLogin = () => {
    navigate('/faculty/login');
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center" style={{ backgroundColor: '#0D0D15', minHeight: '100vh' }}>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <div className="card bg-dark text-light p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%', border: '1px solid #2b2f3a' }}>
        <h2 className="text-center text-info fw-bold mb-4">Genesis Admin Login</h2>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <input
            type="text"
            className="form-control bg-secondary text-light border-0"
            placeholder="Username"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-control bg-secondary text-light border-0"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-info fw-semibold w-100">
            Login 🔐
          </button>
        </form>

        <div className="text-center my-3">
          <span className="text-light fw-semibold">or</span>
        </div>

        <button className="btn btn-outline-light w-100 fw-semibold" onClick={goToFacultyLogin}>
          Faculty Login
        </button>
      </div>
    </div>
  );
}

export default Login;
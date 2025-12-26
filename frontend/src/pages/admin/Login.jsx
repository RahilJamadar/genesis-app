import React, { useState } from 'react';
import axios from 'axios';
import getApiBase from '../../utils/getApiBase';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const baseURL = getApiBase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${baseURL}/api/admin/auth/login`, { name, password });
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        toast.success('🚀 Welcome back, Admin!');
        
        // Success redirect
        setTimeout(() => navigate('/admin/dashboard'), 1000);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed.';
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <ToastContainer theme="dark" position="top-right" autoClose={2000} hideProgressBar />
      
      <div className="login-container animate-fade-in">
        <div className="login-card shadow-lg">
          <div className="text-center mb-3">
            <div className="brand-icon-circle mb-2">
              <i className="bi bi-shield-lock-fill text-info fs-3"></i>
            </div>
            <h3 className="fw-bold text-white mb-0">Genesis Admin</h3>
            <p className="text-secondary small">Management Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div className="form-group">
              <label className="text-info x-small mb-1 ms-1 fw-bold">USERNAME</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary shadow-none"
                  placeholder="Admin name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="text-info x-small mb-1 ms-1 fw-bold">PASSWORD</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control bg-dark text-white border-secondary shadow-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-info btn-sm fw-bold py-2 mt-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <>LOGIN <i className="bi bi-arrow-right-short fs-5"></i></>
              )}
            </button>
          </form>

          <div className="divider my-3">
            <span className="text-secondary px-2 x-small">SECURE SYSTEM</span>
          </div>

          <button 
            className="btn btn-outline-warning btn-sm w-100 fw-bold py-2 transition-all d-flex align-items-center justify-content-center gap-2" 
            onClick={() => navigate('/faculty/login')}
          >
            <i className="bi bi-mortarboard-fill"></i>JUDGE PORTAL
          </button>
        </div>
      </div>

      <style>{`
        .login-wrapper {
          background: radial-gradient(circle at top right, #1a1a2e, #0D0D15);
          height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; margin: 0; padding: 20px; overflow: hidden;
        }
        .login-card {
          background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 2rem; width: 100%; max-width: 400px;
        }
        .brand-icon-circle {
          width: 50px; height: 50px; background: rgba(13, 202, 240, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;
        }
        .x-small { font-size: 0.7rem; letter-spacing: 0.5px; }
        .divider { display: flex; align-items: center; text-align: center; }
        .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .btn-outline-warning:hover { color: #000 !important; }
      `}</style>
    </div>
  );
};

export default Login;
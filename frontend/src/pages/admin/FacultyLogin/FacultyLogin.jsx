import React, { useState } from 'react';
import axios from 'axios';
import getApiBase from '../../../utils/getApiBase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const FacultyLogin = () => {
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const baseURL = getApiBase(); // Should return e.g., "http://localhost:5000/api"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /**
       * PATH SYNC: 
       * If baseURL is ".../api", this results in ".../api/faculty/auth/login"
       * We remove the redundant '/api' from the string if your baseURL already includes it.
       */
      const res = await axios.post(`${baseURL}/api/faculty/auth/login`, 
        { number, password },
        { withCredentials: true } 
      );

      const { token, user } = res.data;

      if (token) {
        localStorage.setItem('facultyToken', token);
        localStorage.setItem('facultyId', user.id);
        localStorage.setItem('facultyUser', JSON.stringify(user));
        
        toast.success(`👨‍⚖️ Welcome, ${user.name}`);
        
        // ADDED LEADING SLASH: Ensures it navigates from root, not relative to current path
        setTimeout(() => navigate('/faculty/dashboard'), 1000);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Detailed log to help you see exactly what URL is failing
        console.error("404 Error at:", `${baseURL}/faculty/auth/login`);
        toast.error("❌ Login endpoint not found. Ensure backend server is running.");
      } else {
        const msg = err.response?.data?.error || 'Login failed. Check your credentials.';
        toast.error(`❌ ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faculty-login-wrapper">
      
      <div className="login-container animate-fade-in">
        <div className="login-card shadow-lg text-center">
          <div className="brand-icon-circle mb-3">
            <i className="bi bi-mortarboard-fill text-warning fs-3"></i>
          </div>
          <h3 className="fw-bold text-white mb-0">Genesis Judge</h3>
          <p className="text-secondary small">Faculty Evaluation Portal</p>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 mt-4 text-start">
            <div className="form-group">
              <label className="text-info x-small mb-1 ms-1 fw-bold">PHONE NUMBER</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-telephone"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary shadow-none"
                  placeholder="Registered number"
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="text-info x-small mb-1 ms-1 fw-bold">ACCESS PASSWORD</label>
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
              className="btn btn-warning btn-sm fw-bold py-2 mt-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <>ENTER PORTAL <i className="bi bi-chevron-right fs-6"></i></>
              )}
            </button>
          </form>

          <div className="divider my-3">
            <span className="text-secondary px-2 x-small">SECURE ACCESS</span>
          </div>

          <button 
            className="btn btn-link btn-sm text-secondary text-decoration-none opacity-50 hover-opacity-100" 
            onClick={() => navigate('/admin/login')}
          >
            <i className="bi bi-arrow-left me-2"></i>Back to Admin Login
          </button>
        </div>
      </div>

      <style>{`
        .faculty-login-wrapper {
          background: radial-gradient(circle at bottom left, #1a1a2e, #0D0D15);
          height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; margin: 0; padding: 20px; overflow: hidden;
        }
        .login-card {
          background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 2.5rem 2rem; width: 100%; max-width: 400px;
        }
        .brand-icon-circle {
          width: 55px; height: 55px; background: rgba(255, 193, 7, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;
        }
        .btn-warning { background-color: #ffc107; border: none; color: #000; transition: 0.3s; }
        .btn-warning:hover { background-color: #e0a800; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255, 193, 7, 0.3); }
        .x-small { font-size: 0.7rem; letter-spacing: 0.5px; }
        .divider { display: flex; align-items: center; text-align: center; }
        .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default FacultyLogin;
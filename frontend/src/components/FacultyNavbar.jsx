import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const FacultyNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('facultyToken');
    localStorage.removeItem('facultyUser');
    toast.info('👋 Logged out successfully');
    setTimeout(() => navigate('/faculty/login'), 1000);
  };

  // Helper to check active route
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-lg border-bottom border-secondary px-lg-5 py-3">
        <div className="container-fluid">
          {/* Brand - Genesis Blue Theme */}
          <div
            className="navbar-brand fw-bold d-flex align-items-center gap-2 text-info fs-3"
            onClick={() => navigate('/faculty/dashboard')}
            style={{ cursor: 'pointer', letterSpacing: '1px' }}
          >
            <i className="bi bi-mortarboard-fill"></i>
            <span className="text-white">GENESIS</span>
            <span className="badge bg-info text-dark fs-6 ms-2">JUDGE</span>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="navbar-toggler border-0 shadow-none" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#facultyNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Nav Links */}
          <div className="collapse navbar-collapse" id="facultyNavbar">
            <ul className="navbar-nav ms-lg-5 me-auto mb-2 mb-lg-0 gap-lg-3">
              <li className="nav-item">
                <span
                  className={`nav-link fw-semibold ${isActive('/admin/faculty/dashboard') ? 'active text-info' : 'text-light-50'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/faculty/dashboard')}
                >
                  <i className="bi bi-speedometer2 me-2"></i>Dashboard
                </span>
              </li>
              {/* Future-proofing: Add Schedule or Leaderboard for judges if needed */}
            </ul>

            {/* Profile & Logout */}
            <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
              <span className="text-secondary d-none d-xl-inline small">
                {JSON.parse(localStorage.getItem('facultyUser'))?.name || 'Judge'}
              </span>
              <button
                className="btn btn-outline-info rounded-pill px-4 fw-bold transition-all shadow-sm"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Custom Styles for Professional Look */}
      <style>{`
        .navbar {
          backdrop-filter: blur(10px);
          background-color: rgba(33, 37, 41, 0.95) !important;
        }
        .nav-link {
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
        }
        .nav-link:hover {
          color: #0dcaf0 !important;
        }
        .nav-link.active {
          border-bottom: 2px solid #0dcaf0;
        }
        .btn-outline-info:hover {
          background-color: #0dcaf0;
          color: #000;
          transform: translateY(-2px);
        }
      `}</style>
    </>
  );
};

export default FacultyNavbar;
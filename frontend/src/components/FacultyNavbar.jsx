import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const FacultyNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State to manage mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('facultyToken');
    localStorage.removeItem('facultyUser');
    toast.info('👋 Logged out successfully');
    setTimeout(() => navigate('/faculty/login'), 1000);
  };

  // Helper to check active route
  const isActive = (path) => location.pathname === path;

  // Helper to handle navigation and close menu on mobile
  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false); // Closes the hamburger after clicking a link
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-lg border-bottom border-secondary px-lg-5 py-2">
        <div className="container-fluid">
          {/* Brand - Genesis Blue Theme */}
          <div
            className="navbar-brand fw-bold d-flex align-items-center gap-2 text-info fs-3"
            onClick={() => handleNavClick('/faculty/dashboard')}
            style={{ cursor: 'pointer', letterSpacing: '1px' }}
          >
            <i className="bi bi-mortarboard-fill"></i>
            <span className="text-white d-none d-sm-inline">GENESIS</span>
            <span className="badge bg-info text-dark fs-7 ms-1 ms-md-2">JUDGE</span>
          </div>

          {/* Mobile Toggle Button */}
          <button 
            className={`navbar-toggler border-0 shadow-none ${!isMenuOpen ? 'collapsed' : ''}`} 
            type="button" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-controls="facultyNavbar" 
            aria-expanded={isMenuOpen} 
            aria-label="Toggle navigation"
          >
            {/* Smooth transition between Hamburger and X */}
            <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-2 text-info`}></i>
          </button>

          {/* Nav Links - Collapsible Area */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="facultyNavbar">
            <ul className="navbar-nav ms-lg-5 me-auto mb-2 mb-lg-0 gap-lg-3 mt-3 mt-lg-0">
              <li className="nav-item">
                <span
                  className={`nav-link fw-semibold d-flex align-items-center ${isActive('/faculty/dashboard') ? 'active text-info' : 'text-light-50'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNavClick('/faculty/dashboard')}
                >
                  <i className="bi bi-speedometer2 me-2"></i>Dashboard
                </span>
              </li>
              {/* Add more judge-specific links here if needed */}
            </ul>

            {/* Profile & Logout */}
            <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 mt-2 mt-lg-0 pb-3 pb-lg-0">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-secondary bg-opacity-25 rounded-circle p-2 d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px'}}>
                   <i className="bi bi-person-fill text-info"></i>
                </div>
                <span className="text-secondary small fw-bold">
                    {JSON.parse(localStorage.getItem('facultyUser'))?.name || 'Judge'}
                </span>
              </div>
              
              <button
                className="btn btn-outline-danger rounded-pill px-4 fw-bold transition-all shadow-sm btn-sm"
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
          backdrop-filter: blur(15px);
          background-color: rgba(15, 15, 15, 0.98) !important;
        }
        
        .nav-link {
          transition: all 0.3s ease;
          padding: 0.8rem 1rem !important;
          border-radius: 8px;
        }

        @media (min-width: 992px) {
          .nav-link {
            border-bottom: 2px solid transparent;
            border-radius: 0;
            padding: 0.5rem 0 !important;
          }
          .nav-link:hover {
            color: #0dcaf0 !important;
          }
          .nav-link.active {
            color: #0dcaf0 !important;
            border-bottom: 2px solid #0dcaf0;
          }
        }

        @media (max-width: 991.98px) {
          .navbar-collapse {
            background: rgba(0, 0, 0, 0.2);
            margin-top: 10px;
            padding: 10px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
          .nav-link.active {
            background: rgba(13, 202, 240, 0.1);
            color: #0dcaf0 !important;
          }
        }

        .btn-outline-info:hover {
          background-color: #0dcaf0;
          color: #000;
          transform: translateY(-2px);
        }

        .fs-7 { font-size: 0.8rem; }
      `}</style>
    </>
  );
};

export default FacultyNavbar;
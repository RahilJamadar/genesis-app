import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.error('🔒 Security Session Ended');
    setTimeout(() => navigate('/admin/login'), 1000);
  };

  const navLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'bi-grid-1x2-fill' },
    { label: 'Teams', path: '/admin/teams', icon: 'bi-people-fill' },
    { label: 'Events', path: '/admin/events', icon: 'bi-trophy-fill' },
    { label: 'Schedule', path: '/admin/schedule', icon: 'bi-calendar3' },
    { label: 'Participation', path: '/admin/events/participants', icon: 'bi-person-check-fill' },
    { label: 'Scoring', path: '/admin/scoring', icon: 'bi-calculator-fill' },
    { label: 'Leaderboard', path: '/admin/leaderboard', icon: 'bi-bar-chart-line-fill' },
    { label: 'Faculty', path: '/admin/faculty', icon: 'bi-person-badge' },
    { label: 'Coordinators', path: '/admin/student-coordinators', icon: 'bi-mortarboard' },
    { label: 'Admin Settings', path: '/admin/admin-manage', icon: 'bi-gear-fill' },
  ];

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar theme="dark" />
      
      {/* MOBILE TOP BAR - The only thing visible on mobile by default */}
      <div className="d-lg-none bg-dark text-white p-3 d-flex justify-content-between align-items-center sticky-top shadow-lg" style={{ zIndex: 1100, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary rounded-2 p-1">
            <i className="bi bi-shield-lock-fill text-white"></i>
          </div>
          <span className="fw-bold tracking-tighter fs-5">GENESIS</span>
        </div>
        <button className="btn btn-outline-primary border-2 px-2 py-1" onClick={() => setIsOpen(true)}>
          <i className="bi bi-list fs-3"></i>
        </button>
      </div>

      {/* SIDEBAR NAVIGATION - Drawer style for mobile */}
      <div className={`genesis-sidebar bg-dark border-end border-secondary ${isOpen ? 'show' : ''}`}>
        <div className="sidebar-header p-4 d-flex justify-content-between align-items-center">
          <div>
            <h4 className="text-primary fw-bold mb-0">Genesis <span className="text-white fs-6">v2.0</span></h4>
            <p className="text-secondary small mb-0">Command Center</p>
          </div>
          {/* Close button only visible inside the mobile drawer */}
          <button className="btn btn-link text-white d-lg-none p-0" onClick={() => setIsOpen(false)}>
            <i className="bi bi-x-lg fs-4"></i>
          </button>
        </div>

        <div className="sidebar-links px-3 flex-grow-1 overflow-auto">
          {navLinks.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-link-custom ${isActive ? 'active-link' : ''}`}
              onClick={() => setIsOpen(false)} // Auto-close drawer on selection
            >
              <i className={`bi ${icon} me-3`}></i>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer p-3 border-top border-secondary bg-black bg-opacity-25">
          <button className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold shadow-sm" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i>
            <span>Logout Session</span>
          </button>
        </div>
      </div>

      {/* BLUR OVERLAY - Only on mobile when drawer is active */}
      {isOpen && <div className="sidebar-overlay d-lg-none" onClick={() => setIsOpen(false)}></div>}

      <style>{`
        .genesis-sidebar {
          width: 280px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          z-index: 2000;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background-color: #0f0f0f !important;
        }

        .nav-link-custom {
          display: flex;
          align-items: center;
          padding: 14px 18px;
          color: #9ca3af;
          text-decoration: none;
          border-radius: 12px;
          margin-bottom: 6px;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .nav-link-custom:hover {
          background: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
          padding-left: 22px;
        }

        .active-link {
          background: #0d6efd !important;
          color: white !important;
          box-shadow: 0 8px 20px rgba(13, 110, 253, 0.3);
        }

        /* Mobile View - Hidden by default */
        @media (max-width: 991.98px) {
          .genesis-sidebar {
            transform: translateX(-100%);
          }
          .genesis-sidebar.show {
            transform: translateX(0);
            box-shadow: 15px 0 50px rgba(0,0,0,0.8);
          }
        }

        /* Desktop View - Always visible and fixed */
        @media (min-width: 992px) {
          .genesis-sidebar {
            transform: translateX(0) !important;
            position: fixed;
          }
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(5px);
          z-index: 1500;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Prevent background scroll when sidebar is open on mobile */
        ${isOpen ? 'body { overflow: hidden; }' : ''}
      `}</style>
    </>
  );
};

export default Navbar;
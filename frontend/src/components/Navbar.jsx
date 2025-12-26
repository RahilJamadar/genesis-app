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
      
      {/* MOBILE TOP BAR */}
      <div className="d-lg-none bg-dark text-white p-3 d-flex justify-content-between align-items-center sticky-top shadow">
        <span className="fw-bold text-primary">GENESIS ADMIN</span>
        <button className="btn btn-outline-primary border-0" onClick={() => setIsOpen(!isOpen)}>
          <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-list'} fs-3`}></i>
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <div className={`genesis-sidebar bg-dark border-end border-secondary ${isOpen ? 'show' : ''}`}>
        <div className="sidebar-header p-4 d-none d-lg-block">
          <h4 className="text-primary fw-bold mb-0">Genesis <span className="text-white fs-6">v2.0</span></h4>
          <p className="text-secondary small mb-0">Event Management System</p>
        </div>

        <div className="sidebar-links px-3">
          {navLinks.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-link-custom ${isActive ? 'active-link' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <i className={`bi ${icon} me-3`}></i>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer p-3 mt-auto">
          <button className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* OVERLAY FOR MOBILE */}
      {isOpen && <div className="sidebar-overlay d-lg-none" onClick={() => setIsOpen(false)}></div>}

      <style>{`
        .genesis-sidebar {
          width: 260px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          z-index: 1050;
          transition: transform 0.3s ease-in-out;
        }

        .nav-link-custom {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          color: #adb5bd;
          text-decoration: none;
          border-radius: 8px;
          margin-bottom: 5px;
          transition: 0.2s;
        }

        .nav-link-custom:hover {
          background: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
        }

        .active-link {
          background: #0d6efd !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
        }

        @media (max-width: 991.98px) {
          .genesis-sidebar {
            transform: translateX(-100%);
          }
          .genesis-sidebar.show {
            transform: translateX(0);
          }
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.5);
          z-index: 1040;
        }
      `}</style>
    </>
  );
};

export default Navbar;
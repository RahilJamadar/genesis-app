import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.info('👋 Logged out successfully');
    setTimeout(() => navigate('/admin/login'), 1500);
  };

  useEffect(() => {
    const hamburger = document.querySelector('.hamburger');
    const navCollapse = document.querySelector('.navbar-collapse');

    const toggleMenu = () => {
      navCollapse.classList.toggle('show');
    };

    hamburger.addEventListener('click', toggleMenu);
    return () => hamburger.removeEventListener('click', toggleMenu);
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm border-bottom px-4 py-3">
        <div className="container-fluid">
          <Link className="navbar-brand text-primary fw-bold fs-4" to="/dashboard">
            Genesis Admin
          </Link>
          <button className="navbar-toggler hamburger" type="button">
            ☰
          </button>

          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              {[
                { label: 'Dashboard', path: '/admin/dashboard' },
                { label: 'Teams', path: '/admin/teams' },
                { label: 'Events', path: '/admin/events' },
                { label: 'Schedule', path: '/admin/schedule' },
                { label: 'Participation', path: '/admin/events/participants' },
                { label: 'Scoring', path: '/admin/scoring' },
                { label: 'Leaderboard', path: '/admin/leaderboard' },
                { label: 'Faculty', path: '/admin/faculty' },
                { label: 'Student Coordinators', path: '/admin/student-coordinators' },
                { label: 'Admin Settings', path: '/admin/admin-manage' }
              ].map(({ label, path }) => (
                <li className="nav-item" key={path}>
                  <Link className="nav-link text-light" to={path}>
                    {label}
                  </Link>
                </li>
              ))}
              <li className="nav-item">
                <button className="btn btn-sm text-danger fw-semibold ms-lg-3" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FacultyNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('facultyToken');
    toast.info('👋 Logged out successfully');
    setTimeout(() => navigate('/admin/faculty/login'), 1500);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm border-bottom px-4 py-3">
        <div
          className="navbar-brand fw-bold text-primary fs-4"
          onClick={() => navigate('/faculty/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          🎓 Genesis Faculty
        </div>

        <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex flex-row gap-4">
          <li
            className="nav-item fw-semibold text-light"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/faculty/dashboard')}
          >
            Dashboard
          </li>
        </ul>

        <div className="d-flex">
          <button
            className="btn btn-primary fw-semibold"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>
    </>
  );
};

export default FacultyNavbar;
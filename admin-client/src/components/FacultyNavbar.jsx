import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FacultyNavbar.css';

const FacultyNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('facultyToken');
    navigate('/faculty/login');
  };

  return (
    <nav className="faculty-navbar">
      <div className="faculty-brand" onClick={() => navigate('/faculty/dashboard')}>
        🎓 Genesis Faculty
      </div>

      <ul className="faculty-links">
        <li onClick={() => navigate('/faculty/dashboard')}>Dashboard</li>
      </ul>

      <div className="faculty-actions">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default FacultyNavbar;
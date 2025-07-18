import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <nav className="admin-navbar">
      <h1 className="logo">Genesis Admin</h1>
      <ul className="nav-links">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/teams">Teams</Link></li>
        <li><Link to="/events">Events</Link></li>
        <li><Link to="/schedule">Schedule</Link></li>

        <li><Link to="/events/participants">Participation</Link></li>
        <li><Link to="/scoring">Scoring</Link></li>
        <li><Link to="/faculty">Faculty</Link></li>
        <li><Link to="/student-coordinators">Student Coordinators</Link></li>
        <li><Link to="/admin-manage">Admin Settings</Link></li>
        <li>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
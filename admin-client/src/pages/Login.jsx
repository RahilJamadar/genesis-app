import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [name, setname] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/admin/auth/login', {
        name,
        password
      });

      const token = res.data.token;
      if (token) {
        localStorage.setItem('adminToken', token);
        navigate('/dashboard');
      } else {
        alert('No token received');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      alert('Login failed');
    }
  };

  const goToFacultyLogin = () => {
    navigate('/faculty/login');
  };

  return (
    <div className="login-container">
      <h2>Genesis Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={name}
          onChange={e => setname(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login 🔐</button>
      </form>

      <div className="login-divider">
        <span>or</span>
      </div>

      <button className="faculty-login-button" onClick={goToFacultyLogin}>
        Faculty Login
      </button>
    </div>
  );
}

export default Login;
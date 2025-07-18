import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Optional styling

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
        // console.log('✅ Token saved:', token);
        navigate('/dashboard');
      } else {
        alert('No token received');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      alert('Login failed');
    }
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
    </div>
  );
}

export default Login;
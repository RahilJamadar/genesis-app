import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div style={{ backgroundColor: '#0D0D15', minHeight: '100vh', color: '#e0e6f0' }}>
      <App />
    </div>
  </React.StrictMode>
);


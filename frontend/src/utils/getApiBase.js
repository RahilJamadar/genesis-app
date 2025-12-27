const getApiBase = () => {
  // If the frontend is running on localhost, use the local backend
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  // Otherwise, use the deployed Render backend
  return 'https://genesis-app-spga.onrender.com';
};

export default getApiBase;
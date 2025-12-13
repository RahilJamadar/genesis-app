const getApiBase = () => {
  const hostname = window.location.hostname;

  if (hostname === 'localhost') {
    return 'http://localhost:5000';
  }

  // Assume LAN IP or phone access
  return `http://${hostname}:5000`;
};

export default getApiBase;

const getApiBase = () => {
  const hostname = window.location.hostname;

  if (hostname === 'localhost') {
    return 'http://localhost:5001';
  }

  // Assume LAN IP or phone access
  return `http://${hostname}:5001`;
};

export default getApiBase;
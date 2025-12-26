const getApiBase = () => {
  const hostname = window.location.hostname;

  if (hostname === 'localhost') {
    return 'https://genesis-app-spga.onrender.com';
  }

  // Assume LAN IP or phone access
  return `https://genesis-app-spga.onrender.com`;
};

export default getApiBase;

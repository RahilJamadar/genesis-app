const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.warn('🚫 No token provided');
    return res.status(403).json({ error: 'Access denied: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role || 'admin' };
    next();
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    res.status(401).json({ error: 'Access denied: Invalid token' });
  }
};

module.exports = verifyAdmin;
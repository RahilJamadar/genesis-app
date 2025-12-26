const jwt = require('jsonwebtoken');

/**
 * Middleware: verifyFaculty
 * Ensures the request is from a legitimate judge and prevents 
 * administrative or unauthorized access to scoring logic.
 */
const verifyFaculty = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check for presence of Bearer Token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ 
      error: 'Authentication Required: No judge token provided.' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify JWT integrity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /**
     * 3. Genesis Role Enforcement
     * We strictly check for 'faculty'. Even an Admin token will be 
     * rejected here to prevent accidental cross-role data corruption.
     */
    if (decoded.role !== 'faculty') {
      return res.status(403).json({ 
        error: 'Access Denied: You do not have Judge permissions.' 
      });
    }

    // 4. Attach decoded payload to request
    // Decoded usually contains { id, role, name }
    req.user = decoded;
    
    next();
  } catch (err) {
    // 5. Handle specific JWT errors for clearer frontend feedback
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Session Expired: Please log in again to continue scoring.' 
      });
    }

    console.error('Faculty Auth Error:', err.message);
    res.status(401).json({ error: 'Invalid or malformed session.' });
  }
};

module.exports = verifyFaculty;
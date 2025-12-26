const jwt = require('jsonwebtoken');

/**
 * Middleware to verify that the incoming request is from a logged-in Admin.
 * Prevents Faculty or Student Coordinators from accessing administrative routes.
 */
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check if the Authorization header exists and follows the 'Bearer <token>' format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('🚫 Access Attempt Blocked: No valid token format provided.');
    return res.status(403).json({ 
      error: 'Access denied: Please provide a valid Bearer token.' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Role-Based Access Control (RBAC)
    // Even if the token is valid, we must ensure the user has 'admin' privileges.
    if (decoded.role !== 'admin' && decoded.role !== 'super-admin') {
      console.warn(`⚠️ Security Alert: User ${decoded.id} with role "${decoded.role}" tried to access Admin resources.`);
      return res.status(403).json({ 
        error: 'Access denied: You do not have administrative privileges.' 
      });
    }

    // 4. Attach user info to the request object for use in subsequent routes
    req.user = { 
      id: decoded.id, 
      role: decoded.role 
    };

    next();
  } catch (err) {
    // 5. Specific handling for different JWT errors
    if (err.name === 'TokenExpiredError') {
      console.error('❌ Session Expired:', err.message);
      return res.status(401).json({ 
        error: 'Session expired. Please log in again to continue.' 
      });
    }

    console.error('❌ JWT Verification Failed:', err.message);
    res.status(401).json({ 
      error: 'Access denied: Invalid or tampered token.' 
    });
  }
};

module.exports = verifyAdmin;
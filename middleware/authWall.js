import Admin from "../models/admin.js";
import { verifyToken } from "../utils/token.js";

export const requireSignIn = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    
    if (!header) {
      return res.status(400).json({ 
        message: "Authorization header is not present" 
      });
    }

    // Properly split bearer token
    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(400).json({ 
        message: "Invalid authorization header format. Use: Bearer <token>" 
      });
    }

    const token = parts[1];
    
    if (!token) {
      return res.status(400).json({ 
        message: "Token is not present" 
      });
    }

    // Verify token
    const userId = verifyToken(token);
    
    if (!userId) {
      return res.status(401).json({ 
        message: "Invalid or expired token" 
      });
    }

    // Find admin in database
    const admin = await Admin.findById(userId);
    
    if (!admin) {
      return res.status(404).json({ 
        message: "Admin not found" 
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({ 
        message: "Admin account is inactive" 
      });
    }

    // Attach admin to request
    req.user = admin;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ 
      message: error.message || "Authentication failed" 
    });
  }
};

// Verify Super Admin
export const verifySuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: "User not authenticated" 
      });
    }

    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Access denied. Super Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    res.status(403).json({ 
      message: error.message 
    });
  }
};

// Check specific permission
export const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: "User not authenticated" 
        });
      }

      if (!req.user.permissions || !req.user.permissions[permissionName]) {
        return res.status(403).json({
          message: `You don't have permission to perform: ${permissionName}`,
        });
      }

      next();
    } catch (error) {
      res.status(403).json({ 
        message: error.message 
      });
    }
  };
};
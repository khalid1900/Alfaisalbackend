// ========== controllers/admin.js ==========
import Admin from "../models/admin.js";
import { createJwtToken, verifyToken } from "../utils/token.js"; // ✅ ADD THIS IMPORT

// ========== CREATE ADMIN ==========
export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email, and password",
      });
    }

    if (role && !["admin", "superadmin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be 'admin' or 'superadmin'",
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    const newAdmin = new Admin({
      name,
      email,
      password,
      role: role || "admin",
    });

    await newAdmin.save();

    const adminData = newAdmin.toObject();
    delete adminData.password;

    return res.status(201).json({
      message: "Admin created successfully",
      data: adminData,
    });
  } catch (error) {
    next(error);
  }
};

// ========== ADMIN LOGIN ========== ✅ FIXED
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated" });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    admin.lastLogin = new Date();
    await admin.save();

    // ✅ USE createJwtToken HERE
    const token = createJwtToken(admin._id.toString());

    if (!token) {
      return res.status(500).json({ message: "Error generating token" });
    }

    const adminData = admin.toObject();
    delete adminData.password;

    return res.status(200).json({
      message: "Login successful",
      token,
      data: adminData,
    });
  } catch (error) {
    next(error);
  }
};

// ========== GET ADMIN PROFILE ==========
export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// ========== UPDATE ADMIN PROFILE ==========
export const updateAdminProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      const existingAdmin = await Admin.findOne({ email, _id: { $ne: req.user._id } });
      if (existingAdmin) {
        return res.status(400).json({ message: "Email already taken" });
      }
      updateData.email = email;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    next(error);
  }
};

// ========== CHANGE PASSWORD ==========
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Please provide current password, new password, and confirmation",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const admin = await Admin.findById(req.user._id).select("+password");

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    admin.password = newPassword;
    await admin.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ========== GET ALL ADMINS (Super Admin Only) ==========
export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

// ========== GET ADMIN BY ID (Super Admin Only) ==========
export const getAdminById = async (req, res, next) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// ========== UPDATE ADMIN ROLE (Super Admin Only) ==========
export const updateAdminRole = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { role } = req.body;

    if (!["admin", "superadmin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be 'admin' or 'superadmin'",
      });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { role, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      message: "Admin role updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    next(error);
  }
};

// ========== UPDATE ADMIN PERMISSIONS (Super Admin Only) ==========
export const updateAdminPermissions = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const permissions = req.body;

    const validPermissions = [
      "createEvent",
      "editEvent",
      "deleteEvent",
      "viewAllEvents",
      "approveEvent",
      "rejectEvent",
      "viewAttendees",
      "manageAdmins",
      "viewReports",
    ];

    for (const key in permissions) {
      if (!validPermissions.includes(key)) {
        return res.status(400).json({
          message: `Invalid permission: ${key}`,
        });
      }
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.permissions = { ...admin.permissions, ...permissions };
    admin.updatedAt = new Date();
    await admin.save();

    return res.status(200).json({
      message: "Admin permissions updated successfully",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// ========== DEACTIVATE ADMIN (Super Admin Only) ==========
export const deactivateAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.params;

    if (adminId === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot deactivate your own account",
      });
    }

    const deactivatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!deactivatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      message: "Admin account deactivated successfully",
      data: deactivatedAdmin,
    });
  } catch (error) {
    next(error);
  }
};

// ========== ACTIVATE ADMIN (Super Admin Only) ==========
export const activateAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.params;

    const activatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { isActive: true, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!activatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      message: "Admin account activated successfully",
      data: activatedAdmin,
    });
  } catch (error) {
    next(error);
  }
};

// ========== DELETE ADMIN (Super Admin Only) ==========
export const deleteAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.params;

    if (adminId === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      message: "Admin deleted successfully",
      data: deletedAdmin,
    });
  } catch (error) {
    next(error);
  }
};
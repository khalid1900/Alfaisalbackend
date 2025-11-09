import express from "express";
import {
  requireSignIn,
  verifySuperAdmin,
} from "../middleware/authWall.js";
import {
  adminLogin,
  createAdmin,
  getAdminProfile,

  changePassword,
  getAllAdmins,
  getAdminById,
  updateAdminRole,
  updateAdminPermissions,
  deactivateAdmin,
  activateAdmin,
  deleteAdmin,
  updateAdminById,
} from "../controllers/admin.js";

const router = express.Router();

// ========== PUBLIC ROUTES ==========
router.post("/login", adminLogin);
router.post("/create", createAdmin);

// ========== PRIVATE ROUTES (Authenticated) ==========
router.get("/profile", requireSignIn, getAdminProfile);
router.put("/:adminId", requireSignIn, updateAdminById);
router.put("/password", requireSignIn, changePassword);

// ========== SUPER ADMIN ROUTES ==========
router.get("/all", requireSignIn, verifySuperAdmin, getAllAdmins);
router.get("/:adminId", requireSignIn, verifySuperAdmin, getAdminById);
router.put("/:adminId/role", requireSignIn, verifySuperAdmin, updateAdminRole);
router.put("/:adminId/permissions", requireSignIn, verifySuperAdmin, updateAdminPermissions);
router.put("/:adminId/deactivate", requireSignIn, verifySuperAdmin, deactivateAdmin);
router.put("/:adminId/activate", requireSignIn, verifySuperAdmin, activateAdmin);
router.delete("/:adminId", requireSignIn, verifySuperAdmin, deleteAdmin);

export default router;
import express from "express";
import {
  requireSignIn,
  verifySuperAdmin,
  checkPermission,
} from "../middleware/authWall.js";
import {
  postEvent,
  viewEvent,
  deleteEvent,
  editEvent,
  getDraftedEvents,
  getNonDraftedEvents,
  getPublishedEvents,
  getPendingEvents,
  getAllEvents,
  approveEvent,
  rejectEvent,
  registerForEvent,
  getEventAttendees,
  updateAttendeeStatus,
  searchEvents,
  getEventsByDateRange,
} from "../controllers/events.js";

const router = express.Router();

// ========== ADMIN ROUTES (requires authentication) ==========
router.post("/post", requireSignIn, checkPermission("createEvent"), postEvent);
router.put("/:eventId", requireSignIn, checkPermission("editEvent"), editEvent);
router.delete("/:eventId", requireSignIn, checkPermission("deleteEvent"), deleteEvent);
router.get("/admin/drafts", requireSignIn, checkPermission("viewAllEvents"), getDraftedEvents);

// ========== SUPER ADMIN ROUTES ==========
router.put("/:eventId/approve", requireSignIn, verifySuperAdmin, checkPermission("approveEvent"), approveEvent);
router.put("/:eventId/reject", requireSignIn, verifySuperAdmin, checkPermission("rejectEvent"), rejectEvent);
router.get("/admin/pending", requireSignIn, verifySuperAdmin, getPendingEvents);
router.get("/admin/all", requireSignIn, checkPermission("viewAllEvents"), getAllEvents);

// ========== PUBLIC ROUTES ==========
router.get("/", getNonDraftedEvents);
router.get("/published", getPublishedEvents);
router.get("/search", searchEvents);
router.get("/date-range", getEventsByDateRange);
router.get("/:eventId", viewEvent);


// ========== ATTENDEE ROUTES ==========
router.post("/:eventId/register", registerForEvent);
router.get("/:eventId/attendees", requireSignIn, checkPermission("viewAttendees"), getEventAttendees);
router.put("/attendee/:attendeeId/status", requireSignIn, checkPermission("viewAttendees"), updateAttendeeStatus);

export default router;
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Admin name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Admin email is required"],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Admin password is required"],
    minlength: [6, "Password should be at least 6 characters"],
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ["admin", "superadmin"],
    default: "admin",
  },
  permissions: {
    createEvent: {
      type: Boolean,
      default: true,
    },
    editEvent: {
      type: Boolean,
      default: true,
    },
    deleteEvent: {
      type: Boolean,
      default: false, // Only superadmin can delete
    },
    viewAllEvents: {
      type: Boolean,
      default: true,
    },
    approveEvent: {
      type: Boolean,
      default: false, // Only superadmin
    },
    rejectEvent: {
      type: Boolean,
      default: false, // Only superadmin
    },
    viewAttendees: {
      type: Boolean,
      default: true,
    },
    manageAdmins: {
      type: Boolean,
      default: false, // Only superadmin
    },
    viewReports: {
      type: Boolean,
      default: true,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
});

// Hash password before saving
adminSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
adminSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Set default permissions based on role
adminSchema.pre("save", function(next) {
  if (this.role === "superadmin") {
    this.permissions = {
      createEvent: true,
      editEvent: true,
      deleteEvent: true,
      viewAllEvents: true,
      approveEvent: true,
      rejectEvent: true,
      viewAttendees: true,
      manageAdmins: true,
      viewReports: true,
    };
  }
  next();
});

export default mongoose.model("Admin", adminSchema);
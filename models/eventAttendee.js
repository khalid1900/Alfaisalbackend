import mongoose from "mongoose";

const eventAttendeeSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["registered", "attended", "cancelled"],
    default: "registered",
  },
  notes: {
    type: String,
  },
});

export default mongoose.model("EventAttendee", eventAttendeeSchema);

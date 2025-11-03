import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Lecture/Presentation/Talk", "Social/Exhibition", "Workshop"],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
  },
  location: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  image: {
    type: String, // Base64 or URL
  },
  speakerImage: {
    type: String, // Base64 or URL
  },
  description: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  sponsor: {
    type: String,
  },
  audience: {
    type: String,
    enum: ["EVERYONE", "Students Only", "Faculty Only"],
    default: "EVERYONE",
  },
  speaker: {
    type: String,
  },
  subject: {
    type: String,
    enum: ["Technology", "Wellness", "Innovation", "Business", "Arts"],
  },
  tags: {
    type: [String],
    default: [],
  },
  interested: {
    type: Number,
    default: 0,
  },
  inPerson: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ["pending", "published", "rejected"],
    default: "pending",
  },
  draft: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  approvedBy: {
    type: String,
  },
  approvedAt: {
    type: Date,
  },
  numberOfAttendees: {
    type: Number,
    default: 0,
  },
  remainingDays: {
    type: Number,
    virtual: true,
    get: function() {
      const currentDate = new Date();
      const eventDate = new Date(this.date);
      const timeDifference = eventDate - currentDate;
      return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    },
  },
});

export default mongoose.model("Event", eventSchema);

import { uploadFile } from "../helper/aws.js";
import Event from "../models/event.js";
import EventAttendee from "../models/eventAttendee.js";
import nodemailer from "nodemailer";

// ========== EMAIL CONFIGURATION ==========
const sendEventEmail = async (recipientEmail, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "your-email@gmail.com",
        pass: process.env.EMAIL_PASSWORD || "your-app-password",
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || "events@alfaisal.edu",
      to: recipientEmail,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

// ========== CREATE/POST EVENT ==========
// export const postEvent = async (req, res, next) => {
//   try {
//     const {
//       title,
//       category,
//       date,
//       time,
//       endTime,
//       location,
//       address,
//       image,
//       speakerImage,
//       description,
//       details,
//       sponsor,
//       audience,
//       speaker,
//       subject,
//       tags,
//       inPerson,
//       draft,
//     } = req.body;

//     if (!title || !category || !date || !location || !description || !details) {
//       return res.status(400).json({
//         message: "Please provide all required fields: title, category, date, location, description, details",
//       });
//     }

//     const newEvent = new Event({
//       title,
//       category,
//       date: new Date(date),
//       time,
//       endTime,
//       location,
//       address,
//       image,
//       speakerImage,
//       description,
//       details,
//       sponsor,
//       audience,
//       speaker,
//       subject,
//       tags: Array.isArray(tags) ? tags : [],
//       inPerson: inPerson !== undefined ? inPerson : true,
//       draft: draft !== undefined ? draft : false,
//       createdBy: req.user._id, // From auth middleware
//       status: "pending",
//     });

//     await newEvent.save();
//     await newEvent.populate("createdBy", "name email");

//     return res.status(201).json({
//       status: "Event created successfully",
//       data: newEvent,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


export const postEvent = async (req, res) => {
  try {
    const {
      title,
      category,
      date,
      time,
      endTime,
      location,
      address,
      description,
      details,
      sponsor,
      audience,
      speaker,
      subject,
      tags,
      inPerson,
      draft,
    } = req.body;

    if (!title || !category || !date || !location || !description || !details) {
      return res.status(400).json({
        message:
          "Please provide all required fields: title, category, date, location, description, details",
      });
    }

    // handle files (if any)
    let imageUrl = null;
    let speakerImageUrl = null;
    if (req.files && req.files.length > 0) {
      const imageFile = req.files.find((f) => f.fieldname === "image");
      const speakerFile = req.files.find((f) => f.fieldname === "speakerImage");

      if (imageFile) imageUrl = await uploadFile(imageFile);
      if (speakerFile) speakerImageUrl = await uploadFile(speakerFile);
    }

    const newEvent = new Event({
      title,
      category,
      date: new Date(date),
      time,
      endTime,
      location,
      address,
      image: imageUrl,
      speakerImage: speakerImageUrl,
      description,
      details,
      sponsor,
      audience,
      speaker,
      subject,
      tags: Array.isArray(tags) ? tags : tags ? tags.split(",") : [],
      inPerson: inPerson === "true" || inPerson === true,
      draft: draft === "true" || draft === true,
      createdBy: req.user._id,
      status: "pending",
    });

    await newEvent.save();
    res.status(201).json({ message: "Event created successfully", data: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// ========== VIEW SINGLE EVENT ==========
export const viewEvent = async (req, res, next) => {
  const { eventId } = req.params;
  try {
    const eventExists = await Event.findById(eventId)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email");

    if (!eventExists) {
      return res.status(404).json({ error: "Event not found" });
    }

    const numberOfAttendees = await EventAttendee.countDocuments({
      eventId: eventExists._id,
      status: { $in: ["registered", "attended"] },
    });

    const eventDetails = {
      ...eventExists.toJSON(),
      numberOfAttendees,
    };

    return res.status(200).json({ data: eventDetails });
  } catch (error) {
    next(error);
  }
};

// ========== DELETE EVENT ==========
export const deleteEvent = async (req, res, next) => {
  const { eventId } = req.params;
  try {
    const deletedEvent = await Event.findOneAndDelete({ _id: eventId });

    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Delete all attendees for this event
    await EventAttendee.deleteMany({ eventId: eventId });

    return res.status(200).json({
      message: "Event deleted successfully",
      deletedEvent,
    });
  } catch (error) {
    next(error);
  }
};

// ========== EDIT/UPDATE EVENT ==========
// export const editEvent = async (req, res, next) => {
//   const { eventId } = req.params;
//   const {
//     title,
//     category,
//     date,
//     time,
//     endTime,
//     location,
//     address,
//     image,
//     speakerImage,
//     description,
//     details,
//     sponsor,
//     audience,
//     speaker,
//     subject,
//     tags,
//     inPerson,
//     draft,
//   } = req.body;

//   try {
//     const updateData = {};

//     if (title) updateData.title = title;
//     if (category) updateData.category = category;
//     if (date) updateData.date = new Date(date);
//     if (time) updateData.time = time;
//     if (endTime) updateData.endTime = endTime;
//     if (location) updateData.location = location;
//     if (address) updateData.address = address;
//     if (image !== undefined) updateData.image = image;
//     if (speakerImage !== undefined) updateData.speakerImage = speakerImage;
//     if (description) updateData.description = description;
//     if (details) updateData.details = details;
//     if (sponsor !== undefined) updateData.sponsor = sponsor;
//     if (audience) updateData.audience = audience;
//     if (speaker !== undefined) updateData.speaker = speaker;
//     if (subject) updateData.subject = subject;
//     if (tags) updateData.tags = Array.isArray(tags) ? tags : [];
//     if (inPerson !== undefined) updateData.inPerson = inPerson;
//     if (draft !== undefined) updateData.draft = draft;

//     const updatedEvent = await Event.findOneAndUpdate(
//       { _id: eventId },
//       updateData,
//       { new: true, runValidators: true }
//     )
//       .populate("createdBy", "name email")
//       .populate("approvedBy", "name email");

//     if (!updatedEvent) {
//       return res.status(404).json({ error: "Event not found" });
//     }

//     return res.status(200).json({
//       message: "Event updated successfully",
//       data: updatedEvent,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


export const editEvent = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    // 1️⃣ Parse body values
    const {
      title,
      category,
      date,
      time,
      endTime,
      location,
      address,
      image,
      speakerImage,
      description,
      details,
      sponsor,
      audience,
      speaker,
      subject,
      tags,
      inPerson,
      draft,
    } = req.body;

    // 2️⃣ Start building update object
    const updateData = {};

    if (title) updateData.title = title;
    if (category) updateData.category = category;
    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;
    if (endTime) updateData.endTime = endTime;
    if (location) updateData.location = location;
    if (address) updateData.address = address;
    if (description) updateData.description = description;
    if (details) updateData.details = details;
    if (sponsor !== undefined) updateData.sponsor = sponsor;
    if (audience) updateData.audience = audience;
    if (speaker !== undefined) updateData.speaker = speaker;
    if (subject) updateData.subject = subject;
    if (inPerson !== undefined) updateData.inPerson = inPerson === "true" || inPerson === true;
    if (draft !== undefined) updateData.draft = draft === "true" || draft === true;

    // 3️⃣ Tags handling
    if (tags) {
      if (Array.isArray(tags)) updateData.tags = tags;
      else if (typeof tags === "string") updateData.tags = tags.split(",").map((t) => t.trim());
    }

    // 4️⃣ Handle images
    // Case 1: Base64 or URL passed in body (from frontend JSON)
    if (image && typeof image === "string" && image.startsWith("data:image")) {
      // Optionally upload to S3 if you want, else just store base64
      // const uploadedImage = await uploadToS3(image);
      updateData.image = image;
    }

    if (speakerImage && typeof speakerImage === "string" && speakerImage.startsWith("data:image")) {
      // const uploadedSpeakerImage = await uploadToS3(speakerImage);
      updateData.speakerImage = speakerImage;
    }

    // Case 2: Actual files uploaded via multipart/form-data
    if (req.files && req.files.length > 0) {
      const imageFile = req.files.find((f) => f.fieldname === "image");
      const speakerFile = req.files.find((f) => f.fieldname === "speakerImage");

      if (imageFile) {
        const uploadedImage = await uploadFile(imageFile);
        updateData.image = uploadedImage;
      }

      if (speakerFile) {
        const uploadedSpeakerImage = await uploadFile(speakerFile);
        updateData.speakerImage = uploadedSpeakerImage;
      }
    }

    // 5️⃣ Update in DB
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email");

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    // 6️⃣ Response
    res.status(200).json({
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// ========== GET DRAFT EVENTS ==========
export const getDraftedEvents = async (req, res, next) => {
  try {
    const draftedEvents = await Event.find({ draft: true })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: draftedEvents.length,
      data: draftedEvents,
    });
  } catch (error) {
    next(error);
  }
};

// ========== GET NON-DRAFT EVENTS ==========
export const getNonDraftedEvents = async (req, res, next) => {
  try {
    const nonDraftedEvents = await Event.find({ draft: false })
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    return res.status(200).json({
      count: nonDraftedEvents.length,
      data: nonDraftedEvents,
    });
  } catch (error) {
    next(error);
  }
};

// ========== GET PUBLISHED EVENTS ==========
export const getPublishedEvents = async (req, res, next) => {
  try {
    const publishedEvents = await Event.find({
      status: "published",
      draft: false,
      date: { $gte: new Date() }, // Only future events
    })
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    return res.status(200).json({
      count: publishedEvents.length,
      data: publishedEvents,
    });
  } catch (error) {
    next(error);
  }
};

// ========== GET PENDING EVENTS ==========
export const getPendingEvents = async (req, res, next) => {
  try {
    const pendingEvents = await Event.find({ status: "pending" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: pendingEvents.length,
      data: pendingEvents,
    });
  } catch (error) {
    next(error);
  }
};

// ========== GET ALL EVENTS ==========
export const getAllEvents = async (req, res, next) => {
  try {
    const allEvents = await Event.find()
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: allEvents.length,
      data: allEvents,
    });
  } catch (error) {
    next(error);
  }
};

// ========== APPROVE EVENT ==========
export const approveEvent = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    const approvedEvent = await Event.findOneAndUpdate(
      { _id: eventId },
      {
        status: "published",
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true }
    )
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email");

    if (!approvedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Send approval email to event creator
    const eventCreator = approvedEvent.createdBy;
    const approvalEmailContent = `
      <h2>Event Approval Notification</h2>
      <p>Hello ${eventCreator.name},</p>
      <p>Your event "<strong>${approvedEvent.title}</strong>" has been <strong style="color: green;">APPROVED</strong>!</p>
      <p><strong>Date:</strong> ${new Date(approvedEvent.date).toLocaleDateString()}</p>
      <p><strong>Status:</strong> Published</p>
      <p>Your event is now live and visible to all users.</p>
      <p>Best regards,<br/>Al Faisal University Events Team</p>
    `;

    await sendEventEmail(
      eventCreator.email,
      "Event Approved - " + approvedEvent.title,
      approvalEmailContent
    );

    return res.status(200).json({
      message: "Event approved successfully",
      data: approvedEvent,
    });
  } catch (error) {
    next(error);
  }
};

// ========== REJECT EVENT ==========
export const rejectEvent = async (req, res, next) => {
  const { eventId } = req.params;
  const { reason } = req.body;

  try {
    const rejectedEvent = await Event.findOneAndUpdate(
      { _id: eventId },
      { status: "rejected" },
      { new: true }
    )
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email");

    if (!rejectedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Send rejection email to event creator
    const eventCreator = rejectedEvent.createdBy;
    const rejectionEmailContent = `
      <h2>Event Rejection Notification</h2>
      <p>Hello ${eventCreator.name},</p>
      <p>Your event "<strong>${rejectedEvent.title}</strong>" has been <strong style="color: red;">REJECTED</strong>.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>Please review the event details and resubmit if needed.</p>
      <p>Best regards,<br/>Al Faisal University Events Team</p>
    `;

    await sendEventEmail(
      eventCreator.email,
      "Event Rejected - " + rejectedEvent.title,
      rejectionEmailContent
    );

    return res.status(200).json({
      message: "Event rejected successfully",
      data: rejectedEvent,
    });
  } catch (error) {
    next(error);
  }
};

// ========== REGISTER FOR EVENT ==========
export const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Please provide all required fields: name, email, phone",
      });
    }

    // Check if event exists
    const eventExists = await Event.findById(eventId);
    if (!eventExists) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event is published
    if (eventExists.status !== "published") {
      return res.status(400).json({
        message: "This event is not available for registration",
      });
    }

    // Check if user already registered
    const alreadyRegistered = await EventAttendee.findOne({
      eventId,
      email,
    });

    if (alreadyRegistered) {
      return res.status(400).json({
        message: "You are already registered for this event",
      });
    }

    const newAttendee = new EventAttendee({
      eventId,
      name,
      email,
      phone,
      status: "registered",
    });

    await newAttendee.save();

    // Increment attendees count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { numberOfAttendees: 1 },
    });

    // Send confirmation email
    const eventDate = new Date(eventExists.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const registrationEmailContent = `
      <h2>Event Registration Confirmation</h2>
      <p>Dear ${name},</p>
      <p>Thank you for registering for our event!</p>
      <h3>${eventExists.title}</h3>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Time:</strong> ${eventExists.time}${
      eventExists.endTime ? " - " + eventExists.endTime : ""
    }</p>
      <p><strong>Location:</strong> ${eventExists.location}</p>
      <p><strong>Category:</strong> ${eventExists.category}</p>
      ${eventExists.address ? `<p><strong>Address:</strong> ${eventExists.address}</p>` : ""}
      <p>We look forward to seeing you there!</p>
      <p>Best regards,<br/>Al Faisal University Events Team</p>
    `;

    await sendEventEmail(
      email,
      `Registration Confirmation: ${eventExists.title}`,
      registrationEmailContent
    );

    return res.status(201).json({
      message: "Registered for event successfully",
      data: newAttendee,
    });
  } catch (error) {
    next(error);
  }
};

// ========== GET EVENT ATTENDEES ==========
export const getEventAttendees = async (req, res, next) => {
  const { eventId } = req.params;
  try {
    const attendees = await EventAttendee.find({ eventId }).sort({
      registeredAt: -1,
    });

    if (!attendees || attendees.length === 0) {
      return res.status(200).json({
        message: "No attendees found",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      count: attendees.length,
      data: attendees,
    });
  } catch (error) {
    next(error);
  }
};

// ========== UPDATE ATTENDEE STATUS ==========
export const updateAttendeeStatus = async (req, res, next) => {
  const { attendeeId } = req.params;
  const { status } = req.body;

  try {
    if (!["registered", "attended", "cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: registered, attended, cancelled",
      });
    }

    const updatedAttendee = await EventAttendee.findByIdAndUpdate(
      attendeeId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedAttendee) {
      return res.status(404).json({ error: "Attendee not found" });
    }

    return res.status(200).json({
      message: "Attendee status updated successfully",
      data: updatedAttendee,
    });
  } catch (error) {
    next(error);
  }
};

// ========== SEARCH EVENTS ==========
export const searchEvents = async (req, res, next) => {
  try {
    const { query, category, subject } = req.query;

    const searchFilter = {};

    if (query) {
      searchFilter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
      ];
    }

    if (category) {
      searchFilter.category = category;
    }

    if (subject) {
      searchFilter.subject = subject;
    }

    // Only return published events
    searchFilter.status = "published";
    searchFilter.draft = false;

    const results = await Event.find(searchFilter)
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    return res.status(200).json({
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// ========== GET EVENTS BY DATE RANGE ==========
export const getEventsByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Please provide both startDate and endDate",
      });
    }

    const events = await Event.find({
      status: "published",
      draft: false,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    return res.status(200).json({
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

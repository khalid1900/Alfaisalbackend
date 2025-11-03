import mongoose from "mongoose";

const speculativeSchema = new mongoose.Schema({
    
  name: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
  },

  number: {
    type: Number,
    // required: true,
  },

  jobrole: {
    type: String,
    // required: true,
  },


  resume: {
    type: String,
    // required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
 
});

export default mongoose.model("speculative", speculativeSchema);

import ApplyJob from "../models/applyJob.js";
import Jobs from "../models/jobs.js";
import { uploadFile } from "../helper/aws.js";





export const getAllJob=async (req, res) => {
    try {
      const allJobRequests = await applyjob.find();
      res.status(200).json(allJobRequests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  
  export const viewJob = async (req, res, next) => {
    const { jobId } = req.params;
    try {
      const jobExists = await Jobs.findById(jobId);
      if (!jobExists) {
        throw new Error(`Job not found`);
      }
  
      // Find the details of applicants for that job
      const applicants = await ApplyJob.find({ jobId: jobExists._id });
  
      // Extract relevant details from each applicant
      const formattedApplicants = applicants.map(applicant => {
        const { _id, name, email, number, resume, portfolio } = applicant;
        return { _id, name, email, number, resume, portfolio };
      });
  
      // Include the applicants' details and count in the response
      const numberOfApplicants = formattedApplicants.length;
  
      return res.status(200).json({ data: { jobExists, numberOfApplicants, applicants: formattedApplicants } });
    } catch (error) {
      next(error);
    }
  };




  // export const applyForJob = async (req, res) => {
  //   try {
  //     const { jobId, name, email, number, coverletter } = req.body;
  
  //     // if (!jobId || !name || !email || !number || !coverletter) {
  //     //   return res.status(400).json({ message: "Please provide all required fields." });
  //     // }
  
  //     // Check if the job post exists
  //     const jobExists = await Jobs.findById(jobId);
  //     if (!jobExists) {
  //       return res.status(404).json({ message: "Job not found" });
  //     }
  
  //     // Your existing code for uploading files
  //     const emprsume = req.files[0];
  //     const portfolio = req.files[1];
  
  //     // Additional validation for uploaded files can be added here
  
  //     const uploadedResume = await uploadFile(emprsume);
  //     const uploadedPortfolio = await uploadFile(portfolio);
  
  //     const newApplyJob = new ApplyJob({
  //       jobId,
  //       name,
  //       email,
  //       number,
  //       coverletter,
  //       resume: uploadedResume,
  //       portfolio: uploadedPortfolio,
  //     });
  
  //     await newApplyJob.save();
  
  //     // Increment the number of applicants in the job model
  //     await Jobs.findByIdAndUpdate(jobId, { $inc: { numberOfApplicants: 1 } });
  
  //     return res.status(201).json({ message: "Applied for job successfully......?", data: newApplyJob });
  
  //   } catch (error) {
  //     return res.status(500).json({ error: error.message });
  //   }
  // };
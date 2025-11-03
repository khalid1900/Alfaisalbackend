
// import Jobs from "../models/jobs.js";
// import ApplyJob from "../models/applyJob.js";
// import { uploadFile } from "../helper/aws.js";
// import nodemailer from 'nodemailer';



// export const postJob = async (req, res, next) => {
//   try {
//     const jobPost = new Jobs({
//       ...req.body,
//     });

//     await jobPost.save();
//     return res.status(201).json({
//       status: "Job posted successfully",
//       data: jobPost._id,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // view job ...........

// export const viewJob = async (req, res, next) => {
//   const { jobId } = req.params;
//   try {
//     const jobExists = await Jobs.findById(jobId);
//     if (!jobExists) {
//       throw new Error(`Job not found`);
//     }
//     const numberOfApplicants = await ApplyJob.countDocuments({ jobId: jobExists._id });
//     const jobDetails = {
//       ...jobExists._doc,
//       remainingDays: jobExists.remainingDays,
//       numberOfApplicants,
//     };

//     return res.status(200).json({ data: jobDetails,numberOfApplicants ,});
//   } catch (error) {
//     next(error);
//   }
// };

// // delete job
// export const deleteJob = async (req, res, next) => {
//   const { jobId } = req.params;
//   try {

//     const deletedJob = await Jobs.findOneAndDelete({ _id: jobId });

//     if (!deletedJob) {
//       return res.status(404).json({ error: "Job not found" });
//     }

//     return res.status(200).json({ message: "Job deleted successfully", deletedJob });
//   } catch (error) {
//     next(error); 
//   }
// };
// // edit job
// export const editJob = async (req, res, next) => {
//   const { jobId } = req.params;
//   const {
//         title,
//         type,
//         skills,
//         experience,
//         responsibilities ,
//         description,
//         link,
//         draft,
//         mode,
//         location,
//         salary, 
//         postdate ,
//         expiredate
//   } = req.body;

//   try {
//     const updatedJob = await Jobs.findOneAndUpdate(
//       { _id: jobId },
//       {
//         title,
//         type,
//         skills,
//         experience,
//         responsibilities ,
//         description,
//         link,
//         draft,
//         mode,
//         location,
//         salary, 
//         postdate ,
//         expiredate
//       },
//       { new: true } 
//     );

//     if (!updatedJob) {
//       return res.status(404).json({ error: "Job not found" });
//     }

//     return res.status(200).json({ message: "Job updated successfully", data: updatedJob });
//   } catch (error) {
//     next(error);
//   }
// };



// export const getDraftedJobs = async (req, res, next) => {
//   try {
//     const drafted = await Jobs.find({ draft: true });

//     return res.status(200).json({ data: drafted });
//   } catch (error) {
//     next(error);
//   }
// };



// export const getNonDraftedJobs = async (req, res, next) => {
//   try {
//     const nonDrafted = await Jobs.find({ draft: false });

//     return res.status(200).json({ data: nonDrafted });
//   } catch (error) {
//     next(error);
//   }
// };


// export const getAllJobs = async (req, res, next) => {
//   try {
//     const allJobs = await Jobs.find();

//     return res.status(200).json({ data: allJobs });
//   } catch (error) {
//     next(error);
//   }
// };


// // export const applyForJob = async (req, res) => {
  
// //   console.log(req.body,"first")
// //   try {
    
// //     console.log(req.body,"send")
// //     const { jobId, name, email, number, coverletter } = req.body;

// //     if (!jobId || !name || !email || !number || !coverletter) {
// //       return res.status(400).json({ message: "Please provide all required fields." });
// //     }

// //     // Check if the job post exists
// //     const jobExists = await Jobs.findById(jobId);
// //     if (!jobExists) {
// //       return res.status(404).json({ message: "Job not found" });
// //     }

// //     const emprsume = req.files[0];
// //     const portfolio = req.files[0];


// //     let uploadedResume= null;
// //     if (emprsume) {
// //       // Resume file is provided, upload it
// //       uploadedResume = await uploadFile(emprsume);
// //     }

// //     let uploadedPortfolio = null;
// //     if (portfolio) {
// //       uploadedPortfolio = await uploadFile(portfolio);
// //     }

// //     const newApplyJob = new ApplyJob({
// //       jobId,
// //       name,
// //       email,
// //       number,
// //       coverletter,
// //       resume: uploadedResume,
// //       portfolio: uploadedPortfolio,
// //     });

// //     console.log(newApplyJob,"lasr clg")
// //     await newApplyJob.save();
// //     // Increment the number of applicants in the job model
// //     await Jobs.findByIdAndUpdate(jobId, { $inc: { numberOfApplicants: 1 } });

// //     return res.status(201).json({ message: "Applied for job successfully.....", data: newApplyJob }
    

// //     );

// //   } catch (error) {
// //     return res.status(500).json({ error: error.message });
// //   }
// // };


// export const applyForJob = async (req, res) => {
//   // console.log(req.body, "first");
//   try {
//     // console.log(req.body, "send");
//     const { jobId, name, email, number, coverletter } = req.body;

//     if (!jobId || !name || !email || !number || !coverletter) {
//       return res
//         .status(400)
//         .json({ message: "Please provide all required fields." });
//     }

//     // Check if the job post exists
//     const jobExists = await Jobs.findById(jobId);
//     if (!jobExists) {
//       return res.status(404).json({ message: "Job not found" });
//     }

//     const emprsume = req.files[0];
//     const portfolio = req.files[0];

//     let uploadedResume = null;
//     if (emprsume) {
//       // Resume file is provided, upload it
//       uploadedResume = await uploadFile(emprsume);
//     }

//     let uploadedPortfolio = null;
//     if (portfolio) {
//       uploadedPortfolio = await uploadFile(portfolio);
//     }

//     const newApplyJob = new ApplyJob({
//       jobId,
//       name,
//       email,
//       number,
//       coverletter,
//       resume: uploadedResume,
//       portfolio: uploadedPortfolio,
//     });

//     // console.log(newApplyJob, "last clg");
//     await newApplyJob.save();

    
//     await Jobs.findByIdAndUpdate(jobId, { $inc: { numberOfApplicants: 1 } });

//     await sendApplicationConfirmationEmail(email, newApplyJob);

//     return res
//       .status(201)
//       .json({ message: "Applied for job successfully.....", data: newApplyJob });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// const sendApplicationConfirmationEmail = async (recipientEmail, applicationDetails) => {
//   const transporter = nodemailer.createTransport({   
//     service: 'gmail',
//     auth: {
//       user: 'qurinoumsolution@gmail.com',
//       pass: 'caijhmdevozaiora',
//       // user: 'mail.jobs@qurinomsolutions.com',
//       // pass: '}1YA~9,5f^)7',
   
//     },
//   });

//   const mailOptions = {
//     from: 'mail.jobs@qurinomsolutions.com',
//     to: recipientEmail,
//     subject: 'Job Application Confirmation',
//     text: `Dear ${applicationDetails.name},\n\nThank you for applying for the job. Your application has been received, and our team will contact you soon.\n\nBest regards,\nQurinom Solutions`,
//   };

//   await transporter.sendMail(mailOptions);
// };
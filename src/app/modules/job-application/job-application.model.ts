import { Schema, model, Types } from "mongoose";
import { IJobApplication } from "./job-application.interface";

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    email: { type: String, required: true, lowercase: true },
    jobId: { type: String, default: "" },
    companyName: { type: String },
    jobType: { type: String },
    contact: {
      email: { type: String },
      phoneNumber: { type: String },
    },
    jobPostLink: { type: String },
    whenApplied: { type: Date },
    response: {
      jobtaskDeadline: { type: Date },
      interviewCallTime: { type: Date },
    },
    resumeID: { type: Types.ObjectId, ref: "Resume" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const JobApplication = model<IJobApplication>(
  "JobApplication",
  jobApplicationSchema
);

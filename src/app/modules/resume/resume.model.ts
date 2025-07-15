import { model, Schema } from "mongoose";
import { IResume } from "./resume.interface";

const resumeSchema = new Schema<IResume>(
  {
    email: { type: String, required: true, lowercase: true },
    resumeFile: { type: String, required: true, default: "" },
    jobApplicationID: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Resume = model<IResume>("Resume", resumeSchema);

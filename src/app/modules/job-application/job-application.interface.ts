import { Types } from "mongoose";

export interface IJobApplication {
  email: string;
  jobId?: string;
  companyName?: string;
  jobType?: string;
  contact?: {
    email: string;
    phoneNumber: string;
  };
  jobPostLink?: string;
  whenApplied?: Date;
  response?: {
    jobtaskDeadline?: Date;
    interviewCallTime?: Date;
  };
  resumeID?: Types.ObjectId;
}

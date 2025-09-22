import { Types } from "mongoose";

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IauthProvider {
  provider: string;
  providerId: string;
}

export interface IUser {
  name?: string;
  email: string;
  password?: string;
  resumeFile?: Object;
  address?: string;
  isProUser?: boolean;
  isDeleted?: boolean;
  isVerified?: boolean;
  IsActive?: IsActive;
  refreshToken?:String,
  auths?: IauthProvider[];
  resume?: Types.ObjectId[];
  jobApplication?: Types.ObjectId[];
}

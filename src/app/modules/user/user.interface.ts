import { Types } from "mongoose";

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

interface IauthProvider {
  provider: string;
  providerId: string;
}

export interface IUser {
  name: string;
  email: string;
  password?: string;
  address?: string;
  isProUser?: boolean;
  isDeleted?: boolean;
  IsActive?: IsActive;
  auths?: IauthProvider[];
  resume?: Types.ObjectId[];
  jobApplication?: Types.ObjectId[];
}

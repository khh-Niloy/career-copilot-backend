import { model, Schema, Types } from "mongoose";
import { IauthProvider, IsActive, IUser } from "./user.interface";
import { ref } from "process";

const authProviderSchema = new Schema<IauthProvider>({
  provider: String,
  providerId: String,
});

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, default: "123" },
    address: { type: String, default: "dhaka" },
    isProUser: { type: Boolean, default: false },
    resumeFile: { type: Object, default: false },
    refreshToken: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    IsActive: { type: String, enum: IsActive, default: IsActive.ACTIVE },
    auths: [authProviderSchema],
    resume: [
      {
        type: Schema.Types.ObjectId,
        ref: "Resume", // !
      },
    ],
    jobApplication: [
      {
        type: Schema.Types.ObjectId,
        ref: "JobApplication", // !
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);

import { model, Schema } from "mongoose";

const userSchema = new Schema({
  email: { type: String },
  resume: { type: Object },
  access_token: { type: String },
  refresh_token: { type: String },
});

export const User = model("User", userSchema);

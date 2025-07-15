import { Router } from "express";
import { userController } from "./user.controller";
import { upload } from "../../middleware/user.multer.middlware";

export const userRouter = Router();

userRouter.post(
  "/email-body",
  upload.single("pdf"),
  userController.createEmailBody
);

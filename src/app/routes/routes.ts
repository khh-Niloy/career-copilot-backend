import { Router } from "express";
import { userRouter } from "../modules/user/user.routes";

export const routes = Router();

routes.use("/user", userRouter);

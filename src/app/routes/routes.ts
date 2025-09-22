import { Router } from "express";
import { premiumRoutes } from "../modules/user/premium.user.routes";
import { userRouter } from "../modules/user/user.routes";

export const routes = Router();

routes.use("/user", userRouter);
// routes.use("/user/premium", premiumRoutes)
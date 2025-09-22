import { Router } from "express";
import { premiumUserController } from "./premium.user.controller";

export const premiumRoutes = Router()

premiumRoutes.post("/check/rftoken", premiumUserController.checkRefreshToken)
premiumRoutes.get("/google/auth", premiumUserController.authLogin)
premiumRoutes.get("/auth/callback", premiumUserController.authCallback)
// premiumRoutes.post("/apply", premiumUserController.sendEmail)
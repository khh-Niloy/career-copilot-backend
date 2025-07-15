import { Request, Response } from "express";
import { userServices } from "./user.service";

const createEmailBody = async (req: Request, res: Response) => {
  try {
    const result = await userServices.createEmailBodyService(req);
    res.status(201).json({
      success: true,
      aiGeneratedText: JSON.parse(result),
    });
  } catch (error) {
    console.log(error);
    res.json({
      error: error,
    });
  }
};

export const userController = {
  createEmailBody,
};

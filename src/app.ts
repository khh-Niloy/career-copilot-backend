import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
// import fs from "fs";
import pdfParse from "pdf-parse";

export const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// ROM process -> saving
// const upload = multer({ dest: "uploads/" });

// RAM process -> not saving
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

app.post("/pdf-to-text", upload.single("pdf"), async (req, res: Response) => {
  const reqWithFile = req as MulterRequest;

  // ROM process -> saving
  // const file = reqWithFile.file;
  // const buffer = fs.readFileSync(file.path);

  // RAM process -> not saving
  const buffer = reqWithFile.file.buffer;
  const pdfText = await pdfParse(buffer);

  console.log(pdfText.text);
  res.json({ text: pdfText.text });
});

app.get("/", (req: Request, res: Response) => {
  res.send("welcome to career copilot backend");
});

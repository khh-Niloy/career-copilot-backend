import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";

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

app.post(
  "/api/resume/jobdes",
  upload.single("pdf"),
  async (req, res: Response) => {
    const reqWithFile = req as MulterRequest;
    const jobDescription = req.body.jobDescription;

    console.log(reqWithFile.file);

    // ROM process -> saving
    // const file = reqWithFile.file;
    // const buffer = fs.readFileSync(file.path);

    // RAM process -> not saving
    const pdfBuffer = reqWithFile.file.buffer;
    // const pdfText = await pdfParse(buffer);

    const formData = new FormData();
    formData.append("pdf", pdfBuffer, "resume.pdf");
    const response = await axios.post(
      "http://localhost:9000/api/pdf/extract",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );
    // try {
    //   const response = await axios.post(
    //     "http://localhost:9000/api/pdf/extract",
    //     pdfBuffer
    //   );
    const resumeContent = response?.data?.text;
    const links = response?.data?.links;
    console.log(resumeContent, links);

    //* Gemini api

    // } catch (error) {
    //   console.log(error);
    // }

    // console.log(pdfText.text);
    // res.json({ text: extractedData?.text, links: extractedData?.links });
  }
);

app.get("/", (req: Request, res: Response) => {
  res.send("welcome to career copilot backend");
});

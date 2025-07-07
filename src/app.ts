require("dotenv").config();
import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// const { PredictionServiceClient } = require("@google-cloud/aiplatform").v1;

// const { GoogleGenerativeAI } = require("@google/genai");
// import GoogleGenerativeAI from "@google/genai";
import { GoogleGenAI } from "@google/genai";

// const { VertexAI } = require("@google-cloud/vertexai");
// const path = require("path");

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

    //* ROM process -> saving
    // const file = reqWithFile.file;
    // const buffer = fs.readFileSync(file.path);

    //* RAM process -> not saving
    const pdfBuffer = reqWithFile.file.buffer;
    // const pdfText = await pdfParse(buffer);
    const formData = new FormData();
    formData.append("pdf", pdfBuffer, "resume.pdf");
    try {
      const response = await axios.post(
        `${process.env.MICROSERVICE_URL}pdf/extract`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      );
      const resumeContent = response?.data?.text;
      const links = response?.data?.links;

      // console.log(links);

      const formattedLinks = links.map((e) => {
        return `${e.name} -> ${e.url} \n`;
      });
      console.log(formattedLinks);

      const prompt = `actaully i extracted all the text and this is my resume ${resumeContent} and all the links in this resume like my social links and project links ${formattedLinks}, first pick one perfect project and find that project inside this ${formattedLinks}, and just give me the live site url`;

      async function geminiAi() {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
        });
        const config = {
          thinkingConfig: {
            thinkingBudget: -1,
          },
          responseMimeType: "application/json",
        };
        const model = "gemini-2.5-pro";
        const contents = [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ];

        // const result = await ai.models.generateContent({
        //   model,
        //   config,
        //   contents,
        // });

        // const text = result?.candidates[0]?.content?.parts[0].text;
        // // console.log(text?.parts[0].text);
        // console.log(text);

        // res.send(text);

        const stream = await ai.models.generateContentStream({
          model,
          config,
          contents,
        });

        let finalText = "";

        for await (const chunk of stream) {
          const part = chunk.candidates?.[0]?.content?.parts?.[0];
          if (part?.text) {
            const chunkText = part.text;
            process.stdout.write(chunkText); // logs as it streams
            finalText += chunkText;
          }
        }

        res.send(finalText);
      }

      geminiAi();
    } catch (error) {}
  }
);

app.get("/", (req: Request, res: Response) => {
  res.send("welcome to career copilot backend");
});

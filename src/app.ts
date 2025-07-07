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
    const jobDescription = req.body.jobDescription;

    // //* ROM process -> saving
    // // const file = reqWithFile.file;
    // // const buffer = fs.readFileSync(file.path);

    // //* RAM process -> not saving
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
      // console.log(formattedLinks);

      const prompt = `Based on my ${resumeContent} and ${formattedLinks} and the uploaded ${jobDescription}, write a short, professional, engaging and tailored email body to apply for the role [ find what job role mentioned in the ${jobDescription}, if multiple mentioned then leave like this (insert your job role) ]. The email should include:
          1. If the ${jobDescription} specifies how the email subject line should be formatted, follow that exactly. Otherwise, write a clear and professional subject line including my name and the job role I’m applying for.
          2. A short, friendly  greeting
          3. My full name and the specific role I’m applying for [ find what job role mentioned in the ${jobDescription}, if multiple mentioned then leave like this (insert your job role) ]. Keep professional tone.
          4. My core technical skills relevant to the role and the job, you can find out from my ${resumeContent}
          5. If the ${jobDescription} doesn’t say to add projects, don’t add them. then dont add but If the ${jobDescription} asks to include any key projects, then find relevant projects from my ${resumeContent} and present them like this:
          [Project Name]: [Live site URL]
          If the employer requests the code repository or GitHub link, add otherwise dont add:
          Code: [Repository URL]
          6. A sentence explaining why I’m a strong fit and genuinely interested in the company/role (align this with the ${jobDescription} — this part matters most)
          7. If the ${jobDescription} includes tools or technologies I haven’t worked with yet (based on my resume), shortly express my genuine interest in learning and working with them. Mention only those are important to write.
          8. Note that resume is attached and links of my portfolio/GitHub, you can find from here: ${resumeContent} and ${formattedLinks}. resume, github, portfolio
          9. A polite thank you and closing with my contact info (number and linkedin), you can find from here: ${resumeContent}

          The email should be short, impactful, and respectful of the hiring team’s time or reader’s time — no fluff, no unnecessary lines. Make sure it sounds confident but humble. Avoid generic phrases—make it feel like a real person wrote it, not a template

          NOTE: i need exactly this JSON formate: 
          {
            subjectLine: "",
            greeting: "",
            introduction: "",
            technicalSkills: "",
            (dont add if does not say to add projects)projects: [
              {projectName: "", liveSite: "", code: "" }
            ],
            fitInterest: "",
            willingnessToLearn: "",
            attachementsAndLinks: [{
              name: "", links: ""
            }],
            closingAndContact: {
              closing: "",
              contacts: [{}]
            },
          }

    `;

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
    } catch (error) {
      console.log(error);
    }
  }
);

app.get("/", (req: Request, res: Response) => {
  res.send("welcome to career copilot backend");
});

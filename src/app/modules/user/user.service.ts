import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { Request } from "express";
import { promptGemini } from "./user.prompt";
import FormData from "form-data";
import { User } from "./user.model";

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

const createEmailBodyService = async (req: Request) => {
  const reqWithFile = req as MulterRequest;
  const jobDescription = req.body.jobDescription;

  console.log(jobDescription)

  // console.log(jobDescription);
  console.log(reqWithFile.file);

  // * ROM process -> saving
  // const file = reqWithFile.file;
  // const buffer = fs.readFileSync(file.path);

  // * RAM process -> not saving

  const pdfBuffer = reqWithFile.file.buffer;
  const formData = new FormData();
  formData.append("pdf", pdfBuffer, "resume.pdf");

  // * microservice
  const response = await axios.post(
    `${process.env.MICROSERVICE_URL}pdf/extract`,
    formData,
    {
      headers: formData.getHeaders(),
    }
  );
  const resumeContent = response?.data?.text;
  const links = response?.data?.links;

  //   console.log(resumeContent);
  //   console.log(links);

  // ! after getting emailbody i can take my email!
  // const userEmail = "niloy.dev.101@gmail.com";
  // await User.findOneAndUpdate(
  //   {
  //     email: userEmail,
  //   },
  //   {
  //     $set: {
  //       resume: reqWithFile.file,
  //     },
  //   },
  //   { upsert: true, new: true }
  // );

  // console.log(links);

  const formattedLinks = links.map((e) => {
    return `${e.name} -> ${e.url} \n`;
  });
  // console.log(formattedLinks);

  const prompt = promptGemini(resumeContent, formattedLinks, jobDescription);

  //   console.log(prompt);

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
    return finalText;
  }

  const ai = await geminiAi()

  const email = JSON.parse(ai).myEmail

  // console.log(email)

  const createUser = await User.create({
    email: email,
    resumeFile: reqWithFile.file
  })

  return ai;
};



export const userServices = {
  createEmailBodyService,
};

/* 
    without streaming
    const result = await ai.models.generateContent({
        model,
        config,
        contents,
    });
    const text = result?.candidates[0]?.content?.parts[0].text;
    console.log(text?.parts[0].text);
    console.log(text);

    res.send(text);
*/

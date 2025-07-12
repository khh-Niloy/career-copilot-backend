require("dotenv").config();
import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";
import { google } from "googleapis";
// import session from "express-session";

import nodemailer from "nodemailer";
// import Resend from 'resend';

// import { GoogleGenerativeAI } from "@google/generative-ai";
// const { PredictionServiceClient } = require("@google-cloud/aiplatform").v1;

// const { GoogleGenerativeAI } = require("@google/genai");
// import GoogleGenerativeAI from "@google/genai";
import { GoogleGenAI } from "@google/genai";
import { User } from "./app/model/user";
// import { oauth2 } from "googleapis/build/src/apis/oauth2";

// const { VertexAI } = require("@google-cloud/vertexai");
// const path = require("path");

export const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());

// app.use(
//   session({
//     secret: "niloy709", // keep this safe
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }, // set true if using HTTPS
//   })
// );

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

    // console.log(jobDescription);
    console.log(reqWithFile.file);

    // //* ROM process -> saving
    // const file = reqWithFile.file;
    // const buffer = fs.readFileSync(file.path);

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

      const prompt = `Based on my ${resumeContent} and ${formattedLinks} and the uploaded ${jobDescription}, write a short, professional, engaging and tailored email body to apply for the role [ find what job role mentioned in the ${jobDescription}, if multiple mentioned then leave like this (insert your job role) ]. The email should include:
        
        0. find the email that user will sent to for job application, searhc in the ${jobDescription}.
      
        1. If the ${jobDescription} specifies how the email subject line should be formatted, follow that exactly. 
          Otherwise, write a clear and professional subject line including my name and the job role I’m applying for.
          
          2. A short, friendly  greeting

          3. (NOTE: Please Mention my name part first) Mention My full name earlier and the specific role I’m applying for [ find what job role mentioned in the ${jobDescription}, if multiple mentioned then leave like this (insert your job role) ]. Keep professional tone and Keep it concise max 2 to 2.5 sentences.

          4. My core technical skills relevant to the role and the job, you can find out from my ${resumeContent}. Please dont make long, keep concise and short but not too short!!

          5. -> **NOTE: Be carefull -> If the ${jobDescription} doesn’t say to add projects, don’t add them**. If the ${jobDescription} asks to include any key projects, then find relevant projects from my ${resumeContent} and present them like this:
          [Project Name]: [Live site URL]
          If the employer requests the code repository or GitHub link, add the repo link that you can find from ${formattedLinks} otherwise please dont add:
          Code: [Repository URL]

          6. A sentence explaining why I’m a strong fit and genuinely interested in the company/role (align this with the ${jobDescription} — this part matters most), Please dont make long, keep short but not too short!!

          If the ${jobDescription} includes tools or technologies I haven’t worked with yet (based on my resume), shortly express my genuine interest in learning and working with them. Mention only those are important to write. Please dont make long, keep short but not too short!!

          You have to merge this two within 35-37 words. And you *have to* focus on the part tools or technologies I haven’t worked with yet (based on my resume).

          7. Note that resume is attached and links of my portfolio/GitHub, you can find from here: ${resumeContent} and ${formattedLinks}. resume, github, portfolio
          8. A polite thank you and closing with my contact info (number and linkedin), you can find from here: ${resumeContent}
          9. give a solid with loyal and direct suggetion based on resume content and job description, Max 20 words! dont exceed this length!

          The email should be short, impactful, and respectful of the hiring team’s time or reader’s time — no fluff, no unnecessary lines. Make sure it sounds confident but humble. Avoid generic phrases—make it feel like a real person wrote it, not a template

          NOTE: i need exactly this JSON formate: 
          { 
            email: "" (If you dont find out any email where user will appy in that job description, then then give this string -> "not mentioned")
            subjectLine: "",
            greeting: "",
            introduction: "",
            technicalSkills: "",
            (dont add if does not say to add projects)projects: [
              {projectName: "", liveSite: "", code: "" }
            ],
            fitInterestAndWillingnessToLearn: "",
            attachementsAndLinks: [{
              name: "", links: ""
            }],
            closingAndContact: {
              closing: "",
              contacts: {}
            },
            aiSuggetion: "",
            myEmail: "" (please put here my email!)
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
        console.log(finalText);
        res.send({
          aiGeneratedText: JSON.parse(finalText),
          // pdfBuffer: pdfBuffer.toString("base64"),
          status: 200,
        });
      }

      geminiAi();
    } catch (error) {
      console.log(error.response?.data);
      res.json({
        error: JSON.parse(error?.ApiError),
      });
    }
  }
);

app.post("/api/premium/check/rftoken", async (req: Request, res: Response) => {
  const userEmail = req.body;
  const user = await User.findOne({ email: userEmail.email });
  console.log(user);
  // const result = await User.insertOne(userEmail);
  let isRefTokenExist = false;
  if (user?.refresh_token) {
    isRefTokenExist = true;
  }
  res.json({
    isRefTokenExist,
  });
});

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost:8000/oauth2callback"
);

app.get("/api/premium/auth/login", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // force refresh token
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://mail.google.com/", // <-- this is full access (optional but strong)
    ],
  });
  res.redirect(url);
});

app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  console.log("oauth2callback tokens-> ", tokens);

  // const oauth2 = google.oauth2({
  //   version: "v2",
  //   auth: oAuth2Client,
  // });

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const profile = await gmail.users.getProfile({ userId: "me" });
  console.log("oauth2callback profile-> ", profile);

  const userEmail = profile.data.emailAddress;
  console.log("oauth2callback userEmail-> ", userEmail);
  console.log("✅ Logged in Gmail:", userEmail);

  // console.log("oauth2", oauth2);
  // console.log("token", tokens);

  // const { data: userInfo } = await oauth2.userinfo.get();
  // console.log("userInfo", userInfo);

  // const userEmail = userInfo.email;
  // console.log("userEmail", userEmail);

  // const userEmail = "niloy.dev.101@gmail.com";

  await User.findOneAndUpdate(
    { email: userEmail },
    {
      $set: {
        // access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      },
    },
    { upsert: true, new: true }
  );

  res.redirect("http://localhost:3000/premium/confirmation"); // or wherever your frontend form is
});

app.post("/api/premium/apply", async (req: Request, res: Response) => {
  const { emailBody } = req.body;
  const user = await User.findOne({ email: emailBody.currentUserEmail });

  console.log(user);

  if (!user?.refresh_token) {
    return res.status(400).json({ error: "Refresh token missing for user" });
  }

  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
    // "http://localhost:8000/oauth2callback"
  );
  oAuth2Client.setCredentials({
    refresh_token: user.refresh_token,
  });
  const accessToken = (await oAuth2Client.getAccessToken()).token;

  console.log("new", accessToken);

  try {
    console.log("before transporter");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: emailBody.currentUserEmail,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: user.refresh_token,
        accessToken, // pass the fresh access token here
      },
    });

    // your mailOptions setup here...
    const senderName = "Hasib Hossain Niloy";

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #333;">
        <p>${emailBody?.greeting}</p>
        <p>${emailBody?.introduction}</p>
        <p>${emailBody?.technicalSkills}</p>

        ${
          emailBody?.projects?.length > 0
            ? `<div style="margin-top: 16px;"><strong>My Key Projects:</strong><br />
                ${emailBody.projects
                  .map(
                    (e) =>
                      `<p style="margin: 4px 0;"><strong>${e.projectName}</strong>: <a href="${e.liveSite}" style="color: #2563eb;">${e.liveSite}</a></p>`
                  )
                  .join("")}
              </div>`
            : ""
        }

        <p>${emailBody?.fitInterestAndWillingnessToLearn}</p>

        ${
          emailBody?.attachementsAndLinks?.length > 0
            ? `<div style="margin-top: 16px;">
                ${emailBody.attachementsAndLinks
                  .map(
                    (item) =>
                      `<div style="margin-bottom: 4px;"><strong>${item.name}:</strong> <a href="${item.links}" style="color: #2563eb;">${item.links}</a></div>`
                  )
                  .join("")}
              </div>`
            : ""
        }

        <p style="margin-top: 20px;">${emailBody?.closingAndContact?.closing}</p>

        <div style="margin-top: 12px;">
          <p><strong>${emailBody?.closingAndContact?.contacts?.name}</strong></p>
          <p>${emailBody?.closingAndContact?.contacts?.phone}</p>
          ${
            emailBody?.closingAndContact?.contacts?.linkedin
              ? `<p>LinkedIn: <a href="${emailBody?.closingAndContact?.contacts?.linkedin}" style="color: #2563eb;">${emailBody?.closingAndContact?.contacts?.linkedin}</a></p>`
              : ""
          }
        </div>
      </div>
    `;

    const mailOptions = {
      from: `${senderName} <${emailBody.currentUserEmail}>`,
      to: emailBody?.email,
      subject: emailBody?.subjectLine,
      html: htmlBody,
      // attachments: [
      //   {
      //     filename: "resume.pdf",
      //     content: user?.resume?.buffer,
      //     contentType: "application/pdf",
      //   },
      // ],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(result);
    res.send(result);
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// app.post(
//   "/api/premium/apply",
//   // upload.single("pdf"),
//   async (req: Request, res: Response) => {
//     // const reqWithFile = req as MulterRequest;
//     // const pdfBuffer = reqWithFile.file.buffer;
//     // const emailBody = JSON.parse(req?.body?.emailBody);

//     const { emailBody } = req.body;

//     // console.log(emailBody.currentUserEmail, emailBody);

//     const user = await User.findOne({ email: emailBody.currentUserEmail });

//     console.log("Trying to send from:", user.email);
//     console.log("Refresh Token:", user.refresh_token);
//     console.log("clientId:", process.env.CLIENT_ID);

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: emailBody.currentUserEmail,
//         clientId: process.env.CLIENT_ID,
//         clientSecret: process.env.CLIENT_SECRET,
//         refreshToken: user?.refresh_token,
//         // accessToken: user?.access_token,
//       },
//     });

//     const senderName = "Hasib Hossain Niloy";

//     const htmlBody = `
//       <div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #333;">
//         <p>${emailBody?.greeting}</p>
//         <p>${emailBody?.introduction}</p>
//         <p>${emailBody?.technicalSkills}</p>

//         ${
//           emailBody?.projects?.length > 0
//             ? `<div style="margin-top: 16px;"><strong>My Key Projects:</strong><br />
//                 ${emailBody.projects
//                   .map(
//                     (e) =>
//                       `<p style="margin: 4px 0;"><strong>${e.projectName}</strong>: <a href="${e.liveSite}" style="color: #2563eb;">${e.liveSite}</a></p>`
//                   )
//                   .join("")}
//               </div>`
//             : ""
//         }

//         <p>${emailBody?.fitInterestAndWillingnessToLearn}</p>

//         ${
//           emailBody?.attachementsAndLinks?.length > 0
//             ? `<div style="margin-top: 16px;">
//                 ${emailBody.attachementsAndLinks
//                   .map(
//                     (item) =>
//                       `<div style="margin-bottom: 4px;"><strong>${item.name}:</strong> <a href="${item.links}" style="color: #2563eb;">${item.links}</a></div>`
//                   )
//                   .join("")}
//               </div>`
//             : ""
//         }

//         <p style="margin-top: 20px;">${emailBody?.closingAndContact?.closing}</p>

//         <div style="margin-top: 12px;">
//           <p><strong>${emailBody?.closingAndContact?.contacts?.name}</strong></p>
//           <p>${emailBody?.closingAndContact?.contacts?.phone}</p>
//           ${
//             emailBody?.closingAndContact?.contacts?.linkedin
//               ? `<p>LinkedIn: <a href="${emailBody?.closingAndContact?.contacts?.linkedin}" style="color: #2563eb;">${emailBody?.closingAndContact?.contacts?.linkedin}</a></p>`
//               : ""
//           }
//         </div>
//       </div>
//     `;

//     const mailOptions = {
//       from: `${senderName} <${emailBody.currentUserEmail}>`,
//       to: emailBody?.email,
//       subject: emailBody?.subjectLine,
//       html: htmlBody,
//       attachments: [
//         {
//           filename: "resume.pdf",
//           content: user?.resume?.buffer,
//           contentType: "application/pdf",
//         },
//       ],
//     };

//     const result = await transporter.sendMail(mailOptions);

//     console.log(result);
//     res.send(result);

//     // const token = req.session.tokens;

//     // console.log(pdfBuffer, emailBody);

//     // const resend = new Resend('your_api_key_here');

//     // const transporter = nodemailer.createTransport({
//     //   service: "gmail",
//     //   auth: {
//     //     user: process.env.EMAIL_USER,
//     //     pass: process.env.EMAIL_PASS,
//     //   },
//     // });

//     // 3. Mail options
//     //   const mailOptions = {
//     //     from: emailBody?.currentUserEmail,
//     //     to: emailBody?.email,
//     //     subject: emailBody?.subjectLine,
//     //     html: `
//     //   <div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #333;">
//     //     <p>${emailBody?.greeting}</p>
//     //     <p>${emailBody?.introduction}</p>
//     //     <p>${emailBody?.technicalSkills}</p>

//     //     ${
//     //       emailBody?.projects?.length > 0
//     //         ? `<div style="margin-top: 16px;"><strong>My Key Projects:</strong><br />
//     //             ${emailBody.projects
//     //               .map(
//     //                 (e) =>
//     //                   `<p style="margin: 4px 0;"><strong>${e.projectName}</strong>: <a href="${e.liveSite}" style="color: #2563eb;">${e.liveSite}</a></p>`
//     //               )
//     //               .join("")}
//     //           </div>`
//     //         : ""
//     //     }

//     //     <p>${emailBody?.fitInterestAndWillingnessToLearn}</p>

//     //     ${
//     //       emailBody?.attachementsAndLinks?.length > 0
//     //         ? `<div style="margin-top: 16px;">
//     //             ${emailBody.attachementsAndLinks
//     //               .map(
//     //                 (item) =>
//     //                   `<div style="margin-bottom: 4px;"><strong>${item.name}:</strong> <a href="${item.links}" style="color: #2563eb;">${item.links}</a></div>`
//     //               )
//     //               .join("")}
//     //           </div>`
//     //         : ""
//     //     }

//     //     <p style="margin-top: 20px;">${emailBody?.closingAndContact?.closing}</p>

//     //     <div style="margin-top: 12px;">
//     //       <p><strong>${emailBody?.closingAndContact?.contacts?.name}</strong></p>
//     //       <p>${emailBody?.closingAndContact?.contacts?.phone}</p>
//     //       ${
//     //         emailBody?.closingAndContact?.contacts?.linkedin
//     //           ? `<p>LinkedIn: <a href="${emailBody?.closingAndContact?.contacts?.linkedin}" style="color: #2563eb;">${emailBody?.closingAndContact?.contacts?.linkedin}</a></p>`
//     //           : ""
//     //       }
//     //     </div>
//     //   </div>
//     // `,
//     //     attachments: [
//     //       {
//     //         filename: "resume.pdf",
//     //         content: pdfBuffer,
//     //         contentType: "application/pdf",
//     //       },
//     //     ],
//     //   };

//     // 4. Send the email
//     // transporter.sendMail(mailOptions, (error, info) => {
//     //   if (error) {
//     //     console.error("❌ Error:", error);
//     //   } else {
//     //     console.log("✅ Email sent:", info.response);
//     //     res.send(info.response);
//     //   }
//     // });

//     //   try {
//     //   const response = await resend.emails.send({
//     //     from: 'you@yourdomain.com',    // Your verified sender email
//     //     to: 'recipient@example.com',
//     //     subject: 'Hello from Resend!',
//     //     html: '<p>This is a demo email sent with Resend API.</p>',
//     //   });

//     //   console.log('Email sent successfully:', response);
//     // } catch (error) {
//     //   console.error('Error sending email:', error);
//     // }
//   }
// );

app.get("/", (req: Request, res: Response) => {
  res.send("welcome to career copilot backend");
});

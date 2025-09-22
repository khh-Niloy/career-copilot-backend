import { Request, Response } from "express";
import { User } from "./user.model";
import { google } from "googleapis";
import { envVars } from "../../config";

const oAuth2Client = new google.auth.OAuth2(
  envVars.CLIENT_ID,
  envVars.CLIENT_SECRET,
  "http://localhost:8000/api/v1/user/premium/auth/callback"
);

const checkRefreshToken = async(req: Request, res: Response)=>{
    const userEmail = req.body;
    console.log("rf token email", userEmail)
    const user = await User.findOne({ email: userEmail?.email });
  console.log("ref check", user);
  // const result = await User.insertOne(userEmail);
  let isRefTokenExist = false;
  if (user?.refreshToken) {
    isRefTokenExist = true;
  }
  res.json({
    isRefTokenExist,
  });
}

const authLogin = (req: Request, res: Response)=>{
    const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // force refresh token
    // scope: ["https://www.googleapis.com/auth/gmail.send"],
    scope: [
        
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://mail.google.com/", // <-- this is full access (optional but strong)
    ],
  });
  res.redirect(url);
}

const authCallback = async(req: Request, res: Response) =>{
    const code = req.query.code;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  const profile = await gmail.users.getProfile({ userId: "me" });
  console.log("oauth2callback profile-> ", profile);

  const userEmail = profile.data.emailAddress;
  console.log("oauth2callback userEmail-> ", userEmail);
  console.log("✅ Logged in Gmail:", userEmail);

  await User.findOneAndUpdate(
    { email: userEmail },
    {
      $set: {
        // access_token: tokens.access_token,
        // access_token: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
    },
)
    res.redirect("http://localhost:3000/premium/confirmation");

}

// interface MulterRequest extends Request {
//   file: Express.Multer.File;
// }
import nodemailer from "nodemailer";


const sendEmail = async(req: Request, res: Response)=>{
  console.log("hit")
  // const reqWithFile = req as MulterRequest;
    // const pdfBuffer = reqWithFile.file.buffer;



    const { emailbody, userEmail } = req.body;
  const user = await User.findOne({ email: userEmail });

  const emailBody =  emailbody.emailBody

  // console.log(emailbody.emailBody)
  // console.log(emailbody?.greeting)

  if (!user?.refreshToken) {
    return res.status(400).json({ error: "Refresh token missing for user" });
  }

  const oAuth2Client = new google.auth.OAuth2(
    envVars.CLIENT_ID,
    envVars.CLIENT_SECRET,
    // "http://localhost:8000/oauth2callback"
  );
  oAuth2Client.setCredentials({
    refresh_token: user.refreshToken as string,
  });
  const accessToken = (await oAuth2Client.getAccessToken()).token;

  console.log("new", accessToken);

    // console.log(emailBody)

    try {
    console.log("before transporter");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "khhniloy0@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: user.refreshToken,
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
      from: `${senderName} <${"khhniloy0@gmail.com"}>`,
      to: "hasib2305341709@diu.edu.bd",
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
}


export const premiumUserController = {
    checkRefreshToken,
    authLogin,
    authCallback,
    sendEmail
}
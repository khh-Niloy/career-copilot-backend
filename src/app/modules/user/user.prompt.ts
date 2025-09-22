export const promptGemini = (resumeContent, jobDescription, formattedLinks) => {
  const prompt = `Based on my ${resumeContent} and ${formattedLinks} and the uploaded ${jobDescription}, write a short, professional, engaging and tailored email body to apply for the role [ find what job role mentioned in the ${jobDescription}, if multiple mentioned then leave like this (insert your job role) ]. The email should include:
        
        0. find the email that user will sent to for job application IMPORTANT, searhc in the ${jobDescription}.
      
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
            email: "" (please, add email where the email need to sent for apply! you can search where said send email to and then a email attached, can be bottom or middle. but If you dont find out any email where user will appy in that job description, then then give this string -> "not mentioned")
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
            myEmail: "" (please put here my email! the email of the candidate!)
          }

    `;
  return prompt;
};

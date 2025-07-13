import dotenv from "dotenv";
dotenv.config();

interface IenvVars {
  PORT: string;
  GEMINI_API_KEY: string;
  MICROSERVICE_URL: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  MONGO_URI: string;
}

const requiredEnvVars: string[] = [
  "PORT",
  "GEMINI_API_KEY",
  "MICROSERVICE_URL",
  "CLIENT_ID",
  "CLIENT_SECRET",
  "MONGO_URI",
];

const loadingEnvVars = (): IenvVars => {
  requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`env => ${key} is missing!`);
    }
  });
  return {
    PORT: process.env.PORT as string,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,
    MICROSERVICE_URL: process.env.MICROSERVICE_URL as string,
    CLIENT_ID: process.env.CLIENT_ID as string,
    CLIENT_SECRET: process.env.CLIENT_SECRET as string,
    MONGO_URI: process.env.MONGO_URI as string,
  };
};

export const envVars = loadingEnvVars();

import { Server } from "http";
import { app } from "./app";
import mongoose from "mongoose";
import { envVars } from "./app/config";

let server: Server;

async function startServer() {
  await mongoose.connect(envVars.MONGO_URI);
  console.log("✅ mongoose connected");
  server = app.listen(envVars.PORT, () => {
    console.log("server running at", envVars.PORT);
  });
}

startServer();

const gracefullyShutDown = () => {
  if (server) {
    server.close(() => {
      process.exit(0);
    });
  }
  process.exit(1);
};

process.on("unhandledRejection", (err) => {
  console.log("unhandledRejection error occured", err);
  gracefullyShutDown();
});

process.on("uncaughtException", (err) => {
  console.log("uncaughtException error occured", err);
  gracefullyShutDown();
});

process.on("SIGTERM", () => {
  console.log("SIGTERM error occured");
  gracefullyShutDown();
});

process.on("SIGINT", () => {
  gracefullyShutDown();
});

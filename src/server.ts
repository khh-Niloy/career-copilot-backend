import { app } from "./app";
import mongoose from "mongoose";

async function server() {
  await mongoose.connect(`${process.env.MONGO_URI}`);
  console.log("mongoose connected");
  app.listen(8000, () => {
    console.log("server running at 8000");
  });
}

server();

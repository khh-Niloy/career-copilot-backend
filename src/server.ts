import { app } from "./app";

async function server() {
  app.listen(8000, () => {
    console.log("server running at 8000");
  });
}

server();

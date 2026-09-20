import express from "express";
import Subdomain from "./controllers/controller.js";
import "./env.js";
const app = express();
app.set("trust proxy", true);

// Catch ALL requests and forward to S3
app.use("/",Subdomain);
//like id.zellr.app
const port = Number(process.env.PORT) || 3001;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Request handler listening on http://127.0.0.1:${port}`);
});
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the other process (lsof -nP -iTCP:${port} -sTCP:LISTEN) or set PORT.`);
    process.exit(1);
  }
  throw error;
});

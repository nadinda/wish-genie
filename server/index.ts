import express from "express";
import dotenv from "dotenv";

const app = express();
dotenv.config();

// routes
app.get("/", (_, res) => {
  res.send("What's up doc ?!");
});

// start the server
app.listen(process.env.DEV_PORT, () => {
  console.log(
    `server running : http://${process.env.DEV_HOST}:${process.env.DEV_PORT}`
  );
});

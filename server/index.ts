import express from "express";
import dotenv from "dotenv";
import path from "path";

const app = express();
dotenv.config();

// Configure Express to use EJS
app.set("views", path.join("./src/", "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));

// define a route handler for the default home page
app.get("/", (_, res) => {
  // render the index template
  res.render("index");
});

// start the server
app.listen(process.env.DEV_PORT, () => {
  console.log(
    `server running : http://${process.env.DEV_HOST}:${process.env.DEV_PORT}`
  );
});

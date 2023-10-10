import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./database/db.js";
import Item from "./models/itemModel.js";

const app = express();
dotenv.config();

// Configure Express to use EJS
app.set("views", path.join("./src/", "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());

// define a route handler for the default home page
app.get("/", (_, res) => {
  // render the index template
  res.render("index");
});

app.get("/addItem", (_, res) => {
  res.render("addItem");
});

app.get("/profile", async (_, res) => {
  const items = await Item.find({}).exec();
  res.render("profile", { items: items });
});

app.post("/addItem", async (req, res) => {
  const newItem = Object.assign(new Item(), req.body);
  const savedItem = await newItem.save();
  res.redirect("/item/" + savedItem.id);
});

// start the server
app.listen(process.env.DEV_PORT, () => {
  console.log(
    `server running : http://${process.env.DEV_HOST}:${process.env.DEV_PORT}`
  );
});

connectDB();

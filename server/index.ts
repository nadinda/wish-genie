import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";
import { connectDB } from "./database/db.js";
import Item from "./models/itemModel.js";
import User from "./models/userModel.js";
import "./types.js";

const app = express();
dotenv.config();

// Configure Express to use EJS
app.set("views", path.join("./src/", "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: `${process.env.SESSION_SECRET}` }));

function restrict(req: Request, res: Response, next: NextFunction) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/signin");
  }
}

// define a route handler for the default home page
app.get("/", (_, res) => {
  // render the index template
  res.render("index");
});

app.get("/addItem", (_, res) => {
  res.render("addItem");
});

app.get("/signup", (_, res) => {
  res.render("signup");
});

app.get("/signin", (_, res) => {
  res.render("signin");
});

app.get("/profile", restrict, async (_, res) => {
  const items = await Item.find({}).exec();
  res.render("profile", { items: items });
});

app.post("/addItem", async (req, res) => {
  const newItem = Object.assign(new Item(), req.body);
  const savedItem = await newItem.save();
  res.redirect("/item/" + savedItem.id);
});

app.post("/signup", async (req, res) => {
  const newUser = new User({
    fullName: req.body.fullName,
    userName: req.body.userName,
    email: req.body.email,
    bio: req.body.bio,
  });

  newUser.password = await newUser.createHash(req.body.password);
  const savedUser = await newUser.save();
  res.redirect("/user/" + savedUser.id);
});

app.post("/signin", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });

  if (user === null) {
    return res.status(400).json({ message: "User not found." });
  } else {
    if (await user.validatePassword(req.body.password)) {
      req.session.user = user;
      return res.redirect("/profile");
    } else {
      return res.status(400).json({ message: "User not found." });
    }
  }
});

app.post("/signout", async (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(400).json({ message: "Unable to sign out" });
      } else {
        return res.redirect("/");
      }
    });
  }
});

// start the server
app.listen(process.env.DEV_PORT, () => {
  console.log(
    `server running : http://${process.env.DEV_HOST}:${process.env.DEV_PORT}`
  );
});

connectDB();

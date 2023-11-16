import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";
import mongoose from "mongoose";
import { connectDB } from "./database/db.js";
import Item from "./models/itemModel.js";
import User, { IUser } from "./models/userModel.js";
import "./types.js";
import { generateRandomString } from "./utilities/util.js";

const app = express();
dotenv.config();

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

app.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

app.get("/addItem", (req, res) => {
  res.render("addItem", { user: req.session.user });
});

app.get("/signup", (_, res) => {
  res.render("signup");
});

app.get("/signin", (_, res) => {
  res.render("signin");
});

app.get("/profile", restrict, async (req, res) => {
  const items = await Item.find({ ownerId: req.session.user?._id });
  const userId = new mongoose.Types.ObjectId(req.session.user?._id);

  const giftedAmounts = await Item.aggregate()
    .match({
      "gifters.gifterId": userId,
    })
    .unwind("$gifters")
    .group({
      _id: null,
      total: { $sum: "$gifters.amount" },
    });

  res.render("profile", {
    items: items,
    user: req.session.user,
    loggedInUser: req.session.user,
    isMyProfile: true,
    totalGiftedAmount: giftedAmounts[0] ? giftedAmounts[0].total : 0,
  });
});

app.get("/user/:username", async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.params.username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const items = await Item.find({ ownerId: user?._id });

    const giftedAmounts = await Item.aggregate()
      .match({
        "gifters.gifterId": user?._id,
      })
      .unwind("$gifters")
      .group({
        _id: null,
        total: { $sum: "$gifters.amount" },
      });

    res.render("profile", {
      items: items,
      user: user,
      loggedInUser: req.session.user,
      isMyProfile: false,
      totalGiftedAmount: giftedAmounts[0] ? giftedAmounts[0].total : 0,
    });
  } catch (error) {
    console.error(error);
    res.send("Error: Account not found.");
  }
});

app.get("/account/edit", restrict, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.user?._id });
    res.render("editAccount", { user: user });
  } catch (error) {
    console.error(error);
    res.send("Error: Account not found.");
  }
});

app.get("/items/:id", restrict, async (req, res) => {
  const item = await Item.findOne({
    _id: req.params.id,
  });

  const gifters = await User.aggregate()
    .match({ _id: { $in: item?.gifters.map((gifter) => gifter.gifterId) } })
    .group({
      _id: null,
      gifters: {
        $push: { userName: "$userName", avatarUrl: "$avatarUrl" },
      },
    });

  res.render("viewItem", {
    item: item,
    gifters: gifters[0] ? gifters[0].gifters : [],
    user: req.session.user,
  });
});

app.get("/items/:id/edit", restrict, async (req, res) => {
  const item = await Item.findOne({
    _id: req.params.id,
  });
  res.render("editItem", { item: item, user: req.session.user });
});

app.post("/addItem", async (req, res) => {
  const newItem = Object.assign(new Item({ currentAmount: 0 }), req.body);
  if (req.session.user) {
    newItem.ownerId = req.session.user._id;
  } else {
    const randomString = generateRandomString(6);
    const newUser = new User({
      email: req.body.email,
      fullName: "User " + randomString,
      userName: "user" + randomString,
      avatarUrl: "https://robohash.org/default",
    });
    newUser.password = await newUser.createHash(
      `${process.env.NEW_USER_DEFAULT_PASSWORD}`
    );
    newItem.ownerId = await newUser.save();
    req.session.user = newUser;
  }

  try {
    await newItem.save();
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.send("Error: No item was saved.");
  }
});

app.post("/items/:id/edit", restrict, async (req, res) => {
  try {
    await Item.findOneAndUpdate(
      {
        _id: req.params.id,
        ownerId: req.session.user?._id,
      },
      req.body
    );
    res.redirect(`/profile`);
  } catch (error) {
    console.error(error);
    res.send("Error: The item was not updated.");
  }
});

app.post("/items/:id/delete", restrict, async (req, res) => {
  try {
    await Item.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.session.user?._id,
    });
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.send("Error: No item was deleted.");
  }
});

app.post("/items/:id/gift", restrict, async (req, res) => {
  const item = await Item.findOne({
    _id: req.params.id,
  });

  if (!item) return res.status(404).json({ message: "Item not found." });

  if (!item.currentAmount) {
    item.currentAmount = 0;
  }

  item.currentAmount += +req.body.giftAmount;

  if (item.currentAmount > item.targetAmount) {
    return res.status(400).json({ message: "Item Price is exceeded" });
  }

  item?.gifters.push({
    gifterId: req.session.user?._id!,
    amount: req.body.giftAmount,
  });

  try {
    await item.save();
    res.redirect(`/items/${item._id}`);
  } catch (error) {
    console.error(error);
    res.send("Error: No item was saved.");
  }
});

app.post("/signup", async (req, res) => {
  const newUser = new User({
    fullName: req.body.fullName,
    userName: req.body.userName,
    email: req.body.email,
    bio: req.body.bio,
    avatarUrl: "https://robohash.org/default",
  });

  newUser.password = await newUser.createHash(req.body.password);
  await newUser.save();
  res.redirect("/signin");
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

app.post("/account/edit", restrict, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.user?._id });

    const updatedUserData: Partial<IUser> = {
      fullName: req.body.fullName,
      userName: req.body.userName,
      email: req.body.email,
      bio: req.body.bio,
    };

    if (req.body.password) {
      updatedUserData.password = await user?.createHash(req.body.password);
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.session.user?._id,
      },
      updatedUserData,
      { new: true }
    );

    if (updatedUser) {
      req.session.user = updatedUser;
    }

    res.redirect(`/profile`);
  } catch (error) {
    console.error(error);
    res.send("Error: Account data was not updated.");
  }
});

// start the server
app.listen(process.env.DEV_PORT, () => {
  console.log(
    `server running : http://${process.env.DEV_HOST}:${process.env.DEV_PORT}`
  );
});

connectDB();

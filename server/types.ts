import { IUser } from "./models/userModel.js";

declare module "express-session" {
  interface SessionData {
    user: IUser;
  }
}

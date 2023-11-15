import mongoose from "mongoose";
import argon2 from "argon2";

export interface IUser extends Document {
  _id: string | undefined;
  role: string;
  fullName: string;
  userName: string;
  email: string;
  password: string;
  bio: string;
  avatarUrl: string;
  createHash(plainTextPassword: string): Promise<string>;
  validatePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  //_id: mongoose.Schema.Types.ObjectId,
  role: { type: String },
  fullName: { type: String, required: true },
  userName: { type: String, required: true, index: { unique: true } },
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  bio: { type: String },
  avatarUrl: { type: String },
});

userSchema.methods.createHash = async function (plainTextPassword: string) {
  return await argon2.hash(plainTextPassword);
};

userSchema.methods.validatePassword = async function (
  candidatePassword: string
) {
  return await argon2.verify(this.password, candidatePassword);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;

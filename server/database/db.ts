import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async () => {
  console.log("connecting to MongoDB");
  mongoose.set("strictQuery", true);
  await mongoose
    .connect(`${process.env.MONGO_URL}`)
    .then(() => console.log("💽 Database connected"))
    .catch((error) => console.error(error));
};

export { connectDB };

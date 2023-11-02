import mongoose, { Types } from "mongoose";

export interface IItem extends Document {
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  productUrl: string;
  status: "open" | "claimed" | "received";
  ownerId: Types.ObjectId;
  gifters: Array<{ amount: number; gifterId: Types.ObjectId | string }>;
}

const itemSchema = new mongoose.Schema({
  //_id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  description: { type: String },
  targetAmount: { type: Number },
  currentAmount: { type: Number },
  productUrl: { type: String },
  status: { type: String },
  ownerId: {
    type: Types.ObjectId,
    ref: "User",
  },
  gifters: [
    {
      amount: { type: Number },
      gifterId: { type: Types.ObjectId, ref: "User" },
    },
  ],
});

const Item = mongoose.model<IItem>("Item", itemSchema);

export default Item;

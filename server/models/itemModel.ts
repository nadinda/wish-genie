import mongoose from "mongoose";

export interface IItem extends Document {
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  product_url: string;
  status: "open" | "claimed" | "received";
}

const itemSchema = new mongoose.Schema({
  //_id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  description: { type: String },
  target_amount: { type: Number },
  current_amount: { type: Number },
  product_url: { type: String },
  status: { type: String },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Item = mongoose.model<IItem>("Item", itemSchema);

export default Item;

import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  saleNumber: { type: String, required: true, unique: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  items: [
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    subProductId: { type: mongoose.Schema.Types.ObjectId, ref: "SubProduct" },
    name: String,
    price: Number,
    quantity: Number,
    total: Number,
  }
],
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: false },
  subtotal: { type: Number, required: false },
  tax: { type: Number, required: false },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: false },
  paymentMethod: {
    type: String,
    required: false,
    enum: ["cash", "card", "qr"],
  },
  amountPaid: { type: Number, required: false },
  change: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["completed", "refunded","pending"],
    default: "completed",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Sale", saleSchema);

import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    type: {
      type: String,
      enum: ["in", "out", "adjustment"],
      required: true
    },
    quantity: { type: Number, required: true },
    reason: { type: String },
    reference: { type: String },
    previousStock: { type: Number, default: 0 },
    newStock: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("StockMovement", stockMovementSchema);

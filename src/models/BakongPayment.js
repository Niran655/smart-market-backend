// models/BakongPayment.js
import mongoose from "mongoose";

const BakongPaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    currency: { type: String, default: "KHR" },
    billNumber: { type: String }, // unique invoice/order number
    khqrString: { type: String }, // EMV QR data
    qrImage: { type: String }, // base64 image
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    reference: { type: String }, // transaction reference from Bakong
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("BakongPayment", BakongPaymentSchema);

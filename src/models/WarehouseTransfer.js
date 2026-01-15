// models/WarehouseTransfer.js
import mongoose from "mongoose";

const TransferItemSchema = new mongoose.Schema({
  subProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubProduct",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const WarehouseTransferSchema = new mongoose.Schema(
  {
    fromWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    toShop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    items: [TransferItemSchema],
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    note: String,
    acceptedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("WarehouseTransfer", WarehouseTransferSchema);

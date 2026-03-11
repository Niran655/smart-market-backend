import mongoose from "mongoose";

const warehouseRequestSchema = new mongoose.Schema(
  {
    fromWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    toWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    items: [
      {
        subProduct: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SubProduct",
          required: true,
        },
        requestedQty: { type: Number, required: true },
        approvedQty: { type: Number, default: 0 },
        receivedQty: { type: Number, default: 0 },
      },
    ],

    status: {
      type: String,
      enum: ["REQUESTED", "APPROVED", "DELIVERED", "RECEIVED", "REJECTED"],
      default: "REQUESTED",
    },

    remark: String,

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,
    receivedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("WarehouseRequest", warehouseRequestSchema);
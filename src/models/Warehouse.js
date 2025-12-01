import mongoose from "mongoose";

const WarehouseSchema = new mongoose.Schema(
  {
    subProduct: { type: mongoose.Schema.Types.ObjectId, ref: "SubProduct" },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Warehouse", WarehouseSchema);

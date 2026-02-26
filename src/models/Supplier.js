import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    nameKh: { type: String, required: true },
    nameEn: { type: String, required: true },
    remark: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", supplierSchema);
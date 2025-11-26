import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    shopIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shop" }],
    nameKh: { type: String },
    nameEn: { type: String },
    image: { type: String },
    type: { type: String },
    stock: { type: Number, default: 0 },
    minStock: { type: Number },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
    remark: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
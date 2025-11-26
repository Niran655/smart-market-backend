import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
  image : { type: String },
  nameKh: { type: String, required: true },
  nameEn: { type: String, required: true },
  remark: { type: String, required: false },
  active: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Category", categorySchema);

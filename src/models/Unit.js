import mongoose from "mongoose";

const unitSchema = mongoose.Schema({
  nameKh: { type: String, required: true },
  nameEn: { type: String, required: true },
  remark: { type: String, required: true },
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

export default mongoose.model("Unit", unitSchema);

import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  nameKh: { type: String, required: false },
  nameEn: { type: String, required: false },
  code: { type: String, required: false },
  image: { type: String, required: false },
  type: { type: String, required: false },
  remark: { type: String, required: false },
  address: { type: String, required: false },
  platform: [
    {
      platform: { type: String, required: false },
      name: { type: String, required: false },
      url: { type: String, required: false },
    },
  ],
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  active: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Shop", shopSchema);

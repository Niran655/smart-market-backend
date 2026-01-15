import bcrypt from "bcryptjs";
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  nameKh: String,
  nameEn: String,
  phone: String,
  image: String,
  gender: { type: String, enum: ["male", "female"] },
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    required: false,
    enum: ["superAdmin", "admin", "manager", "cashier", "stockController"],
    default: "cashier",
  },
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

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);

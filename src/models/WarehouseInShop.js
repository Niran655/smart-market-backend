import mongoose from "mongoose";

const warehouseInShop = new mongoose.Schema({
  shop: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shop" }],
  subProduct: { type: mongoose.Schema.Types.ObjectId, ref: "SubProduct" },
  stock: {type: Number, required: false},
  minStock: {type: Number, required: false},
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("WarehouseInShop", warehouseInShop);

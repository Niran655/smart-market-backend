import mongoose from "mongoose";


const subProductSchema = new mongoose.Schema(
  {
    // ==================== information ====================
   saleType: {
    type: String,
    enum: ["retail", "wholesale"], 
    required: false
  },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref:'Unit' }, 

    qty: { type: Number, default: 0 },

    barCode: { type: String },

    productDes: { type: String },

    productImg: { type: String },

    using: { type: Boolean, default: false },

    check: { type: Boolean, default: false },

    sell: { type: Boolean, default: false },

    shopId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shop" }],

    // ======================= price ========================
    servicePrice: { type: Number, default: 0 },

    salePrice: { type: Number, default: 0 },

    taxRate: { type: Number, default: 0 },

    costPrice: { type: Number, default: 0 },

    priceImg: { type: String }, 

    totalPrice: { type: Number, default: 0 },

    priceDes: { type: String },

    parentProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SubProduct", subProductSchema);

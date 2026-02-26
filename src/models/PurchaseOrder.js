import mongoose from "mongoose";

const PurchaseOrderItemSchema = new mongoose.Schema(
    {
        subProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubProduct",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        costPrice: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        receivedQty: {
            type: Number,
            default: 0,
        },
        remainingQty: {
            type: Number,
            default: function () {
                return this.quantity;
            },
        },
    },
    { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
    {
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true,
        },
        items: [PurchaseOrderItemSchema],
        totalAmount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["pending", "partial_received", "received", "cancelled"],
            default: "pending",
        },
        remark: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        receivedAt: Date,
    },
    { timestamps: true }
);

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
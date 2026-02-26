import mongoose from "mongoose";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Warehouse from "../models/Warehouse.js";
import StockMovement from "../models/StockMovement.js";
import paginateQuery from "../utils/paginateQuery.js";
import { requireAuth } from "./auth.js";

export const purchaseOrderResolver = {
    Mutation: {

        createPurchaseOrder: async (_, { input }, { user }) => {
            requireAuth(user);
            try {
                const { supplierId, items, remark } = input;

                let totalAmount = 0;

                const formattedItems = items.map((item) => {
                    const totalPrice = item.quantity * item.costPrice;
                    totalAmount += totalPrice;

                    return {
                        subProduct: item.subProductId,
                        quantity: item.quantity,
                        costPrice: item.costPrice,
                        totalPrice,
                        receivedQty: 0,
                        remainingQty: item.quantity,
                    };
                });

                await PurchaseOrder.create({
                    supplier: supplierId,
                    items: formattedItems,
                    totalAmount,
                    remark,
                    createdBy: user?._id,
                });

                return {
                    isSuccess: true,
                    message: {
                        messageEn: "Purchase order created successfully",
                        messageKh: "បានបង្កើតបញ្ជាទិញទំនិញដោយជោគជ័យ",
                    },
                };
            } catch (error) {
                console.error(error);
                return {
                    isSuccess: false,
                    message: {
                        messageEn: "Failed to create purchase order",
                        messageKh: "បរាជ័យក្នុងការបង្កើតបញ្ជាទិញ",
                    },
                };
            }
        },

        updatePurchaseOrder: async (_, { _id, input }, { user }) => {
            try {
                const po = await PurchaseOrder.findById(_id);
                if (!po) throw new Error("Purchase order not found");

                // ❌ Do NOT allow update if already received
                if (["received", "partial_received"].includes(po.status)) {
                    throw new Error("Cannot update received purchase order");
                }

                const { supplierId, items, remark } = input;

                if (supplierId) po.supplier = supplierId;
                if (remark !== undefined) po.remark = remark;

                // ================= UPDATE ITEMS =================
                if (items && items.length > 0) {
                    let totalAmount = 0;

                    po.items = items.map((item) => {
                        const totalPrice = item.quantity * item.costPrice;
                        totalAmount += totalPrice;

                        return {
                            subProduct: item.subProductId,
                            quantity: item.quantity,
                            costPrice: item.costPrice,
                            totalPrice,
                            receivedQty: 0,
                            remainingQty: item.quantity,
                        };
                    });

                    po.totalAmount = totalAmount;
                }

                await po.save();

                return {
                    isSuccess: true,
                    message: {
                        messageEn: "Purchase order updated successfully",
                        messageKh: "បានកែប្រែបញ្ជាទិញដោយជោគជ័យ",
                    },
                };
            } catch (error) {
                console.error(error);
                return {
                    isSuccess: false,
                    message: {
                        messageEn: error.message || "Failed to update purchase order",
                        messageKh: "បរាជ័យក្នុងការកែប្រែបញ្ជាទិញ",
                    },
                };
            }
        },

        // ================= CANCEL PURCHASE ORDER =================
        cancelPurchaseOrder: async (_, { _id, reason }, { user }) => {
            try {
                const po = await PurchaseOrder.findById(_id);
                if (!po) throw new Error("Purchase order not found");

                // ❌ Do NOT allow cancel if already received
                if (po.status === "received") {
                    throw new Error("Cannot cancel a received purchase order");
                }

                po.status = "cancelled";
                po.remark = reason || po.remark;

                await po.save();

                return {
                    isSuccess: true,
                    message: {
                        messageEn: "Purchase order cancelled successfully",
                        messageKh: "បានលុបបញ្ជាទិញដោយជោគជ័យ",
                    },
                };
            } catch (error) {
                console.error(error);
                return {
                    isSuccess: false,
                    message: {
                        messageEn: error.message || "Failed to cancel purchase order",
                        messageKh: "បរាជ័យក្នុងការលុបបញ្ជាទិញ",
                    },
                };
            }
        },



        receivePurchaseOrder: async (_, { purchaseOrderId, items }, { user }) => {
            try {
                const po = await PurchaseOrder.findById(purchaseOrderId);
                if (!po) throw new Error("Purchase order not found");

                let fullyReceived = true;

                for (const inputItem of items) {
                    const poItem = po.items.find(
                        (i) =>
                            i.subProduct.toString() === inputItem.subProductId.toString()
                    );

                    if (!poItem) continue;

                    poItem.receivedQty += inputItem.receivedQty;
                    poItem.remainingQty =
                        poItem.quantity - poItem.receivedQty;

                    if (poItem.remainingQty > 0) {
                        fullyReceived = false;
                    }


                    const warehouse = await Warehouse.findOne({
                        subProduct: poItem.subProduct,
                    });

                    if (warehouse) {
                        warehouse.stock += inputItem.receivedQty;
                        await warehouse.save();
                    } else {
                        await Warehouse.create({
                            subProduct: poItem.subProduct,
                            stock: inputItem.receivedQty,
                        });
                    }


                    await StockMovement.create({
                        user: user?._id,
                        subProduct: poItem.subProduct,
                        type: "in",
                        quantity: inputItem.receivedQty,
                        reason: "Purchase Order",
                        reference: po._id,
                    });
                }

                po.status = fullyReceived
                    ? "received"
                    : "partial_received";
                po.receivedBy = user?._id;
                po.receivedAt = new Date();

                await po.save();

                return {
                    isSuccess: true,
                    message: {
                        messageEn: "Purchase order received successfully",
                        messageKh: "បានទទួលទំនិញពីបញ្ជាទិញដោយជោគជ័យ",
                    },
                };
            } catch (error) {
                console.error(error);
                return {
                    isSuccess: false,
                    message: {
                        messageEn: "Failed to receive purchase order",
                        messageKh: "បរាជ័យក្នុងការទទួលទំនិញ",
                    },
                };
            }
        },
    },

    Query: {

        getPurchaseOrdersWithPagination: async (
            _,
            { supplierId, status, page = 1, limit = 10, pagination = true, keyword = "" },
            { user }
        ) => {
            requireAuth(user);
            try {
                const query = {
                    ...(supplierId ? { supplier: supplierId } : {}),
                    ...(status ? { status } : {}),
                };
                if (keyword) {
                    query.$or = [
                        { "supplier.nameEn": { $regex: keyword, $options: "i" } },
                        { "supplier.nameKh": { $regex: keyword, $options: "i" } },
                    ];
                }

                const paginationQuery = await paginateQuery({
                    model: PurchaseOrder,
                    query,
                    page,
                    limit,
                    pagination,
                    populate: [
                        {
                            path: "supplier",
                        },
                        {
                            path: "items.subProduct",
                            populate: [
                                {
                                    path: "parentProductId",
                                    populate: {
                                        path: "categoryId",
                                    },
                                },
                                {
                                    path: "unitId",
                                },
                            ],
                        },
                        {
                            path: "createdBy",
                        },
                        {
                            path: "receivedBy",
                        },
                    ]
                });
                return {
                    data: paginationQuery?.data,
                    paginator: paginationQuery?.paginator,
                }
            } catch (error) {

                console.error("Error in getPurchaseOrdersWithPagination:", error);
                throw new Error("Failed to fetch purchase orders");
            }


        },
    },
};
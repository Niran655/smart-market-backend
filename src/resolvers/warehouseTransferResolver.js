

import Warehouse from "../models/Warehouse.js";
import WarehouseTransfer from "../models/WarehouseTransfer.js";
import StockMovement from "../models/StockMovement.js";
import WarehouseInShop from "../models/WarehouseInShop.js";
import SubProduct from "../models/SubProduct.js";
import { errorResponse, successResponse } from "../utils/response.js";
import paginateQuery from "../utils/paginateQuery.js";

const requireAuth = (user) => {
    if (!user) throw new Error("Authentication required");
};

export const warehouseTransferResolver = {
    Query: {
        getWarehouseTransfersWithPagination: async (_, { page = 1, limit = 5, pagination = true, keyword = "", status, shopId }) => {

            try {
                const query = {
                    ...(status ? { status } : {}),
                    ...(shopId ? { toShop: shopId } : {})
                }

                const paginationQuery = await paginateQuery({
                    model: WarehouseTransfer,
                    query,
                    page,
                    limit,
                    keyword,
                    pagination,
                    populate: [
                        {
                            path: "items.subProduct",
                            populate: [
                                "unitId", "parentProductId"
                            ]
                        },
                        "toShop",
                        "requestedBy",
                        "acceptedBy"

                    ]

                });
                return {
                    data: paginationQuery?.data,
                    paginator: paginationQuery?.paginator
                }
            } catch (error) {
                console.log("error", error)
            }
            //   const query = {
            //     ...(status ? { status } : {}),
            //     ...(shopId ? { toShop: shopId } : {}),
            //   };
            // const transfers = await WarehouseTransfer.find(query)
            //     .sort({ createdAt: -1 })
            //     .populate({ path: "items.subProduct", populate: ["unitId", "parentProductId"] })
            //     .populate("toShop")
            //     .populate("requestedBy")
            //     .populate("acceptedBy");
            // return transfers;
        },

        getWarehouseTransferById: async (_, { _id }) => {
            const tr = await WarehouseTransfer.findById(_id)
                .populate({ path: "items.subProduct", populate: ["unitId", "parentProductId"] })
                .populate("toShop")
                .populate("requestedBy")
                .populate("acceptedBy");
            return tr;
        },
    },
    Mutation: {
        createWarehouseTransfer: async (_, { input }, { user }) => {
            try {
                requireAuth(user);
                const { toShopIds, items, note } = input;


                if (!items || items.length === 0) {
                    return errorResponse("No items to transfer", "មិនមានទំនិញត្រូវផ្ទេរ");
                }
                if (!toShopIds || toShopIds.length === 0) {
                    return errorResponse("No destination shops selected", "មិនបានជ្រើសរើសហាងគោលដៅ");
                }


                const totalBySub = new Map();
                for (const it of items) {
                    const totalQty = (totalBySub.get(it.subProductId) || 0) + it.quantity * toShopIds.length;
                    totalBySub.set(it.subProductId, totalQty);
                }


                for (const [subProductId, totalQty] of totalBySub.entries()) {
                    const wh = await Warehouse.findOne({ subProduct: subProductId });
                    if (!wh || wh.stock < totalQty) {
                        return errorResponse("Not enough stock in main warehouse for multi-shop transfer", "ស្តុកមិនគ្រប់គ្រាន់សម្រាប់ផ្ទេរទៅហាងជាច្រើន");
                    }
                }


                for (const [subProductId, totalQty] of totalBySub.entries()) {
                    const wh = await Warehouse.findOne({ subProduct: subProductId });
                    const previousStock = wh.stock;
                    wh.stock = previousStock - totalQty;
                    await wh.save();

                    await StockMovement.create({
                        user: user._id,
                        subProduct: subProductId,
                        type: "out",
                        quantity: totalQty,
                        reason: "Transfer to multiple shops",
                        reference: "TRANSFER_PENDING",
                        previousStock,
                        newStock: wh.stock,
                    });
                }


                const transfers = [];
                for (const shopId of toShopIds) {
                    const tr = await WarehouseTransfer.create({
                        toShop: shopId,
                        items: items.map((i) => ({ subProduct: i.subProductId, quantity: i.quantity })),
                        requestedBy: user._id,
                        note,
                        status: "pending",
                    });
                    transfers.push(tr);
                }

                return successResponse("Transfers created successfully", "បង្កើតការផ្ទេរត្រូវបានជោគជ័យ", { transfers });
            } catch (e) {
                return errorResponse(e.message || "Failed to create transfer");
            }
        },

        acceptWarehouseTransfer: async (_, { transferId }, { user }) => {
            try {
                requireAuth(user);
                const transfer = await WarehouseTransfer.findById(transferId);
                if (!transfer) return errorResponse("Transfer not found", "រកមិនឃើញការផ្ទេរ");
                if (transfer.status !== "pending") {
                    return errorResponse("Transfer already processed", "ការផ្ទេរបានដំណើរការហើយ");
                }


                for (const item of transfer.items) {
                    const sId = item.subProduct.toString();

                    const sub = await SubProduct.findById(sId);

                    let shopWh = await WarehouseInShop.findOne({ shop: transfer.toShop, subProduct: sId });
                    if (!shopWh) {
                        shopWh = await WarehouseInShop.create({ shop: [transfer.toShop], subProduct: sId, stock: 0, minStock: 0 });
                    }
                    const previousStock = shopWh.stock || 0;
                    shopWh.stock = previousStock + item.quantity;
                    await shopWh.save();

                    await StockMovement.create({
                        shop: transfer.toShop,
                        user: user._id,
                        product: sub?.parentProductId,
                        subProduct: sId,
                        type: "in",
                        quantity: item.quantity,
                        reason: "Accept transfer",
                        reference: transfer._id.toString(),
                        previousStock,
                        newStock: shopWh.stock,
                    });
                }

                transfer.status = "accepted";
                transfer.acceptedBy = user._id;
                transfer.acceptedAt = new Date();
                await transfer.save();

                return successResponse("Transfer accepted", "ទទួលការផ្ទេរ");
            } catch (e) {
                return errorResponse(e.message || "Failed to accept transfer");
            }
        },

        rejectWarehouseTransfer: async (_, { transferId, reason }, { user }) => {
            try {
                requireAuth(user);
                const transfer = await WarehouseTransfer.findById(transferId);
                if (!transfer) return errorResponse("Transfer not found", "រកមិនឃើញការផ្ទេរ");
                if (transfer.status !== "pending") {
                    return errorResponse("Transfer already processed", "ការផ្ទេរបានដំណើរការហើយ");
                }


                for (const item of transfer.items) {
                    const wh = await Warehouse.findOne({ subProduct: item.subProduct });
                    if (!wh) {

                        continue;
                    }
                    const previousStock = wh.stock;
                    wh.stock = previousStock + item.quantity;
                    await wh.save();

                    await StockMovement.create({
                        user: user._id,
                        subProduct: item.subProduct,
                        type: "in",
                        quantity: item.quantity,
                        reason: reason || "Reject transfer",
                        reference: transfer._id.toString(),
                        previousStock,
                        newStock: wh.stock,
                    });
                }

                transfer.status = "rejected";
                await transfer.save();

                return successResponse("Transfer rejected", "បដិសេធការផ្ទេរ");
            } catch (e) {
                return errorResponse(e.message || "Failed to reject transfer");
            }
        },
    },
}; 
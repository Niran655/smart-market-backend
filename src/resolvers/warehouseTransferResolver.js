 

import Warehouse from "../models/Warehouse.js";
import WarehouseTransfer from "../models/WarehouseTransfer.js";
import StockMovement from "../models/StockMovement.js";
import WarehouseInShop from "../models/WarehouseInShop.js";
import SubProduct from "../models/SubProduct.js";
import { errorResponse, successResponse } from "../utils/response.js";

const requireAuth = (user) => {
  if (!user) throw new Error("Authentication required");
};

export const warehouseTransferResolver = {
  Query: {
    getWarehouseTransfers: async (_, { status, shopId }) => {
      const query = {
        ...(status ? { status } : {}),
        ...(shopId ? { toShop: shopId } : {}),
      };
      const transfers = await WarehouseTransfer.find(query)
        .sort({ createdAt: -1 })
        .populate({ path: "items.subProduct", populate: ["unitId", "parentProductId"] })
        .populate("toShop")
        .populate("requestedBy")
        .populate("acceptedBy");
      return transfers;
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
        const { toShopId, items, note } = input;


        if (!items || items.length === 0) {
          return errorResponse("No items to transfer", "មិនមានទំនិញត្រូវផ្ទេរ");
        }

         
        for (const it of items) {
          const wh = await Warehouse.findOne({ subProduct: it.subProductId });
          if (!wh || wh.stock < it.quantity) {
            return errorResponse("Not enough stock in main warehouse", "មិនមានស្តុកគ្រប់គ្រាន់នៅឃ្លាំងមេ");
          }
        }

        
        for (const it of items) {
          const wh = await Warehouse.findOne({ subProduct: it.subProductId });
          const previousStock = wh.stock;
          wh.stock = previousStock - it.quantity;
          await wh.save();

          await StockMovement.create({
            user: user._id,
            subProduct: it.subProductId,
            type: "out",
            quantity: it.quantity,
            reason: "Transfer to shop",
            reference: "TRANSFER_PENDING",
            previousStock,
            newStock: wh.stock,
          });
        }

        const transfer = await WarehouseTransfer.create({
          toShop: toShopId,
          items: items.map((i) => ({ subProduct: i.subProductId, quantity: i.quantity })),
          requestedBy: user._id,
          note,
          status: "pending",
        });

        return successResponse("Transfer created successfully", "បង្កើតការផ្ទេរបានជោគជ័យ", { transfer });
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
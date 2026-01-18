// import { requireRole } from "../auth.js";
import WarehouseInShop from "../models/WarehouseInShop.js";
import StockMovement from "../models/StockMovement.js";
import SubProduct from "../models/SubProduct.js";
import Warehouse from "../models/Warehouse.js";
import { errorResponse, successResponse } from "../utils/response.js";
import Sale from "../models/Sale.js";

const generateSaleNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `S-${datePart}-${rand}`;
};

export const saleResolvers = {
  Mutation: {
    createSale: async (_, { input }, { user }) => {
      try {
        if (!input?.shopId) {
          return errorResponse("shopId is required");
        }

        if (!input?.items || input.items.length === 0) {
          return errorResponse("Sale items are required");
        }

        const saleNumber = generateSaleNumber();
        const userId = user?._id || null;

        const sale = new Sale({
          ...input,
          saleNumber,
          shopId: input.shopId,
          user: userId,
        });

        await sale.save();

        for (const item of input.items) {
          const subProduct = await SubProduct.findById(item.subProductId);
          if (!subProduct) {
            return errorResponse("SubProduct not found");
          }

          //  SHOP STOCK ONLY
          const warehouseInShop = await WarehouseInShop.findOne({
            shop: input.shopId,
            subProduct: subProduct._id,
          });

          if (!warehouseInShop) {
            return errorResponse("Stock not found in this shop");
          }

          const previousStock = warehouseInShop.stock || 0;
          const newStock = previousStock - item.quantity;

          if (newStock < 0) {
            return {
              isSuccess: false,
              message: {
                messageEn: "Not enough stock in shop",
                messageKh: "ស្តុកនៅហាងមិនគ្រប់គ្រាន់",
              },
            };
          }

          //  Update shop stock
          warehouseInShop.stock = newStock;
          warehouseInShop.updatedAt = new Date();
          await warehouseInShop.save();

          //  Stock movement (shop-based)
          await StockMovement.create({
            shop: input.shopId,
            user: userId,
            product: subProduct.parentProductId,
            subProduct: subProduct._id,
            type: "out",
            quantity: item.quantity,
            reason: "Sale",
            reference: saleNumber,
            previousStock,
            newStock,
          });
        }

        const populatedSale = await Sale.findById(sale._id)
          .populate("user")
          .populate("items.product");

        return {
          ...successResponse(),
          populatedSale,
        };
      } catch (error) {
        console.error("createSale error:", error);
        return errorResponse(error?.message || "Failed to create sale");
      }
    },

    refundSale: async (_, { id }, { user }) => {
      // requireRole(user, ["superAdmin", "admin"]);
      const sale = await Sale.findById(id);
      if (!sale) {
        throw new GraphQLError("Sale not found");
      }

      if (sale.status === "refunded") {
        throw new GraphQLError("Sale already refunded");
      }

      sale.status = "refunded";
      await sale.save();

      for (const item of sale.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const previousStock = product.stock;
          const newStock = previousStock + item.quantity;

          product.stock = newStock;
          product.updatedAt = new Date();
          await product.save();

          const stockMovement = new StockMovement({
            product: item.product,
            type: "in",
            quantity: item.quantity,
            reason: "Refund",
            reference: sale.saleNumber,
            user: user.id,
            previousStock,
            newStock,
          });
          await stockMovement.save();
        }
      }

      return await Sale.findById(id)
        .populate("cashier")
        .populate("items.product");
    },
  },
};

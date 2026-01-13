import StockMovement from "../models/StockMovement.js";
import SubProduct from "../models/SubProduct.js";
import Warehouse from "../models/Warehouse.js";
import { errorResponse, successResponse } from "../utils/response.js";
import Sale from "../models/Sale.js";
// import { requireRole } from "../auth.js";

 
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

          let previousStock = subProduct.stock;
          let newStock = subProduct.stock;

          if (subProduct.check === true) {
            const warehouse = await Warehouse.findOne({
              subProduct: subProduct._id,
            });

            if (!warehouse) {
              return errorResponse(
                `Warehouse record missing for subProduct ${subProduct._id}`
              );
            }

            newStock = previousStock - item.quantity;

            if (newStock < 0) {
              return {
                isSuccess: false,
                message: {
                  messageEn: "Not enough stock",
                  messageKh: "មិនមានស្តុកគ្រប់គ្រាន់",
                },
              }
            }

            subProduct.stock = newStock;
            await subProduct.save();

            warehouse.stock = newStock;
            await warehouse.save();
          }

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
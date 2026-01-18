import mongoose from "mongoose";

import StockMovement from "../models/StockMovement.js";
import paginateQuery from "../utils/paginateQuery.js";
import SubProduct from "../models/SubProduct.js";
import Warehouse from "../models/Warehouse.js";
import Product from "../models/Product.js";
import { errorResponse, successResponse } from "../utils/response.js";
export const subProductResolvers = {
  Query: {
    getSubProducts: async (_, { parentProductId }) => {
      try {
        if (!parentProductId) return [];
        const subProducts = await SubProduct.find({ parentProductId })
          .sort({ createdAt: -1 })
          .populate("unitId")
          .populate("shopId")
          .populate("parentProductId");

        return subProducts;
      } catch (error) {
        console.error("getSubProducts error:", error);
        return [];
      }
    },
    
    getProductForSaleWithPagination: async (
      _,
      {
        shopId,
        categoryId,
        page = 1,
        limit = 5,
        pagination = true,
        keyword = "",
      }
    ) => {
      try {
        const query = {
          shopId: shopId,
          sell: true,
          ...(keyword && {
            $or: [
              { nameKh: { $regex: keyword, $options: "i" } },
              { nameEn: { $regex: keyword, $options: "i" } },
            ],
          }),
        };
        const paginationQuery = await paginateQuery({
          model: SubProduct,
          query,
          page,
          limit,
          pagination,
          populate: [
            "unitId",
            {
              path: "parentProductId",
              match: categoryId ? { categoryId } : {},
              populate: { path: "categoryId" },
            },
          ],
        });
        return {
          data: paginationQuery?.data,
          paginator: paginationQuery?.paginator,
        };
      } catch (error) {
        console.error("getSubProducts error:", error);
      }
    },
  },

  Mutation: {
    createSubProduct: async (_, { parentProductId, input }, { user }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(parentProductId)) {
          return errorResponse("Invalid parent product ID");
        }

        const parentProduct = await Product.findById(parentProductId);
        if (!parentProduct) return errorResponse("Parent product not found");
        const newSubProduct = new SubProduct({
          ...input,
          unitId: input?.unitId || undefined,
          shopId: input?.shopId || [],
          parentProductId,
        });

        await newSubProduct.save();
        if (newSubProduct.check || newSubProduct.using) {
          const exists = await Warehouse.findOne({
            subProduct: newSubProduct._id,
          });
          if (!exists) {
            await Warehouse.create({
              subProduct: newSubProduct._id,
              stock: 0,
              minStock: 0,
            });
          }
        }
        return successResponse();
      } catch (error) {
        console.error(error);
        return errorResponse();
      }
    },
    
    adjustStock: async (_, { input }, { user }) => {
      try {
        const { subProductId, quantity, type, reason } = input;

        const sub = await SubProduct.findById(subProductId);
        if (!sub) throw new Error("SubProduct not found");

        const warehouse = await Warehouse.findOne({ subProduct: subProductId });
        if (!warehouse) throw new Error("Warehouse entry not found");

        const previousStock = sub.stock || 0;
        let newStock = previousStock;

        if (type === "in") newStock += quantity;
        else if (type === "out") {
          newStock -= quantity;
          if (newStock < 0) newStock = 0;
        }

        sub.stock = newStock;
        await sub.save();

        warehouse.stock = newStock;
        await warehouse.save();

        

        const movement = await StockMovement.create({
          shop: sub.shopId,
          user: user?._id,
          product: sub.parentProductId,
          subProduct: sub._id,
          type,
          quantity,
          reason,
          previousStock,
          newStock,
        });
        return {
          ...successResponse(),
          movement,
        };
      } catch (error) {
        return errorResponse();
      }
    },

    updateSubProduct: async (_, { _id, input }, { user }) => {
      try {
        const product = await SubProduct.findById(_id);
        if (!product) return errorResponse("SubProduct not found");

        Object.assign(product, {
          ...input,
          unitId: input?.unitId || product.unitId,
          shopId: input?.shopId ?? product.shopId,
        });

        await product.save();
        if (product.check || product.using) {
          const exists = await Warehouse.findOne({ subProduct: product._id });
          if (!exists) {
            await Warehouse.create({
              subProduct: product._id,
              stock: 0,
              minStock: 0,
            });
          }
        }

        return successResponse();
      } catch (error) {
        console.error(error);
        return errorResponse();
      }
    },

    deleteSubProduct: async (_, { _id }) => {
      try {
        const product = await SubProduct.findById(_id);
        if (!product) return errorResponse("SubProduct not found");
        await SubProduct.deleteOne({ _id });
        return successResponse();
      } catch (error) {
        console.error(error);
        return errorResponse();
      }
    },
  },
};
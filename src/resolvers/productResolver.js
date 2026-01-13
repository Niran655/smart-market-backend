import paginateQuery from "../utils/paginateQuery.js";
import Product from "../models/Product.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const productResolvers = {
  Query: {
    getProductsWithPagination: async (
      _,
      { page = 1, limit = 5, pagination = true, keyword = "" }
    ) => {
      try {
        const query = {
          ...(keyword && {
            $or: [
              { nameEn: { $regex: keyword, $options: "i" } },
              { nameKh: { $regex: keyword, $options: "i" } },
            ],
          }),
        };

        const paginationQuery = await paginateQuery({
          model: Product,
          query,
          page,
          limit,
          pagination,
          populate: ["categoryId", ["unitId"]],
        });
        return {
          data: paginationQuery?.data,
          paginator: paginationQuery?.paginator,
        };
      } catch (error) {
        console.log("Errro", error);
      }
    },
  },

  Mutation: {
    createProduct: async (_, { input }, { user }) => {
      try {
        const existingProduct = await Product.findOne({
          $and: [{ nameKh: input.nameKh }, { nameEn: input.nameEn }],
        });

        if (existingProduct) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Product already exists",
              messageKh: "ផលិតផលមានរូចហើយ",
            },
          };
        }

        const newProduct = new Product({
          ...input,
          active: true,
        });

        await newProduct.save();
        return successResponse();
      } catch (error) {
        console.error(error);
        return errorResponse();
      }
    },

    updateProduct: async (_, { _id, input }, { user }) => {
      try {
        const product = await Product.findById(_id);
        if (!product) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Product not found",
              messageKh: "រកមិនឃើញផលិតផល",
            },
          };
        }

        const existingProduct = await Product.findOne({
          $and: [{ nameKh: input.nameKh }, { nameEn: input.nameEn }],
          _id: { $ne: _id },
        });

        if (existingProduct) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Product already exists",
              messageKh: "ផលិតផលមានរួចហើយ",
            },
          };
        }

        Object.assign(product, input);
        await product.save();
        return successResponse();
      } catch (error) {
        console.error(error);
        return errorResponse();
      }
    },

    deleteProduct: async (_, { _id }) => {
      try {
        const product = await Product.findById(_id);
        if (!product) return errorResponse("Product not found");
        await Product.deleteOne({ _id });
        return successResponse();
      } catch (error) {
        console.error(error);
        return errorResponse();
      }
    },

    updateProductStatus: async (_, { _id, active }) => {
      try {
        const product = await Product.findById(_id);
        if (!product) return errorResponse("Product not found");
        product.active = active;
        await product.save();
        return successResponse();
      } catch (error) {
        console.error(error);
        return errorResponse();
      }
    },

    assignProductToShops: async (_, { _id, shopIds }) => {
      try {
        const product = await Product.findById(_id);
        if (!product) return errorResponse("Product not found");
        product.shopIds = [
          ...new Set([...(product.shopIds || []), ...shopIds]),
        ];
        await product.save();
        return successResponse();
      } catch (error) {
        console.error(error);
        return errorResponse();
      }
    },

    removeProductFromShops: async (_, { _id, shopIds }) => {
      try {
        const product = await Product.findById(_id);
        if (!product) return errorResponse("Product not found");
        product.shopIds = (product.shopIds || []).filter(
          (id) => !shopIds.includes(id.toString())
        );
        await product.save();
        return successResponse();
      } catch (error) {
        console.error(error);
        return errorResponse();
      }
    },
  },
};
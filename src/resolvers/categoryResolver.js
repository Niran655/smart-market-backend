import paginateQuery from "../utils/paginateQuery.js";
import Category from "../models/Category.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const categoryResolvers = {
  Query: {
    getCategory: async (_, { user }) => {
      try {
        const category = await Category.find();
        return category;
      } catch (error) {
        console.log("Error", error);
        return [];
      }
    },

    getCategoryWithPagination: async (
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
          model: Category,
          query,
          page,
          limit,
          pagination,
        });

        return {
          data: paginationQuery?.data,
          paginator: paginationQuery?.paginator,
        };
      } catch (error) {
        console.log("Error", error);
      }
    },
  },

  Mutation: {
    createCategory: async (_, { input }) => {
      try {
        const category = new Category(input);
        const categorySave = await category.save();
        return {
          ...successResponse(),
          categorySave,
        };
      } catch (error) {
        return errorResponse();
      }
    },
    
    updateCategory: async (_, { _id, input }) => {
      try {
        const existingCategory = await Category.findById(_id);
        if (!existingCategory) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Category not found",
              messageKh: "មិនមានប្រភេទ",
            },
          };
        }

        await Category.findByIdAndUpdate(_id, input, { new: true });
        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },
    
    updateCategoryStatus: async (_, { _id, active }) => {
      try {
        const existingCategory = await Category.findById(_id);
        if (!existingCategory) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Category not found",
              messageKh: "មិនមានប្រភេទ",
            },
          };
        }

        await Category.findByIdAndUpdate(_id, { active }, { new: true });
        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },
    
    deleteCategory: async (_, { _id }) => {
      try {
        const existingCategory = await Category.findById(_id);
        if (!existingCategory) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Category not found",
              messageKh: "មិនមានប្រភេទ",
            },
          };
        }

        await Category.findByIdAndDelete(_id);
        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },
  },
};
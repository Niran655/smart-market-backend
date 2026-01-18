import bcrypt from "bcryptjs";

import paginateQuery from "../utils/paginateQuery.js";
import { errorResponse, successResponse } from "../utils/response.js";
import User from "../models/User.js";
import { requireAuth, requireRole } from "./auth.js";

export const userResolvers = {
  Query: {
    users: () => User.find(),
    getUsersWithPagination: async (
      _,
      { page = 1, limit = 5, pagination = true, keyword = "", role = "" },
      { user }
    ) => {
      requireAuth(user)
      try {
        const query = {
          ...(keyword && {
            $or: [
              { nameEn: { $regex: keyword, $options: "i" } },
              { nameKh: { $regex: keyword, $options: "i" } },
            ],
          }),
        };
        if (role) {
          query.role = role;
        }

        const paginationQuery = await paginateQuery({
          model: User,
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
    createUser: async (_, { input }) => {
      try {
        const hashed = await bcrypt.hash(input.password, 10);
        const user = new User({
          ...input,
          password: hashed,
        });
        const userSave = await user.save();
        return {
          ...successResponse(),
          userSave,
        };
      } catch (error) {
        return errorResponse();
      }
    },

    updateUser: async (_, { _id, input }, { user }) => {
      requireRole(user, ["superAdmin", "admin"])
      try {
        const existingUser = await User.findById(_id);
        if (!existingUser) {
          return {
            isSuccess: false,
            message: {
              messageEn: "User not found",
              messageKh: "មិនមានអ្នកប្រើប្រាស់",
            },
          };
        }

        if (input.password) {
          const hashed = await bcrypt.hash(input.password, 10);
          input.password = hashed;
        } else {
          delete input.password;
        }

        await User.findByIdAndUpdate(_id, input, { new: true });
        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },

    updateUserStatus: async (_, { _id, active }, { user }) => {
      requireRole(user, ["admin", "superAdmin"]);
      try {
        const existingUser = await User.findById(_id);
        if (!existingUser) {
          return {
            isSuccess: false,
            message: {
              messageEn: "User not found",
              messageKh: "មិនមានអ្នកប្រើប្រាស់",
            },
          };
        }

        await User.findByIdAndUpdate(_id, { active }, { new: true });
        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },

    deleteUser: async (_, { _id }, { user }) => {
      requireRole(user, ["superAdmin", "admin"])
      try {
        const existingUser = await User.findById(_id);
        if (!existingUser) {
          return {
            isSuccess: false,
            message: {
              messageEn: "User not found",
              messageKh: "មិនមានអ្នកប្រើប្រាស់",
            },
          };
        }

        await User.findByIdAndDelete(_id);
        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },
  },
};
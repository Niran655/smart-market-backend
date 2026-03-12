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
      requireAuth(user);
      // requireRole(user, ["admin", "superAdmin"]);
      try {
        const query = {
          // ...(keyword && {
          //   $or: [
          //     { nameEn: { $regex: keyword, $options: "i" } },
          //     { nameKh: { $regex: keyword, $options: "i" } },
          //   ],
          // }),
          ...(keyword && {
            $text: { $search: keyword }
          }),
        };

        if (role) {
          query.role = role;
        };

        const paginationQuery = await paginateQuery({
          model: User,
          query,
          page,
          limit,
          pagination,
          // sort: keyword ? { score: { $meta: "textScore" } } : { createdAt: -1 },
          // select: keyword ? { score: { $meta: "textScore" } } : "",

        });

        return {
          data: paginationQuery?.data,
          paginator: paginationQuery?.paginator,
        };
      } catch (error) {
        console.log("Error", error);
      }
    },
    getProfileById: async (_, { _id }, { user }) => {
      requireAuth(user);
      try {
        const idToUse = _id || user?._id;
        const profile = await User.findById(idToUse);
        if (!profile) {
          throw new Error("Profile not found");
        }
        return profile;
      } catch (error) {
        console.error("Error", error);
        throw new Error("Failed to Fetch")
      }
    }
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
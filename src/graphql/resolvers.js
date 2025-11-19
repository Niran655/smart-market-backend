import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import paginateQuery from "../utils/paginateQuery.js";
import { errorResponse, successResponse } from "../utils/response.js";
import Unit from "../models/Unit.js";
import User from "../models/User.js";
const requireAuth = (user) => {
  if (!user) {
    throw new GraphQLError("You must be logged in to perform this action", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};

const requireRole = (user, roles) => {
  requireAuth(user);
  if (!roles.includes(user.role)) {
    throw new GraphQLError(
      "You do not have permission to perform this action",
      {
        extensions: { code: "FORBIDDEN" },
      }
    );
  }
};

export const resolvers = {
  Query: {
    users: () => User.find(),
    getUsersWithPagination: async (
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
    // unit
    getUnitWithPagination: async (
      _,
      { page = 1, limit = 5, pagination = true, keyword = "" }
    ) => {
      try {
        const query = {
          ...(keyword && {
            $or: [{ nameEn: { $regex: keyword, $options: "i" } }],
          }),
        };

        const paginationQuery = await paginateQuery({
          model: Unit,
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
    register: async (_, { input }) => {
      const hashed = await bcrypt.hash(input.password, 10);

      const user = new User({
        ...input,
        password: hashed,
      });
      return await user.save();
    },

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
    updateUser: async (_, { _id, input }) => {
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
    updateUserStatus: async (_, { _id, active }) => {
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

    deleteUser: async (_, { _id }) => {
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
    login: async (_, { email, password }) => {
      console.log({ email, password });
      const user = await User.findOne({ email, active: true });
      console.log(user);
      if (!user) {
        throw new GraphQLError("Invalid credentials");
      }
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        throw new GraphQLError("Invalid credentials");
      }

      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "Ni0sddfsd325sfweewfer432sdfg_0089",
        {
          expiresIn: "24h",
        }
      );
      console.log("token", token);
      return {
        token,
        user,
      };
    },

    createUnit: async (_, { input }) => {
      // requireRole(user,["Admin"])
      try {
        const unit = new Unit(input);
        const unitSave = await unit.save();
        return {
          ...successResponse(),
          unitSave,
        };
      } catch (error) {
        return errorResponse();
      }
    },
  },
};

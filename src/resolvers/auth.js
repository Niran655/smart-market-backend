import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";

import User from "../models/User.js";

export const requireAuth = (user) => {
  if (!user) {
    throw new GraphQLError("You must be logged in to perform this action", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};

export const requireRole = (user, roles) => {
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

export const authResolvers = {
  Mutation: {
    register: async (_, { input }) => {
      const hashed = await bcrypt.hash(input.password, 10);
      const user = new User({
        ...input,
        password: hashed,
      });
      return await user.save();
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email, active: true });
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
        process.env.JWT_SECRET || "Ni0sddfsd325sfweewfer432sdfg_0089@IT",
        {
          expiresIn: "24h",
        }
      );
      
      return {
        token,
        user,
      };
    },
  },
};
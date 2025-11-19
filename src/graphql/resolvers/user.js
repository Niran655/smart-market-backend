import bcrypt from "bcryptjs";

import User from "../../models/User.js";

const userResolvers = {
  Query: {
    users: async () => {
      return await User.find();
    },
  },
  Mutation: {
    register: async (_, { name, email, password }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("Email already registered");
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        password: hashed,
      });

      await user.save();
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    },
  },
};

export default userResolvers;

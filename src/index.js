import { ApolloServer } from "apollo-server";
import dotenv from "dotenv";

import { resolvers } from "./graphql/resolvers.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { connectDB } from "./config/database.js";
import { buildContext } from "./auth.js"; 

dotenv.config();
connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const context = await buildContext({ req });
    return context;
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server running at ${url}`);
});

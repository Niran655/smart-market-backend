import { ApolloServer } from "apollo-server";
import dotenv from "dotenv";

import { typeDefs } from "./graphql/typeDefs.js";
import { connectDB } from "./config/database.js";
import { resolvers } from "./resolvers/index.js";
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
server.listen({ port: 5000 }).then(({ url }) => {
  console.log(`🚀 Server running at ${url}`);
});
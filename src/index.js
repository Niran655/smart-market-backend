// import { ApolloServer } from "apollo-server";
// import dotenv from "dotenv";
// import { typeDefs } from "./graphql/typeDefs.js";
// import { connectDB } from "./config/database.js";
// import { resolvers } from "./resolvers/index.js";
// import { buildContext } from "./auth.js"; 
// dotenv.config();
// connectDB();
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: async ({ req }) => {
//     const context = await buildContext({ req });
//     return context;
//   },
// });
// server.listen({ port: 5000 }).then(({ url }) => {
//   console.log(`🚀 Server running at ${url}`);
// });
import { ApolloServer } from "apollo-server";
import dotenv from "dotenv";
import depthLimit from "graphql-depth-limit";
import { typeDefs } from "./graphql/typeDefs.js";
import { connectDB } from "./config/database.js";
import { resolvers } from "./resolvers/index.js";
import { buildContext } from "./auth.js";

dotenv.config();
connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // introspection: false,
  validationRules: [depthLimit(5)],
  context: async ({ req }) => buildContext({ req }),
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 GraphQL Server ready at ${url}`);
});


// server.listen({
//   port: 4000,
//   host: "0.0.0.0",
// }).then(({ url }) => {
//   console.log(`🚀 Server running at ${url}`);
// });


// import express from "express";
// import http from "http";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import dotenv from "dotenv";
// import { ApolloServer } from "apollo-server-express";

// import { typeDefs } from "./graphql/typeDefs.js";
// import { resolvers } from "./resolvers/index.js";
// import { connectDB } from "./config/database.js";
// import { buildContext } from "./auth.js";

// dotenv.config();
// connectDB();

// const app = express();

// //  middleware
// app.use(cookieParser());
// app.use(cors({
//   origin: "http://localhost:3000", 
//   credentials: true,
// }));

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: ({ req, res }) => buildContext({ req, res }),
// });

// await server.start();
// server.applyMiddleware({ app, cors: false });

// const httpServer = http.createServer(app);

// httpServer.listen(5000, () => {
//   console.log(`🚀 Server ready at http://localhost:5000${server.graphqlPath}`);
// });

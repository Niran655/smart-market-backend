import { gql } from 'apollo-server-express';

const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type AuthResponse {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    users: [User]
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthResponse
  }
`;

export default userTypeDefs;

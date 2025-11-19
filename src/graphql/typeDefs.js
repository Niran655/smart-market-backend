import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar Date

  type User {
    _id: ID!
    image: String
    nameEn: String!
    nameKh: String
    email: String!
    gender: String
    phone: String
    password: String!
    active: Boolean
    role: String
    createdAt: Date!
    updatedAt: Date!
  }

  type RegisterResponse {
    message: Message
    email: String!
  }

  type Unit {
    _id: ID!
    nameKh: String
    nameEn: String
    remark: String
    active: Boolean
    createdAt: Date!
    updatedAt: Date!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type PaginatorMeta {
    slNo: Int!
    prev: Int
    next: Int
    perPage: Int!
    totalPosts: Int!
    totalPages: Int!
    currentPage: Int!
    hasPrevPage: Boolean!
    hasNextPage: Boolean!
    totalDocs: Int!
  }

  type UnitPaginator {
    data: [Unit]
    paginator: PaginatorMeta
  }

  type UserPaginator {
    data: [User]
    paginator: PaginatorMeta
  }

  type Message {
    messageEn: String
    messageKh: String
  }

  type MutationResponse {
    isSuccess: Boolean
    message: Message
  }

  enum Role {
    admin
    superAdmin
    cashier
    manager
    stockController
  }

  input RegisterInput {
    image: String
    nameEn: String
    nameKh: String
    email: String
    gender: String
    phone: String
    password: String
    active: Boolean
    role: String
  }

  input UnitInput {
    nameKh: String
    nameEn: String
    remark: String
    active: Boolean
  }

  type Query {
    users: [User]
    getUsersWithPagination(page: Int, limit: Int, pagination: Boolean, keyword: String): UserPaginator
    # unit
    getUnitWithPagination(
      page: Int
      limit: Int
      pagination: Boolean
      keyword: String
    ): UnitPaginator
  }

  type Mutation {
    # Auth
    register(input: RegisterInput): RegisterResponse
    login(email: String!, password: String!): AuthPayload!
    createUser(input: RegisterInput): MutationResponse!
    updateUser(_id: ID!, input: RegisterInput): MutationResponse!
    updateUserStatus(_id: ID!, active: Boolean!): MutationResponse!
    deleteUser(_id: ID!): MutationResponse!
    # unit
    createUnit(input: UnitInput): MutationResponse!
    
  }
`;

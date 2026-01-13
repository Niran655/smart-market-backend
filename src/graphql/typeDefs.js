import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar Date

  type User {
    _id: ID!
    image: String
    nameEn: String
    nameKh: String
    email: String
    gender: String
    phone: String
    password: String
    active: Boolean
    role: String
    createdAt: Date
    updatedAt: Date
  }

  type RegisterResponse {
    message: Message
    email: String!
  }

  type Shop {
    _id: ID!
    user: [User]
    code: String
    image: String
    nameEn: String!
    nameKh: String
    type: String
    remark: String
    address: String
    platform: [Platform]
    active: Boolean
    createdAt: Date!
    updatedAt: Date!
  }

  type Platform {
    id: ID!
    platform: String
    name: String
    url: String
  }

  type Product {
    _id: ID!
    shopIds: [ID]
    shops: [Shop]
    nameEn: String
    nameKh: String
    image: String
    categoryId: Category
    unitId: Unit
    type: String
    remark: String
    active: Boolean
    createdAt: Date!
    updatedAt: Date!
  }
  type SubProduct {
    _id: ID!
    #information
    saleType: String
    unitId: Unit
    qty: Int
    barCode: String
    productDes: String
    productImg: String
    using: Boolean
    check: Boolean
    sell: Boolean
    shopId: [Shop]
    #price
    servicePrice: Float
    salePrice: Float
    taxRate: Float
    costPrice: Float
    priceImg: String
    totalPrice: Float
    priceDes: String
    parentProductId: Product
    createdAt: Date!
    updatedAt: Date!
    #stock
    stock: Int
    minStock: Int
  }

  type Warehouse {
    _id: ID!
    subProduct: SubProduct
    stock: Int
    createdAt: Date
    updatedAt: Date
  }

  type WarehouseInShop {
    _id: ID!
    shop: Shop
    subProduct: SubProduct
    stock: Int
    minStock: Int
    createdAt: Date
    updatedAt: Date
  }


  input AdjustStockInput {
    subProductId: ID!
    quantity: Int!
    type: StockMovementType!
    status:String
    reason: String
  }

  type StockMovement {
    _id: ID
    shop: Shop
    user: User
    product: Product
    subProduct:SubProduct
    type: StockMovementType
    quantity: Int
    reason: String
    reference: String
    previousStock: Int
    newStock: Int
    createdAt: Date
  }

  type Sale {
    _id: ID
    saleNumber: String
    user: User
    shopId: Shop
    items: [SaleItem]
    subtotal: Float
    tax: Float
    discount: Float
    total: Float
    paymentMethod: PaymentMethod
    amountPaid: Float
    change: Float
    status: SaleStatus
    createdAt: Date
  }

  type SaleItem {
    product: Product!
    name: String!
    price: Float!
    quantity: Int!
    total: Float!
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

  type Category {
    _id: ID!
    image: String
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

  type ProductPaginator {
    data: [Product]
    paginator: PaginatorMeta
  }

  type SubProductPaginator {
    data: [SubProduct]
    paginator: PaginatorMeta
  }

  type WarehousePaginator {
    data: [Warehouse]
    paginator: PaginatorMeta
  }

  type WarehouseInShopPaginator {
    data: [WarehouseInShop]
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

  enum StockMovementType {
    in
    out
    adjustment
  }

  enum SleType {
    retail
    wholesale
  }

  enum PaymentMethod {
    cash
    card
    qr
  }

  enum SaleStatus {
    completed
    pending
    refunded
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

  input ShopInput {
    userId: [ID]
    code: String
    image: String
    nameEn: String
    nameKh: String
    type: String
    remark: String
    address: String
    platform: [PlatformInput]
    active: Boolean
  }

  input PlatformInput {
    platform: String
    name: String
    url: String
  }

  input ProductVariantInput {
    type: String!
    price: Float!
    unit: String
  }

  input ProductInput {
    shopIds: [ID]
    nameEn: String
    nameKh: String
    image: String
    categoryId: ID
    unitId: ID
    type: String
    stock: Int
    minStock: Int
    remark: String
    active: Boolean
  }

  input SubProductInput {
    #information
    saleType: SleType
    unitId: ID
    qty: Int
    barCode: String
    productDes: String
    productImg: String
    using: Boolean
    check: Boolean
    sell: Boolean
    shopId: [ID]
    #price
    servicePrice: Float
    salePrice: Float
    taxRate: Float
    costPrice: Float
    priceImg: String
    totalPrice: Float
    priceDes: String
    parentProductId: ID
    #stock
    stock: Int
    minStock: Int
  }

input SaleInput {
  items: [SaleItemInput]
  user: ID
  subtotal: Float
  tax: Float
  shopId: ID
  discount: Float
  total: Float
  paymentMethod: PaymentMethod
  amountPaid: Float
  change: Float
}

input SaleItemInput {
  product: ID
  subProductId: ID
  name: String
  price: Float
  quantity: Int
  total: Float
}


  input UnitInput {
    nameKh: String
    nameEn: String
    remark: String
    active: Boolean
  }
  input CategoryInput {
    image: String
    nameKh: String
    nameEn: String
    remark: String
    active: Boolean
  }

  type Query {
    users: [User]
    getUsersWithPagination(
      page: Int
      limit: Int
      pagination: Boolean
      keyword: String
      role: String
    ): UserPaginator
    # unit
    getUnitWithPagination(
      page: Int
      limit: Int
      pagination: Boolean
      keyword: String
    ): UnitPaginator
    getUnit: [Unit]
    #category
    getCategoryWithPagination(
      page: Int
      limit: Int
      pagination: Boolean
      keyword: String
    ): UnitPaginator
    getCategory: [Category]
    # shop
    getAllShops(_id: ID!): [Shop]
    getShopByShopId(_id: ID, shopId: ID!): Shop

    #product
    getProductsWithPagination(
      page: Int
      limit: Int
      pagination: Boolean
      keyword: String
    ): ProductPaginator
    getMainProducts(shopId: ID): [Product]
    getSubProducts(parentProductId: ID!): [SubProduct]
    getProductForSaleWithPagination(
      shopId: ID
      categoryId: String
      page: Int
      limit: Int
      pagination: Boolean
      keyword: String
    ): SubProductPaginator

    #warehouse
    getProductWareHouseWithPagination(
      page: Int
      limit: Int
      pagination: Boolean
      keyword: String
    ): WarehousePaginator
     

    getProductWareHouseInShopoWithPagination(
      shopId: ID
      page: Int
      limit: Int
      pagination: Boolean
      keyword: String
    ):WarehouseInShopPaginator
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
    updateUnit(_id: ID!, input: UnitInput): MutationResponse!
    deleteUnit(_id: ID!): MutationResponse!
    updateUnitStatus(_id: ID!, active: Boolean!): MutationResponse!
    # category
    createCategory(input: CategoryInput): MutationResponse!
    updateCategory(_id: ID!, input: CategoryInput): MutationResponse!
    deleteCategory(_id: ID!): MutationResponse!
    updateCategoryStatus(_id: ID!, active: Boolean!): MutationResponse!
    # shop
    createShop(input: ShopInput): MutationResponse!
    updateShop(_id: ID!, input: ShopInput): MutationResponse!
    deleteShop(_id: ID!): MutationResponse!
    updateShopStatus(_id: ID!, active: Boolean!): MutationResponse!
    addUserControllShop(_id: ID!, userId: [ID]!): MutationResponse!
    deleteUserFromShop(_id: ID, userId: [ID]!): MutationResponse!

    ## Product
    createProduct(input: ProductInput): MutationResponse!
    updateProduct(_id: ID!, input: ProductInput): MutationResponse!
    deleteProduct(_id: ID!): MutationResponse!
    updateProductStatus(_id: ID!, active: Boolean!): MutationResponse!

    #adjust stock
    adjustStock(input: AdjustStockInput!): MutationResponse
    
    #sale
    createSale(input: SaleInput): MutationResponse
    refundSale(id: ID!): Sale!

    # Assign product to shops
    assignProductToShops(_id: ID!, shopIds: [ID]!): MutationResponse!
    removeProductFromShops(_id: ID!, shopIds: [ID]!): MutationResponse!

    # Sub-product (Retail/Wholesale)
    createSubProduct(
      parentProductId: ID!
      input: SubProductInput
    ): MutationResponse!
    updateSubProduct(_id: ID, input: SubProductInput): MutationResponse!
    deleteSubProduct(_id: ID!): MutationResponse!
  }
`;

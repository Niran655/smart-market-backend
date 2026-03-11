// import { gql } from "apollo-server";

// export const typeDefs = gql`
//   scalar Date

//   type User {
//     _id: ID!
//     image: String
//     nameEn: String
//     nameKh: String
//     email: String
//     gender: String
//     phone: String
//     password: String
//     active: Boolean
//     role: String
//     createdAt: Date
//     updatedAt: Date
//   }

//   type RegisterResponse {
//     message: Message
//     email: String!
//   }

//   type Shop {
//     _id: ID!
//     user: [User]
//     code: String
//     image: String
//     nameEn: String!
//     nameKh: String
//     type: String
//     remark: String
//     address: String
//     platform: [Platform]
//     active: Boolean
//     createdAt: Date!
//     updatedAt: Date!
//   }

//   type Platform {
//     id: ID!
//     platform: String
//     name: String
//     url: String
//   }

//   type Product {
//     _id: ID!
//     shopIds: [ID]
//     shops: [Shop]
//     nameEn: String
//     nameKh: String
//     image: String
//     categoryId: Category
//     unitId: Unit
//     type: String
//     remark: String
//     active: Boolean
//     createdAt: Date!
//     updatedAt: Date!
//   }
//   type SubProduct {
//     _id: ID!
//     #information
//     saleType: String
//     unitId: Unit
//     qty: Int
//     barCode: String
//     productDes: String
//     productImg: String
//     using: Boolean
//     check: Boolean
//     sell: Boolean
//     shopId: [Shop]
//     #price
//     servicePrice: Float
//     salePrice: Float
//     taxRate: Float
//     costPrice: Float
//     priceImg: String
//     totalPrice: Float
//     priceDes: String
//     parentProductId: Product
//     createdAt: Date!
//     updatedAt: Date!
//     #stock
//     stock: Int
//     minStock: Int
//   }

//   type Warehouse {
//     _id: ID!
//     subProduct: SubProduct
//     stock: Int
//     createdAt: Date
//     updatedAt: Date
//   }

//   type WarehouseInShop {
//     _id: ID!
//     shop: Shop
//     subProduct: SubProduct
//     stock: Int
//     minStock: Int
//     createdAt: Date
//     updatedAt: Date
//   }

//   input AdjustStockInput {
//     subProductId: ID!
//     quantity: Int!
//     type: StockMovementType!
//     status: String
//     reason: String
//   }

//   type WarehouseTransfer {
//     _id: ID!
//     fromWarehouse: Warehouse
//     toShop: Shop
//     items: [WarehouseTransferItem]
//     status: TransferStatus
//     requestedBy: User
//     acceptedBy: User
//     remark: String
//     createdAt: Date
//     acceptedAt: Date
//   }

//   type WarehouseTransferItem {
//     subProduct: SubProduct!
//     quantity: Int!
//     receivedQty: Int # accepted quantity
//     remainingQty: Int # quantity not received
//   }

//   type StockMovement {
//     _id: ID
//     shop: Shop
//     user: User
//     product: Product
//     subProduct: SubProduct
//     type: StockMovementType
//     quantity: Int
//     reason: String
//     reference: String # transfer ID
//     previousStock: Int
//     newStock: Int
//     createdAt: Date
//   }

//   type Sale {
//     _id: ID
//     saleNumber: String
//     user: User
//     shopId: Shop
//     items: [SaleItem]
//     subtotal: Float
//     tax: Float
//     discount: Float
//     total: Float
//     paymentMethod: PaymentMethod
//     amountPaid: Float
//     change: Float
//     status: SaleStatus

//     # currency: Currency!        # Sale currency (USD / KHR)
//     # exchangeRate: Float        # USD → KHR (optional)

//     # receivedAmount: Float      #  money customer gives
//     # receivedCurrency: Currency #  USD / KHR
//     # changeAmount: Float        #  change returned
//     # changeCurrency: Currency   #  USD / KHR

//     createdAt: Date
//   }

//   type SaleItem {
//     product: Product!
//     name: String!
//     price: Float!
//     quantity: Int!
//     total: Float!
//   }

//   type Unit {
//     _id: ID!
//     nameKh: String
//     nameEn: String
//     remark: String
//     active: Boolean
//     createdAt: Date!
//     updatedAt: Date!
//   }

//   type Category {
//     _id: ID!
//     image: String
//     nameKh: String
//     nameEn: String
//     remark: String
//     active: Boolean
//     createdAt: Date!
//     updatedAt: Date!
//   }

//   type AuthPayload {
//     token: String!
//     user: User!
//   }

//   #Bakong Payment

//   type BakongPayment {
//     _id: ID!
//     amount: Float!
//     currency: String
//     billNumber: String
//     khqrString: String
//     qrImage: String
//     status: String
//     reference: String
//     createdBy: User
//     paidAt: Date
//     createdAt: Date
//     updatedAt: Date
//   }

//   type PaginatorMeta {
//     slNo: Int!
//     prev: Int
//     next: Int
//     perPage: Int!
//     totalPosts: Int!
//     totalPages: Int!
//     currentPage: Int!
//     hasPrevPage: Boolean!
//     hasNextPage: Boolean!
//     totalDocs: Int!
//   }

//   type UnitPaginator {
//     data: [Unit]
//     paginator: PaginatorMeta
//   }

//   type UserPaginator {
//     data: [User]
//     paginator: PaginatorMeta
//   }

//   type ProductPaginator {
//     data: [Product]
//     paginator: PaginatorMeta
//   }

//   type SubProductPaginator {
//     data: [SubProduct]
//     paginator: PaginatorMeta
//   }

//   type WarehousePaginator {
//     data: [Warehouse]
//     paginator: PaginatorMeta
//   }

//   type WarehouseInShopPaginator {
//     data: [WarehouseInShop]
//     paginator: PaginatorMeta
//   }

//   type ProductWarehouseTransfer {
//     data: [WarehouseTransfer]
//     paginator: PaginatorMeta
//   }

//   type Message {
//     messageEn: String
//     messageKh: String
//   }

//   type MutationResponse {
//     isSuccess: Boolean
//     message: Message
//   }

//   enum Role {
//     admin
//     superAdmin
//     cashier
//     manager
//     stockController
//   }

//   enum StockMovementType {
//     in
//     out
//     adjustment
//   }

//   enum SleType {
//     retail
//     wholesale
//   }

//   enum PaymentMethod {
//     cash
//     card
//     qr
//   }

//   enum SaleStatus {
//     completed
//     pending
//     refunded
//   }

//   enum TransferStatus {
//     pending
//     partial_accepted
//     accepted
//     rejected
//     cancelled
//   }

//   enum Currency {
//     USD
//     KHR
//   }

//   # ========================================================INPUT TYPE========================================================

//   input RegisterInput {
//     image: String
//     nameEn: String
//     nameKh: String
//     email: String
//     gender: String
//     phone: String
//     password: String
//     active: Boolean
//     role: String
//   }

//   input ShopInput {
//     userId: [ID]
//     code: String
//     image: String
//     nameEn: String
//     nameKh: String
//     type: String
//     remark: String
//     address: String
//     platform: [PlatformInput]
//     active: Boolean
//   }

//   input PlatformInput {
//     platform: String
//     name: String
//     url: String
//   }

//   input ProductVariantInput {
//     type: String!
//     price: Float!
//     unit: String
//   }

//   input ProductInput {
//     shopIds: [ID]
//     nameEn: String
//     nameKh: String
//     image: String
//     categoryId: ID
//     unitId: ID
//     type: String
//     stock: Int
//     minStock: Int
//     remark: String
//     active: Boolean
//   }

//   input SubProductInput {
//     #information
//     saleType: SleType
//     unitId: ID
//     qty: Int
//     barCode: String
//     productDes: String
//     productImg: String
//     using: Boolean
//     check: Boolean
//     sell: Boolean
//     shopId: [ID]
//     #price
//     servicePrice: Float
//     salePrice: Float
//     taxRate: Float
//     costPrice: Float
//     priceImg: String
//     totalPrice: Float
//     priceDes: String
//     parentProductId: ID
//     #stock
//     stock: Int
//     minStock: Int
//   }

//   input CreateWarehouseTransferInput {
//     toShopIds: [ID]!
//     items: [TransferItemInput]!
//     note: String
//   }

//   input TransferItemInput {
//     subProductId: ID
//     quantity: Int
//   }

//   input AcceptTransferItemInput {
//     subProductId: ID!
//     receivedQty: Int!
//   }

//   input SaleInput {
//     items: [SaleItemInput]
//     user: ID
//     subtotal: Float
//     tax: Float
//     shopId: ID
//     discount: Float
//     total: Float
//     paymentMethod: PaymentMethod
//     amountPaid: Float
//     change: Float

//     # receivedAmount: Float!     #  INPUT money from customer
//     # receivedCurrency: Currency!#  INPUT currency
//     # changeAmount: Float        # calculated
//     # changeCurrency: Currency   # calculated
//   }

//   input SaleItemInput {
//     product: ID
//     subProductId: ID
//     name: String
//     price: Float
//     quantity: Int
//     total: Float
//   }

//   input UnitInput {
//     nameKh: String
//     nameEn: String
//     remark: String
//     active: Boolean
//   }
//   input CategoryInput {
//     image: String
//     nameKh: String
//     nameEn: String
//     remark: String
//     active: Boolean
//   }

//   input PaymentInput {
//   method: String
//   amountPaid: Float
//   change: Float
// }


//   #Bakong payment input
//   input CreateBakongPaymentInput {
//     amount: Float!
//     billNumber: String!
//   }

//   type Query {
//     users: [User]
//     getUsersWithPagination(
//       page: Int
//       limit: Int
//       pagination: Boolean
//       keyword: String
//       role: String
//     ): UserPaginator
//     # unit
//     getUnitWithPagination(
//       page: Int
//       limit: Int
//       pagination: Boolean
//       keyword: String
//     ): UnitPaginator

//     getUnit: [Unit]

//     #category
//     getCategoryWithPagination(
//       page: Int
//       limit: Int
//       pagination: Boolean
//       keyword: String
//     ): UnitPaginator

//     getCategory: [Category]
//     # shop
//     getAllShops(_id: ID!): [Shop]

//     getShopByShopId(_id: ID, shopId: ID!): Shop

//     #product
//     getProductsWithPagination(
//       page: Int
//       limit: Int
//       pagination: Boolean
//       keyword: String
//     ): ProductPaginator

//     getMainProducts(shopId: ID): [Product]

//     getSubProducts(parentProductId: ID!): [SubProduct]

//     getProductForSaleWithPagination(
//       shopId: ID
//       categoryId: String
//       page: Int
//       limit: Int
//       pagination: Boolean
//       keyword: String
//     ): SubProductPaginator

//     #warehouse adjust stocks
//     getProductWareHouseWithPagination(
//       page: Int
//       limit: Int
//       pagination: Boolean
//       keyword: String
//     ): WarehousePaginator

//     getProductWareHouseInShopoWithPagination(
//       shopId: ID
//       page: Int
//       limit: Int
//       pagination: Boolean
//       keyword: String
//     ): WarehouseInShopPaginator

//     getWarehouseTransfersWithPagination(
//       status: TransferStatus
//       shopId: ID
//       page: Int
//       limit: Int
//       pagination: Boolean
//       keyword: String
//     ): ProductWarehouseTransfer

//     getWarehouseTransferById(_id: ID!): WarehouseTransfer

//     #Bakong-Query
//     getBakongPayment(reference: String!): BakongPayment
//   }

//   type Mutation {
//     # Auth
//     register(input: RegisterInput): RegisterResponse
//     login(email: String!, password: String!): AuthPayload!
//     createUser(input: RegisterInput): MutationResponse!
//     updateUser(_id: ID!, input: RegisterInput): MutationResponse!
//     updateUserStatus(_id: ID!, active: Boolean!): MutationResponse!
//     deleteUser(_id: ID!): MutationResponse!
//     # unit
//     createUnit(input: UnitInput): MutationResponse!
//     updateUnit(_id: ID!, input: UnitInput): MutationResponse!
//     deleteUnit(_id: ID!): MutationResponse!
//     updateUnitStatus(_id: ID!, active: Boolean!): MutationResponse!
//     # category
//     createCategory(input: CategoryInput): MutationResponse!
//     updateCategory(_id: ID!, input: CategoryInput): MutationResponse!
//     deleteCategory(_id: ID!): MutationResponse!
//     updateCategoryStatus(_id: ID!, active: Boolean!): MutationResponse!
//     # shop
//     createShop(input: ShopInput): MutationResponse!
//     updateShop(_id: ID!, input: ShopInput): MutationResponse!
//     deleteShop(_id: ID!): MutationResponse!
//     updateShopStatus(_id: ID!, active: Boolean!): MutationResponse!
//     addUserControllShop(_id: ID!, userId: [ID]!): MutationResponse!
//     deleteUserFromShop(_id: ID, userId: [ID]!): MutationResponse!

//     ## Product
//     createProduct(input: ProductInput): MutationResponse!
//     updateProduct(_id: ID!, input: ProductInput): MutationResponse!
//     deleteProduct(_id: ID!): MutationResponse!
//     updateProductStatus(_id: ID!, active: Boolean!): MutationResponse!

//     #adjust stock
//     adjustStock(input: AdjustStockInput!): MutationResponse

//     #sale
//     createSale(input: SaleInput): MutationResponse
//     updateSaleStatus(id: ID!, status: String!, paymentInfo: PaymentInput): MutationResponse
//     refundSale(id: ID!): Sale!

//     # Assign product to shops
//     assignProductToShops(_id: ID!, shopIds: [ID]!): MutationResponse!
//     removeProductFromShops(_id: ID!, shopIds: [ID]!): MutationResponse!

//     # Sub-product (Retail/Wholesale)
//     createSubProduct(
//       parentProductId: ID!
//       input: SubProductInput
//     ): MutationResponse!
//     updateSubProduct(_id: ID, input: SubProductInput): MutationResponse!
//     deleteSubProduct(_id: ID!): MutationResponse!

//     # Product Transfer(Main warehouse -> shop)
//     createWarehouseTransfer(
//       input: CreateWarehouseTransferInput
//     ): MutationResponse

//     #Accept Transfer (Shop Side)
//     # acceptWarehouseTransfer(transferId: ID!): MutationResponse!


//     acceptWarehouseTransfer(
//       transferId: ID!
//       items: [AcceptTransferItemInput!]!
//     ): MutationResponse!

//     #Reject / Cancel Transfer
//     rejectWarehouseTransfer(transferId: ID!, reason: String): MutationResponse!

//     #Bakong payment gatway
//     createBakongPayment(input: CreateBakongPaymentInput!): MutationResponse!
//     checkBakongPayment(reference: String!): MutationResponse!
//   }
// `;


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

  type PurchaseOrder {
    _id: ID!
    supplier: Supplier
    items: [PurchaseOrderItem]
    totalAmount: Float
    status: PurchaseOrderStatus
    remark: String
    createdBy: User
    receivedBy: User
    createdAt: Date
    receivedAt: Date
  }

  type PurchaseOrderItem {
    subProduct: SubProduct
    quantity: Int
    costPrice: Float
    totalPrice: Float
    receivedQty: Int
    remainingQty: Int
  }

  input AdjustStockInput {
    subProductId: ID!
    quantity: Int!
    type: StockMovementType!
    status: String
    reason: String
  }

  type WarehouseTransfer {
    _id: ID!
    fromWarehouse: Warehouse
    toShop: Shop
    items: [WarehouseTransferItem]
    status: TransferStatus
    requestedBy: User
    acceptedBy: User
    remark: String
    createdAt: Date
    acceptedAt: Date
  }

  type WarehouseTransferItem {
    subProduct: SubProduct!
    quantity: Int!
    receivedQty: Int # accepted quantity
    remainingQty: Int # quantity not received
  }

  type StockMovement {
    _id: ID
    shop: Shop
    user: User
    product: Product
    subProduct: SubProduct
    type: StockMovementType
    quantity: Int
    reason: String
    reference: String # transfer ID
    previousStock: Int
    newStock: Int
    createdAt: Date
  }

  type Sale {
    _id: ID
    saleNumber: String
    user: User
    shopId: ID
    shop: Shop
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
    product: Product
    subProductId: ID
    name: String
    price: Float
    quantity: Int
    total: Float
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

  type Supplier{
    _id: ID!
    nameKh:String
    nameEn:String
    remark:String
    createdAt: Date
    updatedAt: Date
  }
# ========================================DASHBOARD STAT==================
    type TopItem {
      rank: Int
      name: String
      orders: Int
    }

    type ActiveOrder {
      name: String
      type: String
      table: String    
    }

    type CategoryStat {
      category: String
      orders: Int
    }

    type DashboardStats {
      totalOrders: Float
      totalSales: Float
      averageValue: Float
      reservations: Int
      
      dailyRevenue:[Float]
      weeklyRevenue: [Float]  
      topSellingItems: [TopItem]    
      activeOrders: [ActiveOrder]    
      categoryStats: [CategoryStat]  
    }

# ========================================DASHBOARD STAT====================
# ======================================== REPORT TYPES ====================

enum ReportType {
  SALES
  STAFF
  INVENTORY
}

type TopProduct {
  id: ID
  name: String
  category: String
  sales: Int
  revenue: Float
}

type Transaction {
  id: ID
  date: Date
  customer: String
  type: String
  amount: Float
  status: String
}

type SalesReport {
  totalRevenue: Float
  totalOrders: Int
  averageOrderValue: Float
  topProducts: [TopProduct]
  recentTransactions: [Transaction]
}

type StaffPerformance {
  id: ID
  name: String
  role: String
  hours: Int
  sales: Float
  orders: Int
}

type StaffReport {
  totalStaff: Int
  activeStaff: Int
  totalHours: Int
  totalSales: Float
  salesPerStaff: Float
  performance: [StaffPerformance]
}

type InventoryItem {
  id: ID
  name: String
  category: String
  stock: Int
  unit: String
  reorderLevel: Int
  value: Float
}

type InventoryReport {
  totalItems: Int
  lowStockCount: Int
  totalValue: Float
  items: [InventoryItem]
}

type Report {
  sales: SalesReport
  staff: StaffReport
  inventory: InventoryReport
}

# ======================================== REPORT TYPES ====================
  type AuthPayload {
    token: String!
    user: User!
  }

  #Bakong Payment

  type BakongPayment {
    _id: ID!
    amount: Float!
    currency: String
    billNumber: String
    khqrString: String
    qrImage: String
    status: String
    reference: String
    createdBy: User
    paidAt: Date
    createdAt: Date
    updatedAt: Date
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

  type SupplierPaginator {
    data: [Supplier]
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

  type SalePaginator {
    data: [Sale]
    paginator: PaginatorMeta
  }


  type ProductWarehouseTransfer {
    data: [WarehouseTransfer]
    paginator: PaginatorMeta
  }

  type PurchaseOrderPaginator {
  data: [PurchaseOrder]
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

  enum TransferStatus {
    pending
    partial_accepted
    accepted
    rejected
    cancelled
  }

  enum PurchaseOrderStatus {
  pending
  partial_received
  received
  cancelled
  }

  enum Currency {
    USD
    KHR
  }

  # ========================================================INPUT TYPE========================================================

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

  input CreateWarehouseTransferInput {
    toShopIds: [ID]!
    items: [TransferItemInput]!
    note: String
  }

  input TransferItemInput {
    subProductId: ID
    quantity: Int
  }

  input AcceptTransferItemInput {
    subProductId: ID!
    receivedQty: Int!
  }

  input SaleInput {
    items: [SaleItemInput]
    user: ID
    subtotal: Float
    tax: Float
    shopId: ID!
    discount: Float
    total: Float
    paymentMethod: PaymentMethod
    amountPaid: Float
    change: Float
    status: SaleStatus
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
  input SupplierInput{
    nameKh:String
    nameEn:String
    remark:String
  }

  input CreatePurchaseOrderInput  {
    supplierId: ID
    items: [PurchaseOrderItemInput]
    remark: String
  }

  input PurchaseOrderItemInput {
    subProductId: ID
    quantity: Int
    costPrice: Float
  }

  input UpdatePurchaseOrderInput {
    supplierId: ID
    items: [PurchaseOrderItemInput!]
    remark: String
  }

  input AcceptPurchaseOrderItemInput {
  subProductId: ID!
  receivedQty: Int!
}

  input PaymentInput {
    method: String
    amountPaid: Float
    change: Float
  }


  #Bakong payment input
  input CreateBakongPaymentInput {
    amount: Float!
    billNumber: String!
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

    getProfileById(_id:ID):User
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

    #supplier
    getSuppliersWithPagination(
      page: Int
      limit: Int
      pagination: Boolean
      keyword: String
    ): SupplierPaginator

    #purchase order
    getPurchaseOrdersWithPagination(
      supplierId: ID
      status: PurchaseOrderStatus
      page: Int
      limit: Int
      pagination: Boolean
      keyword: String
    ): PurchaseOrderPaginator

    getPurchaseOrderById(_id: ID!): PurchaseOrder

    #warehouse adjust stocks
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
    ): WarehouseInShopPaginator

    getWarehouseTransfersWithPagination(
      status: TransferStatus
      shopId: ID
      page: Int
      limit: Int
      pagination: Boolean
      keyword: String
    ): ProductWarehouseTransfer

    getWarehouseTransferById(_id: ID!): WarehouseTransfer

    #Bakong-Query
    getBakongPayment(reference: String!): BakongPayment
    
    # Sale Queries
    getSales(
      shopId: ID
      status: SaleStatus
      startDate: Date
      endDate: Date
      page: Int
      limit: Int
      pagination: Boolean
    ): SalePaginator

    getSaleById(_id: ID!): Sale

    dashboardStats(
      shopId: ID
      filter: String       
      dayStart: Date       
      dayEnd: Date      
    ): DashboardStats
    
    getReportStats(
      shopId: ID
      type: ReportType
      startDate: Date
      endDate: Date
    ): Report

  }


  type Mutation {
    # Auth
    register(input: RegisterInput): RegisterResponse
    login(email: String!, password: String!): AuthPayload!
    logout:AuthPayload

    #user
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

    #supplier
    createSupplier(input: SupplierInput): MutationResponse!
    updateSupplier(_id: ID!, input: SupplierInput): MutationResponse!
    deleteSupplier(_id: ID!): MutationResponse!

    #adjust stock
    adjustStock(input: AdjustStockInput!): MutationResponse

    #sale
    createSale(input: SaleInput): MutationResponse
    updateSaleStatus(id: ID!, status: SaleStatus!, paymentInfo: PaymentInput): MutationResponse
    refundSale(id: ID!): Sale

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

    # Product Transfer(Main warehouse -> shop)
    createWarehouseTransfer(
      input: CreateWarehouseTransferInput
    ): MutationResponse

    createPurchaseOrder(
      input: CreatePurchaseOrderInput
    ): MutationResponse

    updatePurchaseOrder(
      _id: ID!
      input: UpdatePurchaseOrderInput!
    ): MutationResponse!

    cancelPurchaseOrder(
      _id: ID!
      reason: String
    ): MutationResponse!
    

    receivePurchaseOrder(
      purchaseOrderId: ID
      items: [AcceptPurchaseOrderItemInput]
    ): MutationResponse

    #Accept Transfer (Shop Side)
    acceptWarehouseTransfer(
      transferId: ID!
      items: [AcceptTransferItemInput!]!
    ): MutationResponse!

    #Reject / Cancel Transfer
    rejectWarehouseTransfer(transferId: ID!, reason: String): MutationResponse!

    #Bakong payment gatway
    createBakongPayment(input: CreateBakongPaymentInput!): MutationResponse!
    checkBakongPayment(reference: String!): MutationResponse!
  }
`;

import { mergeResolvers } from "@graphql-tools/merge";

import { subProductResolvers } from "./subProductResolver.js";
import { warehouseResolvers } from "./warehouseResolver.js";
import { categoryResolvers } from "./categoryResolver.js";
import { productResolvers } from "./productResolver.js";
import { bakongResolvers } from "./bakongResolver.js";
import { saleResolvers } from "./saleResolver.js";
import { shopResolvers } from "./shopResolver.js";
import { unitResolvers } from "./unitResolver.js";
import { userResolvers } from "./userResolver.js";
import { authResolvers } from "./auth.js";
import { warehouseTransferResolver } from "./warehouseTransferResolver.js";
import { warehouseInshopResolver } from "./warehouseInShopResolver.js";

// Merge all resolvers
export const resolvers = mergeResolvers([
  authResolvers,
  userResolvers,
  unitResolvers,
  categoryResolvers,
  shopResolvers,
  productResolvers,
  subProductResolvers,
  warehouseResolvers,
  saleResolvers,
  bakongResolvers,
  warehouseTransferResolver,
  warehouseInshopResolver
]);

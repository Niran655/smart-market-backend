// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import mongoose from "mongoose";
// import { GraphQLError } from "graphql";

// import StockMovement from "../models/StockMovement.js";
// import paginateQuery from "../utils/paginateQuery.js";
// import SubProduct from "../models/SubProduct.js";
// import Warehouse from "../models/Warehouse.js";
// import Category from "../models/Category.js";
// import Product from "../models/Product.js";
// import { errorResponse, successResponse } from "../utils/response.js";
// import Sale from "../models/Sale.js";
// import Shop from "../models/Shop.js";
// import Unit from "../models/Unit.js";
// import User from "../models/User.js";
// const requireAuth = (user) => {
//   if (!user) {
//     throw new GraphQLError("You must be logged in to perform this action", {
//       extensions: { code: "UNAUTHENTICATED" },
//     });
//   }
// };

// const requireRole = (user, roles) => {
//   requireAuth(user);
//   if (!roles.includes(user.role)) {
//     throw new GraphQLError(
//       "You do not have permission to perform this action",
//       {
//         extensions: { code: "FORBIDDEN" },
//       }
//     );
//   }
// };

// // Simple sale number generator: S-YYYYMMDD-rand5
// const generateSaleNumber = () => {
//   const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
//   const rand = Math.floor(10000 + Math.random() * 90000);
//   return `S-${datePart}-${rand}`;
// };

// export const resolvers = {
//   Query: {
//     users: () => User.find(),
//     getUsersWithPagination: async (
//       _,
//       { page = 1, limit = 5, pagination = true, keyword = "", role = "" }
//     ) => {
//       try {
//         const query = {
//           ...(keyword && {
//             $or: [
//               { nameEn: { $regex: keyword, $options: "i" } },
//               { nameKh: { $regex: keyword, $options: "i" } },
//             ],
//           }),
//         };
//         if (role) {
//           query.role = role;
//         }

//         const paginationQuery = await paginateQuery({
//           model: User,
//           query,
//           page,
//           limit,
//           pagination,
//         });

//         return {
//           data: paginationQuery?.data,
//           paginator: paginationQuery?.paginator,
//         };
//       } catch (error) {
//         console.log("Error", error);
//       }
//     },

//     // unit
//     getUnit: async (_, { user }) => {
//       try {
//         const units = await Unit.find();
//         return units;
//       } catch (error) {
//         console.log("Error", error);
//         return [];
//       }
//     },
//     getUnitWithPagination: async (
//       _,
//       { page = 1, limit = 5, pagination = true, keyword = "" },
//       { user }
//     ) => {
//       try {
//         const query = {
//           ...(keyword && {
//             $or: [
//               { nameEn: { $regex: keyword, $options: "i" } },
//               { nameKh: { $regex: keyword, $options: "i" } },
//             ],
//           }),
//         };

//         const paginationQuery = await paginateQuery({
//           model: Unit,
//           query,
//           page,
//           limit,
//           pagination,
//         });

//         return {
//           data: paginationQuery?.data,
//           paginator: paginationQuery?.paginator,
//         };
//       } catch (error) {
//         console.log("Error", error);
//       }
//     },

//     // category
//     getCategory: async (_, { user }) => {
//       try {
//         const category = await Category.find();
//         return category;
//       } catch (error) {
//         console.log("Error", error);
//         return [];
//       }
//     },

//     getCategoryWithPagination: async (
//       _,
//       { page = 1, limit = 5, pagination = true, keyword = "" }
//     ) => {
//       try {
//         const query = {
//           ...(keyword && {
//             $or: [
//               { nameEn: { $regex: keyword, $options: "i" } },
//               { nameKh: { $regex: keyword, $options: "i" } },
//             ],
//           }),
//         };

//         const paginationQuery = await paginateQuery({
//           model: Category,
//           query,
//           page,
//           limit,
//           pagination,
//         });

//         return {
//           data: paginationQuery?.data,
//           paginator: paginationQuery?.paginator,
//         };
//       } catch (error) {
//         console.log("Error", error);
//       }
//     },
//     //shop

//     getAllShops: async (_, { _id }) => {
//       const shops = await Shop.find({ user: _id })
//         .populate({
//           path: "user",
//           select: "nameEn nameKh email role",
//         })
//         .exec();

//       shops.forEach((shop) => {
//         shop.user = shop.user.filter((u) => u !== null);
//       });

//       return shops;
//     },
//     getShopByShopId: async (_, { _id, shopId }) => {
//       try {
//         const shop = await Shop.findOne({
//           _id: shopId,
//           user: { $in: [_id] },
//         })
//           .populate({
//             path: "user",
//             select: "nameEn nameKh email role",
//           })
//           .exec();

//         if (!shop) {
//           return null;
//         }

//         shop.user = shop.user.filter((u) => u !== null);

//         return shop;
//       } catch (error) {
//         console.error(error);
//         throw new Error("Failed to get shop");
//       }
//     },
//     getProductsWithPagination: async (
//       _,
//       { page = 1, limit = 5, pagination = true, keyword = "" }
//     ) => {
//       try {
//         const query = {
//           ...(keyword && {
//             $or: [
//               { nameEn: { $regex: keyword, $options: "i" } },
//               { nameKh: { $regex: keyword, $options: "i" } },
//             ],
//           }),
//         };

//         const paginationQuery = await paginateQuery({
//           model: Product,
//           query,
//           page,
//           limit,
//           pagination,
//           populate: ["categoryId", ["unitId"]],
//         });
//         return {
//           data: paginationQuery?.data,
//           paginator: paginationQuery?.paginator,
//         };
//       } catch (error) {
//         console.log("Errro", error);
//       }
//     },
//     getSubProducts: async (_, { parentProductId }) => {
//       try {
//         if (!parentProductId) return [];
//         const subProducts = await SubProduct.find({ parentProductId })
//           .sort({ createdAt: -1 })
//           .populate("unitId")
//           .populate("shopId")
//           .populate("parentProductId");

//         return subProducts;
//       } catch (error) {
//         console.error("getSubProducts error:", error);
//         return [];
//       }
//     },
//     getProductForSaleWithPagination: async (
//       _,
//       {
//         shopId,
//         categoryId,
//         page = 1,
//         limit = 5,
//         pagination = true,
//         keyword = "",
//       }
//     ) => {
//       try {
//         const query = {
//           shopId: shopId,
//           sell: true,
//           ...(keyword && {
//             $or: [
//               { nameKh: { $regex: keyword, $options: "i" } },
//               { nameEn: { $regex: keyword, $options: "i" } },
//             ],
//           }),
//         };
//         const paginationQuery = await paginateQuery({
//           model: SubProduct,
//           query,
//           page,
//           limit,
//           pagination,
//           populate: [
//             "unitId",
//             {
//               path: "parentProductId",
//               match: categoryId ? { categoryId } : {},
//               populate: { path: "categoryId" },
//             },
//           ],
//         });
//         return {
//           data: paginationQuery?.data,
//           paginator: paginationQuery?.paginator,
//         };
//       } catch (error) {
//         console.error("getSubProducts error:", error);
//       }
//     },
//     getProductWareHouseWithPagination: async (
//       _,
//       { page = 1, limit = 5, pagination = true, keyword = "" }
//     ) => {
//       try {
//         const paginationQuery = await paginateQuery({
//           model: Warehouse,
//           // query,
//           page,
//           limit,
//           pagination,
//           populate: [
//             {
//               path: "subProduct",
//               populate: {
//                 path: ["unitId", "parentProductId"],
//               },
//             },
//           ],
//         });
//         return {
//           data: paginationQuery?.data,
//           paginator: paginationQuery?.paginator,
//         };
//       } catch (error) {
//         console.error("error", error);
//       }
//     },
//   },

//   Mutation: {
//     register: async (_, { input }) => {
//       const hashed = await bcrypt.hash(input.password, 10);

//       const user = new User({
//         ...input,
//         password: hashed,
//       });
//       return await user.save();
//     },

//     createUser: async (_, { input }) => {
//       try {
//         const hashed = await bcrypt.hash(input.password, 10);
//         const user = new User({
//           ...input,
//           password: hashed,
//         });
//         const userSave = await user.save();
//         return {
//           ...successResponse(),
//           userSave,
//         };
//       } catch (error) {
//         return errorResponse();
//       }
//     },
//     updateUser: async (_, { _id, input }) => {
//       try {
//         const existingUser = await User.findById(_id);
//         if (!existingUser) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "User not found",
//               messageKh: "មិនមានអ្នកប្រើប្រាស់",
//             },
//           };
//         }

//         if (input.password) {
//           const hashed = await bcrypt.hash(input.password, 10);
//           input.password = hashed;
//         } else {
//           delete input.password;
//         }

//         await User.findByIdAndUpdate(_id, input, { new: true });

//         return successResponse();
//       } catch (error) {
//         return errorResponse();
//       }
//     },
//     updateUserStatus: async (_, { _id, active }) => {
//       try {
//         const existingUser = await User.findById(_id);
//         if (!existingUser) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "User not found",
//               messageKh: "មិនមានអ្នកប្រើប្រាស់",
//             },
//           };
//         }

//         await User.findByIdAndUpdate(_id, { active }, { new: true });
//         return successResponse();
//       } catch (error) {
//         return errorResponse();
//       }
//     },

//     deleteUser: async (_, { _id }) => {
//       try {
//         const existingUser = await User.findById(_id);
//         if (!existingUser) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "User not found",
//               messageKh: "មិនមានអ្នកប្រើប្រាស់",
//             },
//           };
//         }

//         await User.findByIdAndDelete(_id);

//         return successResponse();
//       } catch (error) {
//         return errorResponse();
//       }
//     },
//     login: async (_, { email, password }) => {
//       console.log({ email, password });
//       const user = await User.findOne({ email, active: true });
//       console.log(user);
//       if (!user) {
//         throw new GraphQLError("Invalid credentials");
//       }
//       const isValid = await user.comparePassword(password);
//       if (!isValid) {
//         throw new GraphQLError("Invalid credentials");
//       }

//       user.lastLogin = new Date();
//       await user.save();

//       const token = jwt.sign(
//         { userId: user.id },
//         process.env.JWT_SECRET || "Ni0sddfsd325sfweewfer432sdfg_0089@IT",
//         {
//           expiresIn: "24h",
//         }
//       );
//       console.log("token", token);
//       return {
//         token,
//         user,
//       };
//     },

//     createUnit: async (_, { input }, { user }) => {
//       requireRole(user, ["admin", "superAdmin"]);

//       try {
//         const existingUnit = await Unit.findOne({
//           $or: [{ nameKh: input.nameEn }, { nameEn: input.nameEn }],
//         });
//         if (existingUnit) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Exist Unit",
//               messageKh: "មានរួចហើយ",
//             },
//           };
//         }
//         const unit = new Unit(input);
//         const unitSave = await unit.save();
//         return {
//           ...successResponse(),
//           unitSave,
//         };
//       } catch (error) {
//         return errorResponse();
//       }
//     },
//     updateUnit: async (_, { _id, input }) => {
//       try {
//         const existingUnit = await Unit.findById(_id);
//         if (!existingUnit) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Unit not found",
//               messageKh: "មិនមានឯកតា",
//             },
//           };
//         }

//         await Unit.findByIdAndUpdate(_id, input, { new: true });

//         return successResponse();
//       } catch (error) {
//         return errorResponse();
//       }
//     },
//     updateUnitStatus: async (_, { _id, active }) => {
//       try {
//         const existingUnit = await Unit.findById(_id);
//         if (!existingUnit) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Unit not found",
//               messageKh: "មិនមានឯកតា",
//             },
//           };
//         }

//         await Unit.findByIdAndUpdate(_id, { active }, { new: true });
//         return successResponse();
//       } catch (error) {
//         return errorResponse();
//       }
//     },
//     deleteUnit: async (_, { _id }) => {
//       try {
//         const existingUnit = await Unit.findById(_id);
//         if (!existingUnit) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Unit not found",
//               messageKh: "មិនមានឯកតា",
//             },
//           };
//         }

//         await Unit.findByIdAndDelete(_id);

//         return successResponse();
//       } catch (error) {
//         return errorResponse();
//       }
//     },

//     // category
//     createCategory: async (_, { input }) => {
//       // requireRole(user,["Admin"])
//       try {
//         const category = new Category(input);
//         const categorySave = await category.save();
//         return {
//           ...successResponse(),
//           categorySave,
//         };
//       } catch (error) {
//         return errorResponse();
//       }
//     },
//     updateCategory: async (_, { _id, input }) => {
//       try {
//         const existingCategory = await Category.findById(_id);
//         if (!existingCategory) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Category not found",
//               messageKh: "មិនមានប្រភេទ",
//             },
//           };
//         }

//         await Category.findByIdAndUpdate(_id, input, { new: true });

//         return successResponse();
//       } catch (error) {
//         return errorResponse();
//       }
//     },
//     updateCategoryStatus: async (_, { _id, active }) => {
//       try {
//         const existingCategory = await Category.findById(_id);
//         if (!existingCategory) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Category not found",
//               messageKh: "មិនមានប្រភេទ",
//             },
//           };
//         }

//         await Category.findByIdAndUpdate(_id, { active }, { new: true });
//         return successResponse();
//       } catch (error) {
//         return errorResponse();
//       }
//     },
//     deleteCategory: async (_, { _id }) => {
//       try {
//         const existingCategory = await Category.findById(_id);
//         if (!existingCategory) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Category not found",
//               messageKh: "មិនមានប្រភេទ",
//             },
//           };
//         }

//         await Category.findByIdAndDelete(_id);
//         return successResponse();
//       } catch (error) {
//         return errorResponse();
//       }
//     },
//     //shop
//     createShop: async (_, { input }, { user }) => {
//       requireRole(user, ["admin", "superAdmin"]);
//       try {
//         const existingShop = await Shop.findOne({ nameEn: input.nameEn });
//         if (existingShop) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Shop already exists",
//               messageKh: "ហាងមានរួចហើយ",
//             },
//           };
//         }

//         const shop = new Shop({
//           ...input,
//           user: [user._id],
//         });

//         const shopSave = await shop.save();

//         return {
//           ...successResponse(),
//           shop: shopSave,
//         };
//       } catch (error) {
//         console.error(error);
//         return errorResponse();
//       }
//     },
//     addUserControllShop: async (_, { _id, userId }, { user }) => {
//       requireRole(user, ["superAdmin", "admin"]);
//       try {
//         const existShop = await Shop.findById(_id);
//         if (!existShop) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Shop not found",
//               messageKh: "មិនមានហាង",
//             },
//           };
//         }

//         const usersToAdd = Array.isArray(userId) ? userId : [userId];

//         await Shop.findByIdAndUpdate(
//           _id,
//           { $addToSet: { user: { $each: usersToAdd } } },
//           { new: true }
//         );

//         return successResponse();
//       } catch (error) {
//         console.error(error);
//         return {
//           isSuccess: false,
//           message: {
//             messageEn: "Something went wrong",
//             messageKh: "មានបញ្ហា",
//           },
//         };
//       }
//     },
//     deleteUserFromShop: async (_, { _id, userId }, { user }) => {
//       requireRole(user, ["superAdmin"]);
//       try {
//         const existShop = await Shop.findById(_id);
//         if (!existShop) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Shop not found",
//               messageKh: "មិនមានហាង",
//             },
//           };
//         }

//         const usersToRemove = Array.isArray(userId) ? userId : [userId];

//         await Shop.findByIdAndUpdate(
//           _id,
//           { $pull: { user: { $in: usersToRemove } } },
//           { new: true }
//         );

//         return successResponse();
//       } catch (error) {
//         console.error(error);
//         return {
//           isSuccess: false,
//           message: {
//             messageEn: "Something went wrong",
//             messageKh: "មានបញ្ហា",
//           },
//         };
//       }
//     },

//     updateShop: async (_, { _id, input }, { user }) => {
//       requireRole(user, ["admin", "superAdmin"]);
//       try {
//         const existShop = await Shop.findById(_id);
//         if (!existShop) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Shop not found",
//               messageKh: "មិនមានហាង",
//             },
//           };
//         }
//         await Shop.findByIdAndUpdate(_id, input, { new: true });
//         return successResponse();
//       } catch (error) {
//         return errorResponse();
//       }
//     },
//     deleteShop: async (_, { _id }) => {
//       try {
//         const existingShop = await Shop.findById(_id);
//         if (!existingShop) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Shop not found",
//               messageKh: "មិនមានហាង",
//             },
//           };
//         }

//         await Shop.findByIdAndDelete(_id);
//         return successResponse();
//       } catch (error) {
//         return errorResponse();
//       }
//     },
//     createProduct: async (_, { input }, { user }) => {
//       try {
//         const existingProduct = await Product.findOne({
//          $and: [{ nameKh: input.nameKh }, { nameEn: input.nameEn }],
//         });

//         if (existingProduct) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Product already exists",
//               messageKh: "ផលិតផលមានរូចហើយ",
//             },
//           };
//         }

//         // const existShop = await Shop.findById(input.shopIds?.[0]);
//         // if (!existShop) {
//         //   return {
//         //     isSuccess: false,
//         //     message: { messageEn: "Shop not found", messageKh: "មិនមានហាង" },
//         //   };
//         // }

//         const newProduct = new Product({
//           ...input,
//           active: true,
//         });

//         await newProduct.save();

//         const initialStock = input.stock || 0;
//         await SubProduct.create({
//           unitId: input.unitId,
//           productImg: input.image,
//           qty: initialStock,
//           saleType: "retail",
//           parentProductId: newProduct._id,
//         });

//         // if (initialStock > 0) {
//         //   await StockMovement.create({
//         //     // shop: input?.shopIds[0],
//         //     product: newProduct._id,
//         //     type: "in",
//         //     quantity: initialStock,
//         //     reason: "Initial product creation",
//         //     reference: "CREATE_PRODUCT",
//         //     previousStock: 0,
//         //     newStock: initialStock,
//         //   });
//         // }
//         return successResponse();
//       } catch (error) {
//         console.error(error);
//         return errorResponse();
//       }
//     },

//     updateProduct: async (_, { _id, input }, { user }) => {
//       try {
//         const product = await Product.findById(_id);
//         if (!product) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Product not found",
//               messageKh: "រកមិនឃើញផលិតផល",
//             },
//           };
//         }

//         const existingProduct = await Product.findOne({
//           $and: [{ nameKh: input.nameKh }, { nameEn: input.nameEn }],
//           _id: { $ne: _id },
//         });

//         if (existingProduct) {
//           return {
//             isSuccess: false,
//             message: {
//               messageEn: "Product already exists",
//               messageKh: "ផលិតផលមានរួចហើយ",
//             },
//           };
//         }

//         Object.assign(product, input);
//         await product.save();

//         return successResponse();
//       } catch (error) {
//         console.error(error);
//         return errorResponse();
//       }
//     },

//     deleteProduct: async (_, { _id }) => {
//       try {
//         const product = await Product.findById(_id);
//         if (!product) return errorResponse("Product not found");
//         await Product.deleteOne({ _id });
//         return successResponse();
//       } catch (error) {
//         console.error(error);
//         return errorResponse();
//       }
//     },

//     updateProductStatus: async (_, { _id, active }) => {
//       try {
//         const product = await Product.findById(_id);
//         if (!product) return errorResponse("Product not found");
//         product.active = active;
//         await product.save();
//         return successResponse();
//       } catch (error) {
//         console.error(error);
//         return errorResponse();
//       }
//     },

//     assignProductToShops: async (_, { _id, shopIds }) => {
//       try {
//         const product = await Product.findById(_id);
//         if (!product) return errorResponse("Product not found");
//         product.shopIds = [
//           ...new Set([...(product.shopIds || []), ...shopIds]),
//         ];
//         await product.save();
//         return successResponse();
//       } catch (error) {
//         console.error(error);
//         return errorResponse();
//       }
//     },

//     removeProductFromShops: async (_, { _id, shopIds }) => {
//       try {
//         const product = await Product.findById(_id);
//         if (!product) return errorResponse("Product not found");
//         product.shopIds = (product.shopIds || []).filter(
//           (id) => !shopIds.includes(id.toString())
//         );
//         await product.save();
//         return successResponse();
//       } catch (error) {
//         console.error(error);
//         return errorResponse();
//       }
//     },

//     createSubProduct: async (_, { parentProductId, input }, { user }) => {
//       try {
//         if (!mongoose.Types.ObjectId.isValid(parentProductId)) {
//           return errorResponse("Invalid parent product ID");
//         }

//         const parentProduct = await Product.findById(parentProductId);
//         if (!parentProduct) return errorResponse("Parent product not found");
//         const newSubProduct = new SubProduct({
//           ...input,
//           unitId: input?.unitId || undefined,
//           shopId: input?.shopId || [],
//           parentProductId,
//         });

//         await newSubProduct.save();
//         if (newSubProduct.check || newSubProduct.using) {
//           const exists = await Warehouse.findOne({
//             subProduct: newSubProduct._id,
//           });
//           if (!exists) {
//             await Warehouse.create({
//               subProduct: newSubProduct._id,
//               stock: 0,
//               minStock: 0,
//             });
//           }
//         }
//         return successResponse();
//       } catch (error) {
//         console.error(error);
//         return errorResponse();
//       }
//     },
//     adjustStock: async (_, { input }, { user }) => {
//       try {
//         const { subProductId, quantity, type, reason } = input;

//         const sub = await SubProduct.findById(subProductId);
//         if (!sub) throw new Error("SubProduct not found");

//         const warehouse = await Warehouse.findOne({ subProduct: subProductId });
//         if (!warehouse) throw new Error("Warehouse entry not found");

//         const previousStock = sub.stock || 0;
//         let newStock = previousStock;

//         if (type === "in") newStock += quantity;
//         else if (type === "out") {
//           newStock -= quantity;
//           if (newStock < 0) newStock = 0;
//         }

//         sub.stock = newStock;
//         await sub.save();

//         warehouse.stock = newStock;
//         await warehouse.save();

//         const movement = await StockMovement.create({
//           shop: sub.shopId,
//           user: user?._id,
//           product: sub.parentProductId,
//           subProduct: sub._id,
//           type,
//           quantity,
//           reason,
//           previousStock,
//           newStock,
//         });
//         return {
//           ...successResponse(),
//           movement,
//         };
//       } catch (error) {
//         return errorResponse();
//       }
//     },

//     updateSubProduct: async (_, { _id, input }, { user }) => {
//       try {
//         const product = await SubProduct.findById(_id);
//         if (!product) return errorResponse("SubProduct not found");

//         Object.assign(product, {
//           ...input,
//           unitId: input?.unitId || product.unitId,
//           shopId: input?.shopId ?? product.shopId,
//         });

//         await product.save();
//         if (product.check || product.using) {
//           const exists = await Warehouse.findOne({ subProduct: product._id });
//           if (!exists) {
//             await Warehouse.create({
//               subProduct: product._id,
//               stock: 0,
//               minStock: 0,
//             });
//           }
//         }

//         return successResponse();
//       } catch (error) {
//         console.error(error);
//         return errorResponse();
//       }
//     },

//     deleteSubProduct: async (_, { _id }) => {
//       try {
//         const product = await SubProduct.findById(_id);
//         if (!product) return errorResponse("SubProduct not found");
//         await SubProduct.deleteOne({ _id });
//         return successResponse();
//       } catch (error) {
//         console.error(error);
//         return errorResponse();
//       }
//     },

//     createSale: async (_, { input }, { user }) => {
//       try {
//         if (!input?.shopId) {
//           return errorResponse("shopId is required");
//         }

//         if (!input?.items || input.items.length === 0) {
//           return errorResponse("Sale items are required");
//         }

//         const saleNumber = generateSaleNumber();
//         const userId = user?._id || null;

//         const sale = new Sale({
//           ...input,
//           saleNumber,
//           shopId: input.shopId,
//           user: userId,
//         });

//         await sale.save();

//         for (const item of input.items) {
//           const subProduct = await SubProduct.findById(item.subProductId);
//           if (!subProduct) {
//             return errorResponse("SubProduct not found");
//           }

//           let previousStock = subProduct.stock;
//           let newStock = subProduct.stock;

//           if (subProduct.check === true) {
//             const warehouse = await Warehouse.findOne({
//               subProduct: subProduct._id,
//             });

//             if (!warehouse) {
//               return errorResponse(
//                 `Warehouse record missing for subProduct ${subProduct._id}`
//               );
//             }

//             newStock = previousStock - item.quantity;

//             if (newStock < 0) {
//               return {
//                 isSuccess: false,
//                 message: {
//                   messageEn: "Not enough stock",
//                   messageKh: "មិនមានស្តុកគ្រប់គ្រាន់",
//                 },
//               }
//             }

//             subProduct.stock = newStock;
//             await subProduct.save();

//             warehouse.stock = newStock;
//             await warehouse.save();
//           }

//           await StockMovement.create({
//             shop: input.shopId,
//             user: userId,
//             product: subProduct.parentProductId,
//             subProduct: subProduct._id,
//             type: "out",
//             quantity: item.quantity,
//             reason: "Sale",
//             reference: saleNumber,
//             previousStock,
//             newStock,
//           });
//         }

//         const populatedSale = await Sale.findById(sale._id)
//           .populate("user")
//           .populate("items.product");

//         return {
//           ...successResponse(),
//           populatedSale,
//         };
//       } catch (error) {
//         console.error("createSale error:", error);
//         return errorResponse(error?.message || "Failed to create sale");
//       }
//     },

//     refundSale: async (_, { id }, { user }) => {
//       requireRole(user, ["superAdmin", "admin"]);
//       const sale = await Sale.findById(id);
//       if (!sale) {
//         throw new GraphQLError("Sale not found");
//       }

//       if (sale.status === "refunded") {
//         throw new GraphQLError("Sale already refunded");
//       }

//       sale.status = "refunded";
//       await sale.save();

//       for (const item of sale.items) {
//         const product = await Product.findById(item.product);
//         if (product) {
//           const previousStock = product.stock;
//           const newStock = previousStock + item.quantity;

//           product.stock = newStock;
//           product.updatedAt = new Date();
//           await product.save();

//           const stockMovement = new StockMovement({
//             product: item.product,
//             type: "in",
//             quantity: item.quantity,
//             reason: "Refund",
//             reference: sale.saleNumber,
//             user: user.id,
//             previousStock,
//             newStock,
//           });
//           await stockMovement.save();
//         }
//       }

//       return await Sale.findById(id)
//         .populate("cashier")
//         .populate("items.product");
//     },
//   },
// };

import { errorResponse, successResponse } from "../utils/response.js";
import Shop from "../models/Shop.js";
import { requireRole } from "./auth.js";

export const shopResolvers = {
  Query: {
    getAllShops: async (_, { _id }) => {
      const shops = await Shop.find({ user: _id })
        .populate({
          path: "user",
          select: "nameEn nameKh email role",
        })
        .exec();

      shops.forEach((shop) => {
        shop.user = shop.user.filter((u) => u !== null);
      });

      return shops;
    },
    
    getShopByShopId: async (_, { _id, shopId }) => {
      try {
        const shop = await Shop.findOne({
          _id: shopId,
          user: { $in: [_id] },
        })
          .populate({
            path: "user",
            select: "nameEn nameKh email role",
          })
          .exec();

        if (!shop) {
          return null;
        }

        shop.user = shop.user.filter((u) => u !== null);
        return shop;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to get shop");
      }
    },
  },

  Mutation: {
    createShop: async (_, { input }, { user }) => {
      requireRole(user, ["admin", "superAdmin"]);
      try {
        const existingShop = await Shop.findOne({ nameEn: input.nameEn });
        if (existingShop) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Shop already exists",
              messageKh: "ហាងមានរួចហើយ",
            },
          };
        }

        const shop = new Shop({
          ...input,
          user: [user._id],
        });

        const shopSave = await shop.save();
        return {
          ...successResponse(),
          shop: shopSave,
        };
      } catch (error) {
        console.error(error);
        return errorResponse();
      }
    },
    
    addUserControllShop: async (_, { _id, userId }, { user }) => {
      requireRole(user, ["superAdmin", "admin"]);
      try {
        const existShop = await Shop.findById(_id);
        if (!existShop) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Shop not found",
              messageKh: "មិនមានហាង",
            },
          };
        }

        const usersToAdd = Array.isArray(userId) ? userId : [userId];
        await Shop.findByIdAndUpdate(
          _id,
          { $addToSet: { user: { $each: usersToAdd } } },
          { new: true }
        );

        return successResponse();
      } catch (error) {
        console.error(error);
        return {
          isSuccess: false,
          message: {
            messageEn: "Something went wrong",
            messageKh: "មានបញ្ហា",
          },
        };
      }
    },
    
    deleteUserFromShop: async (_, { _id, userId }, { user }) => {
      requireRole(user, ["superAdmin"]);
      try {
        const existShop = await Shop.findById(_id);
        if (!existShop) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Shop not found",
              messageKh: "មិនមានហាង",
            },
          };
        }

        const usersToRemove = Array.isArray(userId) ? userId : [userId];
        await Shop.findByIdAndUpdate(
          _id,
          { $pull: { user: { $in: usersToRemove } } },
          { new: true }
        );

        return successResponse();
      } catch (error) {
        console.error(error);
        return {
          isSuccess: false,
          message: {
            messageEn: "Something went wrong",
            messageKh: "មានបញ្ហា",
          },
        };
      }
    },

    updateShop: async (_, { _id, input }, { user }) => {
      requireRole(user, ["admin", "superAdmin"]);
      try {
        const existShop = await Shop.findById(_id);
        if (!existShop) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Shop not found",
              messageKh: "មិនមានហាង",
            },
          };
        }
        await Shop.findByIdAndUpdate(_id, input, { new: true });
        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },
    
    deleteShop: async (_, { _id }) => {
      try {
        const existingShop = await Shop.findById(_id);
        if (!existingShop) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Shop not found",
              messageKh: "មិនមានហាង",
            },
          };
        }

        await Shop.findByIdAndDelete(_id);
        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },
  },
};
import paginateQuery from "../utils/paginateQuery.js";
import { errorResponse, successResponse } from "../utils/response.js";
import Unit from "../models/Unit.js";
import { requireRole } from "./auth.js";

export const unitResolvers = {
  Query: {
    getUnit: async (_, { user }) => {
      try {
        const units = await Unit.find();
        return units;
      } catch (error) {
        console.log("Error", error);
        return [];
      }
    },
    
    getUnitWithPagination: async (
      _,
      { page = 1, limit = 5, pagination = true, keyword = "" },
      { user }
    ) => {
      try {
        const query = {
          ...(keyword && {
            $or: [
              { nameEn: { $regex: keyword, $options: "i" } },
              { nameKh: { $regex: keyword, $options: "i" } },
            ],
          }),
        };

        const paginationQuery = await paginateQuery({
          model: Unit,
          query,
          page,
          limit,
          pagination,
        });

        return {
          data: paginationQuery?.data,
          paginator: paginationQuery?.paginator,
        };
      } catch (error) {
        console.log("Error", error);
      }
    },
  },

  Mutation: {
    createUnit: async (_, { input }, { user }) => {
      requireRole(user, ["admin", "superAdmin"]);

      try {
        const existingUnit = await Unit.findOne({
          $or: [{ nameKh: input.nameEn }, { nameEn: input.nameEn }],
        });
        if (existingUnit) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Exist Unit",
              messageKh: "មានរួចហើយ",
            },
          };
        }
        const unit = new Unit(input);
        const unitSave = await unit.save();
        return {
          ...successResponse(),
          unitSave,
        };
      } catch (error) {
        return errorResponse();
      }
    },
    
    updateUnit: async (_, { _id, input }) => {
      try {
        const existingUnit = await Unit.findById(_id);
        if (!existingUnit) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Unit not found",
              messageKh: "មិនមានឯកតា",
            },
          };
        }

        await Unit.findByIdAndUpdate(_id, input, { new: true });
        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },
    
    updateUnitStatus: async (_, { _id, active }) => {
      try {
        const existingUnit = await Unit.findById(_id);
        if (!existingUnit) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Unit not found",
              messageKh: "មិនមានឯកតា",
            },
          };
        }

        await Unit.findByIdAndUpdate(_id, { active }, { new: true });
        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },
    
    deleteUnit: async (_, { _id }) => {
      try {
        const existingUnit = await Unit.findById(_id);
        if (!existingUnit) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Unit not found",
              messageKh: "មិនមានឯកតា",
            },
          };
        }

        await Unit.findByIdAndDelete(_id);
        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },
  },
};
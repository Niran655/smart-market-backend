import paginateQuery from "../utils/paginateQuery.js";
import Warehouse from "../models/Warehouse.js";
 

export const warehouseResolvers = {
  Query: {
    getProductWareHouseWithPagination: async (
      _,
      { page = 1, limit = 5, pagination = true, keyword = "" }
    ) => {
      try {
        const paginationQuery = await paginateQuery({
          model: Warehouse,
          page,
          limit,
          pagination,
          populate: [
            {
              path: "subProduct",
              populate: {
                path: ["unitId", "parentProductId"],
              },
            },
          ],
        });
        return {
          data: paginationQuery?.data,
          paginator: paginationQuery?.paginator,
        };
      } catch (error) {
        console.error("error", error);
      }
    },
  },
};
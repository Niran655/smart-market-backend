
import WarehouseInShop from "../models/WarehouseInShop.js";
import paginateQuery from "../utils/paginateQuery.js";
import { requireAuth } from "./auth.js"


export const warehouseInshopResolver = {
    Query: {
        getProductWareHouseInShopoWithPagination: async (
            _,
            { page = 1, limit = 5, pagination = true, keyword = "", shopId },
            { user }) => {
            requireAuth(user);
            try {
                const query = {
                    shop: shopId,
                    ...(keyword && {
                        $or: [
                            { minStock: { $regex: keyword, $options: "i" } }
                        ]
                    })
                }
                const paginationQuery = await paginateQuery({
                    model: WarehouseInShop,
                    query,
                    page,
                    limit,
                    pagination,
                    keyword,
                    populate: ["subProduct"]
                });
                return {
                    data: paginationQuery?.data,
                    paginator: paginationQuery?.paginator
                }
            } catch (error) {
                console.log("Error", error)
            }
        }
    }
}
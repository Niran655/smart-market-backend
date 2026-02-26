import Supplier from "../models/Supplier.js";
import paginateQuery from "../utils/paginateQuery.js";
import { errorResponse, successResponse } from "../utils/response.js";
export const supplierResolvers = {
    Query: {
        getSuppliersWithPagination: async (_, { page, limit, pagination, keyword }) => {
            try {
                const query = {};
                if (keyword) {
                    query.$or = [
                        { nameKh: { $regex: keyword, $options: "i" } },
                        { nameEn: { $regex: keyword, $options: "i" } }
                    ];
                }
                const paginationQuery = await paginateQuery({
                    model: Supplier,
                    query,
                    page,
                    limit,
                    pagination,

                });

                return {
                    data: paginationQuery?.data,
                    paginator: paginationQuery?.paginator,
                }


            } catch (error) {
                console.error(error);
                throw error;
            }
        }
    },
    Mutation: {
        createSupplier: async (_, { input }, { user }) => {
            try {
                const newSupplier = new Supplier({
                    ...input,
                });

                await newSupplier.save();
                return successResponse();

            } catch (error) {
                console.error(error);
                return errorResponse();
            }
        },
        updateSupplier: async (_, { _id, input }, { user }) => {
            try {
                await Supplier.findByIdAndUpdate(_id, {
                    ...input,
                });
                return successResponse();

            } catch (error) {
                console.error(error);
                return errorResponse();
            }
        },
        deleteSupplier: async (_, { _id }, { user }) => {
            try {
                await Supplier.findByIdAndDelete(_id);
                return successResponse();
            } catch (error) {
                console.error(error);
                return errorResponse();
            }
        }
    }
}
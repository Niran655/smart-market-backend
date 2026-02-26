import mongoose from "mongoose"
import Sale from "../models/Sale.js";
import WarehouseInShop from "../models/WarehouseInShop.js";
import User from "../models/User.js";
export const reportResolver = {
    Query: {
        getReportStats: async (
            _,
            { shopId, type, startDate, endDate },
            { user }
        ) => {
            try {
                const shopFilter = {
                    ...(shopId ? { shopId: new mongoose.Types.ObjectId(shopId) } : {})
                };

                // ---------------- DATE FILTER ----------------
                let dateFilter = {};

                if (startDate && endDate) {
                    const start = startDate ? new Date(startDate) : new Date(0);
                    start.setHours(0, 0, 0, 0);

                    const end = endDate ? new Date(endDate) : new Date();
                    end.setHours(23, 59, 59, 999);

                    dateFilter = {
                        createdAt: { $gte: start, $lte: end },
                    };
                }

                // ================= SALES REPORT ===================
                if (type === "SALES") {
                    const sales = await Sale.find(
                        {
                            ...shopFilter,
                            ...dateFilter
                        }
                    );

                    const totalRevenue = sales.reduce(
                        (acc, s) => acc + (s.total || 0),
                        0
                    );

                    const totalOrders = sales.length;

                    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

                    const topProductsAgg = await Sale.aggregate([
                        {
                            $match: {
                                ...shopFilter,
                                ...dateFilter
                            }
                        },
                        {
                            $unwind: "$items"
                        },
                        {
                            $group: {
                                _id: "$items.subProductId",
                                name: {
                                    $first: "$items.name"
                                },
                                sales: {
                                    $sum: "$items.quantity"
                                },
                                revenue: {
                                    $sum: {
                                        $multiply: [
                                            "$items.quantity",
                                            "$items.price"
                                        ]
                                    }
                                }
                            }
                        },
                        {
                            $sort: {
                                revenue: -1
                            }
                        },
                        { $limit: 5 }
                    ]);

                    const topProducts = topProductsAgg.map((p) => ({
                        id: p._id,
                        name: p.name,
                        category: "",
                        sales: p.sales,
                        revenue: p.revenue,
                    }));

                    const recentTransactions = sales
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .slice(0, 10)
                        .map((s) => ({
                            id: s._id,
                            date: s.createdAt,
                            customer: s?.user?.nameEn || "Guest",
                            type: "Sale",
                            amount: s.total,
                            status: s.status,
                        }));

                    return {
                        sales: {
                            totalRevenue,
                            totalOrders,
                            averageOrderValue,
                            topProducts,
                            recentTransactions,
                        },
                    };
                };

                if (type === "STAFF") {
                    const staffList = await User.find({
                        role: { $in: ["cashier", "manager","superAdmin"] },
                    });

                    const totalStaff = staffList.length;
                    const activeStaff = staffList.filter((s) => s.active).length;
                    const totalHours = 0;  

                    const staffSales = await Sale.aggregate([
                        { $match: { ...shopFilter, ...dateFilter } },
                        {
                            $group: {
                                _id: "$user",
                                sales: { $sum: "$total" },
                                orders: { $sum: 1 },
                            },
                        },
                    ]);

                    const performance = staffList.map((staff) => {
                        const match = staffSales.find((s) => s._id?.toString() === staff._id.toString());
                        return {
                            id: staff._id,
                            name: staff.nameEn,
                            role: staff.role,
                            hours: 0,
                            sales: match?.sales || 0,
                            orders: match?.orders || 0,
                        };
                    });

                    const totalSales = staffSales.reduce((acc, s) => acc + s.sales, 0);
                    const salesPerStaff = totalStaff > 0 ? totalSales / totalStaff : 0;

                    return {
                        staff: {
                            totalStaff,
                            activeStaff,
                            totalHours,
                            totalSales,
                            salesPerStaff,
                            performance,
                        },
                    };
                }

                // ================= INVENTORY REPORT ===================
                if (type === "INVENTORY") {
                    const items = await WarehouseInShop.find({
                        ...shopFilter,
                        ...dateFilter
                    }).populate([
                        {
                            path: "subProduct",
                            populate: {
                                path: "parentProductId",
                                model: "Product",
                                populate: {
                                    path: "categoryId",
                                    model: "Category"
                                }
                            }
                        },
                        {
                            path: "subProduct",
                            populate: {
                                path: "unitId",
                                model: "Unit"
                            }
                        }
                    ]);

                    const totalItems = items.length;
                    const lowStockCount = items.filter((i) => i.stock <= i.minStock).length;
                    const totalValue = items.reduce(
                        (acc, i) => acc + i.stock * (i.subProduct?.costPrice || 0),
                        0
                    );

                    return {
                        inventory: {
                            totalItems,
                            lowStockCount,
                            totalValue,
                            items: items.map((i) => ({
                                id: i._id,
                                name: i.subProduct?.parentProductId?.nameEn || "Unknown",
                                category: i.subProduct?.parentProductId?.categoryId?.nameEn || "Unknown",
                                stock: i.stock,
                                unit: i.subProduct?.unitId?.nameEn || null,
                                reorderLevel: i.minStock,
                                value: i.stock * (i.subProduct?.costPrice || 0),
                            })),
                        },
                    };
                }

                return {};

            } catch (error) {
                console.error("Error in getReportStats:", error);
                throw new Error("Failed to fetch report stats");

            }

        }
    }
}
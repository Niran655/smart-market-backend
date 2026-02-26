import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import Category from "../models/Category.js";
import { requireRole } from "./auth.js";

export const dashboardStatsResolver = {
  Query: {
    dashboardStats: async (_, { shopId, filter, dayStart, dayEnd }, { user }) => {
      try {

        requireRole(user, ["superAdmin", "admin"]);
        // -------------------- DATE FILTER --------------------
        let startDate, endDate;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filter) {
          case "today":
            startDate = new Date(today);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "yesterday":
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 1);
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "last7days":
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 6);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "last30days":
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 29);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "thisMonth":
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
          case "lastMonth":
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
            break;
          case "customRange":
            if (!dayStart || !dayEnd)
              throw new Error("Provide dayStart and dayEnd for custom range");
            startDate = new Date(dayStart);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(dayEnd);
            endDate.setHours(23, 59, 59, 999);
            break;
          default:
            startDate = null;
            endDate = null;
        }

        const dateFilter =
          startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {};
 
        let shopFilter = {};
        if (shopId) {
          if (!mongoose.Types.ObjectId.isValid(shopId)) {
            throw new Error("Invalid shopId format");
          }
          shopFilter = { shopId: new mongoose.Types.ObjectId(shopId) };
        }

        // -------------------- TOTAL ORDERS --------------------
        const totalOrders = await Sale.countDocuments({ ...shopFilter, ...dateFilter });

        // -------------------- TOTAL SALES --------------------
        const salesAgg = await Sale.aggregate([
          { $match: { ...shopFilter, ...dateFilter } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]);
        const totalSales = salesAgg[0]?.total || 0;

        // -------------------- AVERAGE VALUE --------------------
        const averageValue = totalOrders ? totalSales / totalOrders : 0;

        // -------------------- RESERVATIONS --------------------
        const reservations = await Sale.countDocuments({
          ...shopFilter,
          status: "pending",
          ...dateFilter,
        });

        // -------------------- DAILY REVENUE--------------------
        let dailyRevenue = [];
        if (startDate && endDate) {
          const dailyRevenues = await Sale.aggregate([
            {
              $match: {
                ...shopFilter,
                createdAt: { $gte: startDate, $lte: endDate },
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                total: { $sum: "$total" },
              },
            },
            { $sort: { _id: 1 } },
          ]);
 
          const revenueMap = {};
          dailyRevenues.forEach((r) => {
            revenueMap[r._id] = r.total;
          });

          const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
          for (let i = 0; i < dayCount; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split("T")[0];
            dailyRevenue.push(revenueMap[dateStr] || 0);
          }
        }

        // -------------------- TOP SELLING ITEMS --------------------
        const topItems = await Sale.aggregate([
          { $match: { ...shopFilter, ...dateFilter } },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.name",
              orders: { $sum: "$items.quantity" },
            },
          },
          { $sort: { orders: -1 } },
          { $limit: 5 },
          { $project: { name: "$_id", orders: 1, _id: 0 } },
        ]);

        const topSellingItems = topItems.map((item, index) => ({
          rank: index + 1,
          name: item.name,
          orders: item.orders,
        }));

        // -------------------- ACTIVE ORDERS (with populated user if needed) --------------------
        const activeSales = await Sale.find({
          ...shopFilter,
          status: "pending",
          ...dateFilter,
        })
          .populate("user", "nameEn")
          .sort({ createdAt: -1 })
          .limit(10);

        const activeOrders = activeSales.map((sale) => ({
          name: sale.user?.nameEn || "Unknown",
          type: sale.status,
          table: sale.items?.[0]?.table || null,
        }));

        // -------------------- CATEGORY STATS (single aggregation) --------------------
        const categoryStats = await Category.aggregate([
          {
            $lookup: {
              from: "subproducts",
              localField: "_id",
              foreignField: "categoryId",
              as: "subs",
            },
          },
          { $unwind: "$subs" },
          {
            $lookup: {
              from: "sales",
              let: { subId: "$subs._id" },
              pipeline: [
                {
                  $match: {
                    ...shopFilter,
                    ...dateFilter,
                  },
                },
                { $unwind: "$items" },
                {
                  $match: {
                    $expr: { $eq: ["$items.subProductId", "$$subId"] },
                  },
                },
                {
                  $group: {
                    _id: null,
                    total: { $sum: "$items.quantity" },
                  },
                },
              ],
              as: "ordersData",
            },
          },
          {
            $project: {
              category: "$nameEn",
              orders: { $ifNull: [{ $arrayElemAt: ["$ordersData.total", 0] }, 0] },
            },
          },
        ]);

        return {
          totalOrders,
          totalSales,
          reservations,
          averageValue,
          dailyRevenue,          
          topSellingItems,
          activeOrders,
          categoryStats,
        };
      } catch (error) {
        console.error("Dashboard Stats Error:", error);
        throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
      }
    },
  },
};
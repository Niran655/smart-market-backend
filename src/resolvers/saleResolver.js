// import { requireRole } from "../auth.js";
import WarehouseInShop from "../models/WarehouseInShop.js";
import StockMovement from "../models/StockMovement.js";
import SubProduct from "../models/SubProduct.js";
import { errorResponse, successResponse } from "../utils/response.js";
import Sale from "../models/Sale.js";
 

const generateSaleNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `S-${datePart}-${rand}`;
};


export const saleResolvers = {
  Query: {
     
    getSales: async (_, { shopId, status, startDate, endDate, page = 1, limit = 10, pagination = true }) => {
      try {
        const query = {};

        if (shopId) query.shopId = shopId;
        if (status) query.status = status;

        if (startDate || endDate) {
          query.createdAt = {};
          if (startDate) query.createdAt.$gte = new Date(startDate);
          if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (pagination) {
          const skip = (page - 1) * limit;
          const [sales, totalDocs] = await Promise.all([
            Sale.find(query)
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit)
              .populate("user")
              .populate({
                path: "items.product",
                model: "Product"
              }),
            Sale.countDocuments(query)
          ]);

          const totalPages = Math.ceil(totalDocs / limit);

          return {
            data: sales,
            paginator: {
              slNo: skip + 1,
              prev: page > 1 ? page - 1 : null,
              next: page < totalPages ? page + 1 : null,
              perPage: limit,
              totalPosts: totalDocs,
              totalPages,
              currentPage: page,
              hasPrevPage: page > 1,
              hasNextPage: page < totalPages,
              totalDocs
            }
          };
        } else {
          const sales = await Sale.find(query)
            .sort({ createdAt: -1 })
            .populate("user")
            .populate({
              path: "items.product",
               
              model: "Product"
            });
          return {
            data: sales,
            paginator: null
          };
        }
      } catch (error) {
        console.error("getSales error:", error);
        throw new Error("Failed to fetch sales");
      }
    },

    getSaleById: async (_, { _id }) => {
      try {
        const sale = await Sale.findById(_id)
          .populate("user")
          .populate({
            path: "items.product",
            model: "Product"
          })
          .populate({
            path: "items.subProductId",
            model: "SubProduct"
          });

        if (!sale) {
          throw new Error("Sale not found");
        }

        return sale;
      } catch (error) {
        console.error("getSaleById error:", error);
        throw new Error("Failed to fetch sale");
      }
    }
  },

  Mutation: {
    createSale: async (_, { input }, { user }) => {
      try {
        console.log("Creating sale with input:", JSON.stringify(input, null, 2));

        if (!input?.shopId) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Shop ID is required",
              messageKh: "ត្រូវការ ID ហាង",
            }
          };
        }

        if (!input?.items || input.items.length === 0) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Sale items are required",
              messageKh: "ត្រូវការធាតុក្នុងការលក់",
            }
          };
        }

        const saleNumber = generateSaleNumber();
        const userId = user?._id || null;

        // Calculate totals
        const subtotal = input.items.reduce((sum, item) => {
          const itemTotal = item.price * item.quantity;
          return sum + itemTotal;
        }, 0);

        const tax = input.tax || subtotal * 0.1;
        const discount = input.discount || 0;
        const total = subtotal + tax - discount;

        // Create sale object
        const saleData = {
          saleNumber,
          user: userId,
          shopId: input.shopId,
          items: input.items.map(item => ({
            product: item.product,
            subProductId: item.subProductId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
          })),
          subtotal,
          tax,
          discount,
          total,
          paymentMethod: input.paymentMethod || "cash",
          amountPaid: input.amountPaid || 0,
          change: input.change || 0,
          status: input.status || "completed",
        };

        const sale = new Sale(saleData);
        await sale.save();

        // Update stock only for completed sales
        if (sale.status === "completed") {
          for (const item of input.items) {
            const subProduct = await SubProduct.findById(item.subProductId);
            if (!subProduct) {
              console.warn(`SubProduct not found: ${item.subProductId}`);
              continue;
            }

            const warehouseInShop = await WarehouseInShop.findOne({
              shop: input.shopId,
              subProduct: subProduct._id,
            });

            if (!warehouseInShop) {
              console.warn(`No stock found for subProduct: ${item.subProductId} in shop: ${input.shopId}`);
              continue;
            }

            const previousStock = warehouseInShop.stock || 0;
            const newStock = previousStock - item.quantity;

            if (newStock < 0) {
              // Rollback the sale creation
              await Sale.findByIdAndDelete(sale._id);
              return {
                isSuccess: false,
                message: {
                  messageEn: `Not enough stock for ${item.name}`,
                  messageKh: `ស្តុកមិនគ្រប់គ្រាន់សម្រាប់ ${item.name}`,
                }
              };
            }

            warehouseInShop.stock = newStock;
            warehouseInShop.updatedAt = new Date();
            await warehouseInShop.save();

            await StockMovement.create({
              shop: input.shopId,
              user: userId,
              product: subProduct.parentProductId,
              subProduct: subProduct._id,
              type: "out",
              quantity: item.quantity,
              reason: "Sale",
              reference: saleNumber,
              previousStock,
              newStock,
            });
          }
        }

        return {
          isSuccess: true,
          message: {
            messageEn: sale.status === "pending"
              ? "Invoice saved as pending successfully"
              : "Sale completed successfully",
            messageKh: sale.status === "pending"
              ? "វិក័យប័ត្រត្រូវបានរក្សាទុកជាបណ្ដោះអាសន្នដោយជោគជ័យ"
              : "ការលក់បានជោគជ័យ",
          }
        };
      } catch (error) {
        console.error("createSale error:", error);
        return {
          isSuccess: false,
          message: {
            messageEn: "Failed to create sale",
            messageKh: "មិនអាចបង្កើតការលក់បាន",
          }
        };
      }
    },

    updateSaleStatus: async (_, { id, status, paymentInfo }, { user }) => {
      try {
        const sale = await Sale.findById(id);
        if (!sale) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Sale not found",
              messageKh: "រកមិនឃើញការលក់",
            }
          };
        }

        if (!["completed", "pending", "refunded"].includes(status)) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Invalid status",
              messageKh: "ស្ថានភាពមិនត្រឹមត្រូវ",
            }
          };
        }

        const previousStatus = sale.status;

        // Update sale
        sale.status = status;

        if (paymentInfo) {
          sale.paymentMethod = paymentInfo.method || sale.paymentMethod;
          sale.amountPaid = paymentInfo.amountPaid || sale.amountPaid;
          sale.change = paymentInfo.change || sale.change;
        }

        await sale.save();

        // If changing from pending to completed, deduct stock
        if (status === "completed" && previousStatus === "pending") {
          for (const item of sale.items) {
            const subProduct = await SubProduct.findById(item.subProductId);
            if (!subProduct) {
              console.warn(`SubProduct not found: ${item.subProductId}`);
              continue;
            }

            const warehouseInShop = await WarehouseInShop.findOne({
              shop: sale.shopId,
              subProduct: subProduct._id,
            });

            if (warehouseInShop) {
              const previousStock = warehouseInShop.stock || 0;
              const newStock = previousStock - item.quantity;

              if (newStock < 0) {
                // Revert status change
                sale.status = previousStatus;
                await sale.save();

                return {
                  isSuccess: false,
                  message: {
                    messageEn: `Not enough stock for ${item.name}`,
                    messageKh: `ស្តុកមិនគ្រប់គ្រាន់សម្រាប់ ${item.name}`,
                  }
                };
              }

              warehouseInShop.stock = newStock;
              warehouseInShop.updatedAt = new Date();
              await warehouseInShop.save();

              await StockMovement.create({
                shop: sale.shopId,
                user: user?._id,
                product: subProduct.parentProductId,
                subProduct: subProduct._id,
                type: "out",
                quantity: item.quantity,
                reason: "Sale Completion",
                reference: sale.saleNumber,
                previousStock,
                newStock,
              });
            }
          }
        }

        return {
          isSuccess: true,
          message: {
            messageEn: `Sale status updated to ${status}`,
            messageKh: `ស្ថានភាពការលក់ត្រូវបានអាប់ដេតទៅ ${status}`,
          }
        };
      } catch (error) {
        console.error("updateSaleStatus error:", error);
        return {
          isSuccess: false,
          message: {
            messageEn: "Failed to update sale status",
            messageKh: "មិនអាចអាប់ដេតស្ថានភាពការលក់បាន",
          }
        };
      }
    },

    refundSale: async (_, { id }, { user }) => {
      try {
        const sale = await Sale.findById(id)
          .populate("user")
          .populate({
            path: "items.product",
            model: "Product"
          })
          .populate({
            path: "items.subProductId",
            model: "SubProduct"
          });

        if (!sale) {
          throw new Error("Sale not found");
        }

        if (sale.status === "refunded") {
          throw new Error("Sale already refunded");
        }

        const previousStatus = sale.status;
        sale.status = "refunded";
        await sale.save();

        // Restore stock if the sale was completed
        if (previousStatus === "completed") {
          for (const item of sale.items) {
            const subProduct = await SubProduct.findById(item.subProductId);
            if (subProduct) {
              const warehouseInShop = await WarehouseInShop.findOne({
                shop: sale.shopId,
                subProduct: subProduct._id,
              });

              if (warehouseInShop) {
                const previousStock = warehouseInShop.stock || 0;
                const newStock = previousStock + item.quantity;

                warehouseInShop.stock = newStock;
                warehouseInShop.updatedAt = new Date();
                await warehouseInShop.save();

                await StockMovement.create({
                  shop: sale.shopId,
                  user: user?._id,
                  product: subProduct.parentProductId,
                  subProduct: subProduct._id,
                  type: "in",
                  quantity: item.quantity,
                  reason: "Refund",
                  reference: sale.saleNumber,
                  previousStock,
                  newStock,
                });
              }
            }
          }
        }

        return sale;
      } catch (error) {
        console.error("refundSale error:", error);
        throw new Error(error.message || "Failed to refund sale");
      }
    },
  },
};
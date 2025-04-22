import mongoose from "mongoose";
import connectDB from "./db";
import Product from "./models/Product";
import Order from "./models/Order";

const runGroupingAggregation = async () => {
    try {
        await connectDB();

        // Example 1: Count products by category
        console.log("\n=== 1. Product Count by Category ===");
        const productsByCategory = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    averagePrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);
        console.log(productsByCategory);

        // Example 2: Calculate order statistics
        console.log("\n=== 2. Order Statistics ===");
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    orderCount: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    averageOrderValue: { $avg: "$totalAmount" },
                },
            },
            {
                $sort: { orderCount: -1 },
            },
        ]);
        console.log(orderStats);

        // Example 3: Count orders by payment method
        console.log("\n=== 3. Orders by Payment Method ===");
        const ordersByPayments = await Order.aggregate([
            {
                $group: {
                    _id: "$paymentMethod",
                    orderCount: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                },
            },
            {
                $project: {
                    paymentMethod: "$_id",
                    orderCount: 1,
                    totalRevenue: 1,
                    _id: 0,
                    percentageOfTotal: {
                        $multiply: [
                            {
                                $divide: ["$orderCount", 100],
                            },
                            100,
                        ],
                    },
                },
            },
            {
                $sort: { totalRevenue: 1 },
            },
        ]);
        console.log(ordersByPayments);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error in grouping aggregation:", error);
        process.exit(1);
    }
};

runGroupingAggregation();

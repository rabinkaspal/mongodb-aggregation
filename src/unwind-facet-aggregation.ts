import mongoose from "mongoose";
import connectDB from "./db";
import Order from "./models/Order";
import Product from "./models/Product";

const runUnwindFacetAggregation = async () => {
    try {
        await connectDB();

        // Example 1: Unwinding order items to analyze product sales
        console.log("\n=== Product Sales Analysis ===");
        const productSales = await Order.aggregate([
            {
                $match: {
                    status: { $ne: ["delivered", "shipped"] },
                },
            },
            {
                $unwind: "$items",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails",
            },
            {
                $group: {
                    _id: {
                        productId: "$items.product",
                        productName: "$productDetails.name",
                        productCategory: "$productDetails.category",
                    },
                    totalQuantitySold: { $sum: "$items.quantity" },
                    totalRevenue: {
                        $sum: { $multiply: ["$items.price", "$items.quantity"] },
                    },
                    orderCount: { $sum: 1 },
                },
            },
            {
                $sort: { totalRevenue: -1 },
            },
            {
                $limit: 10,
            },
            {
                $project: {
                    _id: 0,
                    productName: "$_id.productName",
                    category: "$_id.productCategory",
                    totalQuantitySold: 1,
                    totalRevenue: 1,
                    orderCount: 1,
                    averageOrderQuantity: {
                        $divide: ["$totalQuantitySold", "$orderCount"],
                    },
                },
            },
        ]);

        console.log("Product Sales Analysis Result:", productSales);

        // Example 2: Using facets for multi-dimensional analysis
        console.log("\n=== Multi-dimensional Product Analysis ===");
        const productAnalysis = await Product.aggregate([
            {
                $facet: {
                    categoryBreakdown: [
                        {
                            $group: {
                                _id: "$category",
                                count: { $sum: 1 },
                                averagePrice: { $avg: "$price" },
                                totalStock: { $sum: "$stockLevel" },
                            },
                        },
                        {
                            $sort: { count: -1 },
                        },
                    ],
                    priceRanges: [
                        {
                            $bucket: {
                                groupBy: "$price",
                                boundaries: [0, 100, 250, 500, 750, 1000, Infinity],
                                default: "Other",
                                output: {
                                    count: { $sum: 1 },
                                    products: {
                                        $push: { name: "$name", price: "$price" },
                                    },
                                },
                            },
                        },
                    ],
                    stockStatus: [
                        {
                            $group: {
                                _id: {
                                    $cond: {
                                        if: { $eq: ["$stockLevel", 0] },
                                        then: "Out of Stock",
                                        else: {
                                            $cond: {
                                                if: { $lt: ["$stockLevel", 10] },
                                                then: "Low Stock",
                                                else: {
                                                    $cond: {
                                                        if: { $lt: ["$stockLevel", 50] },
                                                        then: "Medium Stock",
                                                        else: "Well Stocked",
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                count: { $sum: 1 },
                                avgPrice: { $avg: "$price" },
                            },
                        },
                        {
                            $sort: { _id: 1 },
                        },
                    ],
                },
            },
        ]);

        console.log(JSON.stringify(productAnalysis, null, 2));

        mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error running aggregation:", error);
        process.exit(1);
    }
};

runUnwindFacetAggregation();

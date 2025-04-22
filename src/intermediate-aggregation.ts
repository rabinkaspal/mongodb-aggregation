import mongoose from "mongoose";
import connectDB from "./db";
import Order from "./models/Order";
import Product from "./models/Product";

const runIntermediateAggregation = async () => {
    try {
        await connectDB();

        // Example 1: Joining orders with customer information using $lookup
        console.log("\n=== 1. Orders with Customer Details ===");

        const ordersWithCustomers = await Order.aggregate([
            {
                $match: {
                    status: "delivered",
                },
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "customer",
                    foreignField: "_id",
                    as: "customerDetails",
                },
            },
            {
                $unwind: "$customerDetails",
            },
            {
                $project: {
                    _id: 1,
                    orderDate: "$createdAt",
                    totalAmount: 1,
                    customerName: {
                        $concat: [
                            "$customerDetails.firstName",
                            " ",
                            "$customerDetails.lastName",
                        ],
                    },
                    customerEmail: "$customerDetails.email",
                    shippingCity: "$shippingAddress.city",
                    status: 1,
                },
            },
            {
                $sort: {
                    orderDate: -1,
                },
            },
            {
                $limit: 5,
            },
        ]);

        console.log(ordersWithCustomers);

        // Example 2: Products with their reviews
        console.log("\n=== Products with Reviews ===");
        const productsWithReviews = await Product.aggregate([
            {
                $match: {
                    category: "Electronics",
                },
            },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "product",
                    as: "reviews",
                },
            },
            {
                $project: {
                    name: 1,
                    price: 1,
                    reviewCount: { $size: "$reviews" },
                    averageRating: {
                        $avg: "$reviews.rating",
                    },
                    reviews: {
                        $map: {
                            input: { $slice: ["$reviews", 0, 3] }, // get frist 3 reviews
                            as: "review",
                            in: {
                                title: "$$review.title",
                                rating: "$$review.rating",
                                comment: "$$review.comment",
                            },
                        },
                    },
                },
            },
            {
                $match: {
                    reviewCount: { $gt: 0 }, // Only products with reviews
                },
            },
            {
                $limit: 3,
            },
        ]);

        console.log(JSON.stringify(productsWithReviews, null, 2));

        // Example 3: Working with arrays and complex conditions
        console.log("\n=== 3. Popular Product Features ===");
        const popularFeatures = await Product.aggregate([
            {
                $project: {
                    name: 1,
                    category: 1,
                    color: "$features.color",
                    weight: "$features.weight",
                    dimensions: "$features.dimensions",
                    volume: {
                        $multiply: [
                            "$features.dimensions.depth",
                            "$features.dimensions.width",
                            "$features.dimensions.height",
                        ],
                    },
                },
            },
            {
                $match: {
                    volume: { $gt: 100 }, // Filter products with volume greater than 1000
                },
            },
            {
                $group: {
                    _id: "$color",
                    averageWeight: { $avg: "$weight" },
                    totalVolume: { $sum: "$volume" },
                    productCount: { $sum: 1 },
                    products: { $push: { name: "$name", category: "$category" } },
                },
            },
            {
                $sort: { productCount: -1 },
            },
        ]);
        console.log(JSON.stringify(popularFeatures, null, 2));

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error running intermediate aggregation:", error);
        process.exit(1);
    }
};

runIntermediateAggregation();

import mongoose from "mongoose";
import connectDB from "./db";
import Product from "./models/Product";

const basicAggregationPipelines = async () => {
    try {
        await connectDB();

        // Example 1: Finding all electronics products with price over $500
        console.log("\n=== Expensive Electronics ===");
        const expensiveElectronics = await Product.aggregate([
            {
                $match: {
                    category: "Electronics",
                    price: { $gt: 500 },
                },
            },
        ]);

        console.log(
            `Found ${expensiveElectronics.length} expensive electronics products`
        );
        console.log(
            expensiveElectronics.map(p => ({
                name: p.name,
                price: p.price,
                stockLevel: p.stockLevel,
            }))
        );

        // Example 2: Finding products with high stock levels and sorting them
        console.log("\n=== High Stock Products ===");
        const wellStockedProducts = await Product.aggregate([
            {
                $match: {
                    stockLevel: { $gt: 50 },
                },
            },
            {
                $sort: {
                    stockLevel: -1,
                },
            },
            {
                $limit: 5,
            },
        ]);
        console.log(
            wellStockedProducts.map(p => ({
                name: p.name,
                category: p.category,
                stockLevel: p.stockLevel,
            }))
        );

        // Example 3: Projecting specific fields
        console.log("\n=== Product Summary ===");
        const productSummary = await Product.aggregate([
            {
                $project: {
                    _id: 0,
                    productName: "$name",
                    productPrice: "$price",
                    inStock: { $gt: ["$stockLevel", 0] },
                },
            },
            {
                $limit: 5,
            },
            {
                $sort: {
                    productPrice: -1,
                },
            },
        ]);
        console.log(productSummary);

        mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error in basic aggregation pipelines:", error);
        process.exit(1);
    }
};

basicAggregationPipelines();

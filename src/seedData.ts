import Product from "./models/Product";
import Customer from "./models/Customer";
import Order from "./models/Order";
import Review from "./models/Review";
import connectDB from "./db";

const generateProducts = async (count: number = 50) => {
    const categories = ["Electronics", "Books", "Clothing", "Home & Kitchen", "Sports"];
    const manufacturers = [
        "TechCorp",
        "FashionBrand",
        "PublishingHouse",
        "HomeGoods",
        "SportGear",
    ];

    const products = [];
    for (let i = 0; i < count; i++) {
        const categoryIndex = Math.floor(Math.random() * categories.length);
        const manufacturerIndex = Math.floor(Math.random() * manufacturers.length);

        products.push({
            name: `Product ${i + 1}`,
            description: `Description for product ${i + 1}`,
            price: Math.floor(Math.random() * 1000) + 10,
            category: categories[categoryIndex],
            tags: ["tag1", "tag2", "tag3"].slice(0, Math.floor(Math.random() * 3) + 1),
            manufacturer: manufacturers[manufacturerIndex],
            stockLevel: Math.floor(Math.random() * 100),
            rating: Math.random() * 4 + 1,
            features: {
                color: ["red", "blue", "green", "black"][Math.floor(Math.random() * 4)],
                weight: Math.floor(Math.random() * 10) + 1,
                dimensions: {
                    width: Math.floor(Math.random() * 10) + 5,
                    height: Math.floor(Math.random() * 10) + 5,
                    depth: Math.floor(Math.random() * 10) + 5,
                },
            },
        });
    }

    const result = await Product.insertMany(products);
    console.log(`${products.length} products created`);
    return result;
};

const generateCustomers = async (count: number = 20) => {
    const customers = [];

    for (let i = 0; i < count; i++) {
        customers.push({
            firstName: `First${i + 1}`,
            lastName: `Last${i + 1}`,
            email: `customer${i + 1}@example.com`,
            phone: `555-${100 + i}`,
            address: {
                street: `${1000 + i} Main St`,
                city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][
                    Math.floor(Math.random() * 5)
                ],
                state: ["NY", "CA", "IL", "TX", "AZ"][Math.floor(Math.random() * 5)],
                zipCode: `${10000 + i}`,
                country: "USA",
            },
            dateOfBirth: new Date(
                1980 + Math.floor(Math.random() * 30),
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1
            ),
            memberSince: new Date(
                2020 + Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1
            ),
            loyaltyPoints: Math.floor(Math.random() * 1000),
            preferences: {
                favoriteCategories: ["Electronics", "Clothing", "Books"].slice(
                    0,
                    Math.floor(Math.random() * 3) + 1
                ),
                communication: {
                    email: Math.random() > 0.5,
                    sms: Math.random() > 0.5,
                },
            },
        });
    }

    const result = await Customer.insertMany(customers);
    console.log(`${customers.length} customers created`);
    return result;
};

const generateOrders = async (
    productsData: any[],
    customersData: any[],
    count: number = 100
) => {
    const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    const paymentMethods = ["credit_card", "debit_card", "paypal", "cash"];

    const orders = [];

    for (let i = 0; i < count; i++) {
        const itemCount = Math.floor(Math.random() * 5) + 1;
        const items = [];
        let totalAmount = 0;

        for (let j = 0; j < itemCount; j++) {
            const product = productsData[Math.floor(Math.random() * productsData.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const price = product.price;

            items.push({
                product: product._id,
                quantity,
                price,
            });

            totalAmount += quantity * price;
        }

        const customer = customersData[Math.floor(Math.random() * customersData.length)];

        orders.push({
            customer: customer._id,
            items,
            totalAmount,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            paymentMethod:
                paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            shippingAddress: { ...customer.address },
            createdAt: new Date(
                Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
            ),
        });
    }

    const result = await Order.insertMany(orders);
    console.log(`${orders.length} orders created`);
    return result;
};

const generateReviews = async (
    productsData: any[],
    customersData: any[],
    count: number = 200
) => {
    const reviews = [];

    for (let i = 0; i < count; i++) {
        const product = productsData[Math.floor(Math.random() * productsData.length)];
        const customer = customersData[Math.floor(Math.random() * customersData.length)];
        const rating = Math.floor(Math.random() * 5) + 1;

        reviews.push({
            product: product._id,
            customer: customer._id,
            rating,
            title: `Review ${i + 1} for ${product.name}`,
            comment: `This is review comment ${i + 1} for ${product.name}. ${
                rating >= 4
                    ? "Highly recommended!"
                    : rating >= 3
                    ? "Decent product."
                    : "Could be better."
            }`,
            helpful: Math.floor(Math.random() * 50),
            verified: Math.random() > 0.3,
            createdAt: new Date(
                Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)
            ),
        });
    }

    await Review.insertMany(reviews);
    console.log(`${reviews.length} reviews created`);
    return reviews;
};

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clean existing data
        await Promise.all([
            Product.deleteMany({}),
            Customer.deleteMany({}),
            Order.deleteMany({}),
            Review.deleteMany({}),
        ]);
        // Generate new data
        const products = await generateProducts(50);
        const customers = await generateCustomers(20);
        await generateOrders(products, customers, 100);
        await generateReviews(products, customers, 200);

        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error(`Error seeding data: ${(error as Error).message}`);
        process.exit(1);
    }
};

seedDatabase();

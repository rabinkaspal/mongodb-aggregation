import { Document, model, Schema } from "mongoose";

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category: string;
    tags: string[];
    manufacturer: string;
    stockLevel: number;
    rating: number;
    features: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
// Define the Product schema
const ProductSchema: Schema = new Schema(
    {
        name: { type: String, required: true, index: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true, index: true },
        tags: [{ type: String }],
        manufacturer: { type: String, required: true },
        stockLevel: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        features: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);
export default model<IProduct>("Product", ProductSchema);

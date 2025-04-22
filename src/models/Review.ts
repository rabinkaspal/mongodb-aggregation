import mongoose, { Schema, Document } from "mongoose";
import { ICustomer } from "./Customer";
import { IProduct } from "./Product";

export interface IReview extends Document {
    product: mongoose.Types.ObjectId | IProduct;
    customer: mongoose.Types.ObjectId | ICustomer;
    rating: number;
    title: string;
    comment: string;
    helpful: number;
    verified: boolean;
    createdAt: Date;
}

const ReviewSchema: Schema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, required: true },
        comment: { type: String, required: true },
        helpful: { type: Number, default: 0 },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

ReviewSchema.index({ product: 1 });
ReviewSchema.index({ customer: 1 });
ReviewSchema.index({ rating: 1 });

export default mongoose.model<IReview>("Review", ReviewSchema);

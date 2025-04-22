import { Schema, Document, model, Types } from "mongoose";
import { IProduct } from "./Product";
import { ICustomer } from "./Customer";

export interface IOrderItem {
    product: Types.ObjectId | IProduct;
    quantity: number;
    price: number;
}

export interface IOrder extends Document {
    customer: Types.ObjectId | ICustomer;
    items: IOrderItem[];
    totalAmount: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    paymentMethod: "credit_card" | "debit_card" | "paypal" | "cash";
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema({
    product: { type: Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
});

const OrderSchema: Schema = new Schema(
    {
        customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
        items: [{ type: OrderItemSchema, required: true }],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["credit_card", "debit_card", "paypal", "cash"],
            required: true,
        },
        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, required: true },
        },
    },
    { timestamps: true }
);

OrderSchema.index({ customer: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: 1 });

export default model<IOrder>("Order", OrderSchema);

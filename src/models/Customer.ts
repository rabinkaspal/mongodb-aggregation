import { Document, model, Schema } from "mongoose";

export interface IAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface ICustomer extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: IAddress;
    dateOfBirth: Date;
    memberSince: Date;
    loyaltyPoints: number;
    preferences: Record<string, any>;
}

const AddressSchema: Schema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
});

const CustomerSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: AddressSchema, required: true },
    dateOfBirth: { type: Date },
    memberSince: { type: Date, default: Date.now },
    loyaltyPoints: { type: Number, default: 0 },
    preferences: { type: Schema.Types.Mixed },
});
export default model<ICustomer>("Customer", CustomerSchema);

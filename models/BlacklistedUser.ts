import mongoose, { Schema } from "mongoose";

const BlacklistedUserSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        reason: {
            type: String,
            required: false,
            default: "Provider account request rejected",
        },
        blacklistedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
    },
    { timestamps: true }
);

if (mongoose.models.BlacklistedUser) {
    delete mongoose.models.BlacklistedUser;
}

export default mongoose.model("BlacklistedUser", BlacklistedUserSchema);

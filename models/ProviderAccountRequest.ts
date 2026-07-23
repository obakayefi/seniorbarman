import mongoose, { Schema } from "mongoose";
import { ROLE_GROUPS } from "@/lib/roles";

const ProviderAccountRequestSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ROLE_GROUPS.PROVIDERS,
            required: true,
        },
        // For team_manager requests
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: false,
        },
        // For organizer requests
        organizationName: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        reviewNote: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

if (mongoose.models.ProviderAccountRequest) {
    delete mongoose.models.ProviderAccountRequest;
}

export default mongoose.model("ProviderAccountRequest", ProviderAccountRequestSchema);

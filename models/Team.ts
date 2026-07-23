import mongoose, { Schema, models } from "mongoose";

const TeamSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        logo: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
        managers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isArchived: {
            type: Boolean,
            default: false,
        },
        stadium: {
            type: String,
            required: false,
        },
        ticketTypes: [
            {
                name: { type: String, required: true },
                price: { type: Number, required: true },
                perks: [{ type: String }],
                isActive: { type: Boolean, default: true }
            }
        ]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

if (mongoose.models.Team) {
    delete mongoose.models.Team;
}

export default mongoose.model("Team", TeamSchema);

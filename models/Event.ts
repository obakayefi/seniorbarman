import mongoose, { Schema } from "mongoose";

const EventSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["event", "sports"],
            required: true,
            default: "event",
        },
        title: {
            type: String,
            required: function () {
                return this.type === "event";
            },
        },
        peopleInside: {
            type: Number,
            default: 0
        },
        peopleOutside: {
            type: Number,
            default: 0
        },
        totalPeople: {
            type: Number,
            default: 0
        },
        homeTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: function () {
                return this.type === "sports";
            },
        },
        awayTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: function () {
                return this.type === "sports";
            },
        },
        date: {
            type: Date, // You can switch to Date if you'll sort/filter events by date
            required: true,
        },

        venue: {
            type: String,
            required: true,
        },
        redirectUrl: {
            type: String,
        },
        description: {
            type: String,
        },
        image: {
            type: String,
            required: false
        },
        ticketTypes: [
            {
                name: { type: String, required: true },
                price: { type: Number, required: true, default: 0 },
                max: { type: Number, default: 0 } // Optional max capacity per type
            }
        ],
        // --- Application / Registration Feature ---
        requiresApplication: {
            type: Boolean,
            default: false,
        },
        applicationFee: {
            type: Number,
            default: 0, // 0 = free to apply
        },
        formFields: [
            {
                label: { type: String, required: true },
                type: {
                    type: String,
                    enum: ["text", "radio", "checkbox"],
                    required: true,
                },
                options: [{ type: String }], // for radio & checkbox
                required: { type: Boolean, default: false },
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        // --- Audition Specific Features ---
        isAudition: {
            type: Boolean,
            default: false,
        },
        requestPicture: {
            type: Boolean,
            default: false,
        },
        allowNoTickets: {
            type: Boolean,
            default: false,
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

EventSchema.virtual("tickets", {
    ref: "Ticket",
    localField: "_id",
    foreignField: "event",
})

// Force delete model to prevent caching issues in dev
if (mongoose.models.Event) {
    delete mongoose.models.Event;
}

export default mongoose.model("Event", EventSchema);

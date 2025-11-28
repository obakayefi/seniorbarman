import mongoose from "mongoose";

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
            type: String,
            required: function () {
                return this.type === "sports";
            },
        },
        awayTeam: {
            type: String,
            required: function () {
                return this.type === "sports";
            },
        },
        date: {
            type: Date, // You can switch to Date if you'll sort/filter events by date
            required: true,
        },
        time: {
            type: String,
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
    },
    {timestamps: true}
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);

import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["info", "success", "warning", "error"],
            default: "info",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String, // Optional link to related page
        },
    },
    {
        timestamps: true,
    }
);

if (mongoose.models.Notification) {
    delete mongoose.models.Notification;
}

export default mongoose.model("Notification", NotificationSchema);

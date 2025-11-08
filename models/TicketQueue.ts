import mongoose, { Schema } from "mongoose"

const TicketQueueSchema = new Schema({
    event: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    totalTickets: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "processing", "computed", "failed"]
    },
    resultSummary: {
        type: Object
    }
}, { timestamps: true })

const TicketQueue = mongoose.models.TicketQueue || mongoose.model("TicketQueue", TicketQueueSchema)

export default TicketQueue
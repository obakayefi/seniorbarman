import { Schema, model, models } from "mongoose";
import { randomBytes } from "crypto";

const CheckInLogSchema = new Schema({
    time: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String
    },
    action: {
        type: String
    },
    method: {
        type: String // e.g "QR Scan" or "Manual Scan"
    },
    
})

const ticketSchema = new Schema({
    payment: {
        reference: String,
        authorizationUrl: String,
        status: {
            type: String,
            enum: ['pending', 'success', 'failed'],
            default: 'pending'
        }
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    checkInToken: {
        type: String,
        unique: true,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    ticketNumber: {
        type: String,
        unique: true,
        required: true
    },
    stand: {
        type: String,
        default: "Regular"
    },
    price: {
        type: Number,
        required: true,
    },
    qrCode: {
        type: String
    },
    issuedAt: {
        type: Date,
        default: Date.now()
    },
    checkInLogs: [CheckInLogSchema]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

ticketSchema.virtual("status").get(function () {
    if (!this.checkInLogs || this.checkInLogs.length === 0) return "Not Checked In"

    const lastLog = this.checkInLogs[this.checkInLogs.length - 1]
    const timeSince = (Date.now() - new Date(lastLog.time).getTime()) / (1000 * 6)

    if (timeSince < 240) return "Checked In";
    return "Checked Out"
})

const Ticket = models.Ticket || model('Ticket', ticketSchema)

export default Ticket
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
    performedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
})

const TicketTypeSchema = new Schema({
    name: {
        type: String,
        required: true,
        default: "Regular"
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    description: {
        type: String
    }
}, { _id: false });

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
    isInside: {
        type: Boolean,
        default: false,
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
    ticketType: {
        type: TicketTypeSchema,
        required: true,
        default: () => ({ name: "Regular", price: 0 })
    },
    issuedAt: {
        type: Date,
        default: Date.now()
    },
    holderName: {
        type: String,
        default: "Guest"
    },
    batchId: {
        type: String,
        index: true
    },
    isPrinted: {
        type: Boolean,
        default: false
    },
    generatedBy: {
        type: String,
        enum: ['wizard', 'online-sale', 'third-party', 'store-sale', 'gate-sale'],
        default: 'gate-sale'
    },
    checkInLogs: [CheckInLogSchema]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// Backwards-compatibility virtual getters & setters
ticketSchema.virtual("stand")
    .get(function () {
        return this.ticketType?.name || "Regular";
    })
    .set(function (val: string) {
        if (!this.ticketType) {
            this.ticketType = { name: val, price: 0 };
        } else {
            this.ticketType.name = val;
        }
    });

ticketSchema.virtual("price")
    .get(function () {
        return this.ticketType?.price ?? 0;
    })
    .set(function (val: number) {
        if (!this.ticketType) {
            this.ticketType = { name: "Regular", price: val };
        } else {
            this.ticketType.price = val;
        }
    });

ticketSchema.virtual("status").get(function () {
    if (!this.checkInLogs || this.checkInLogs.length === 0) return "Not Checked In"

    const lastLog = this.checkInLogs[this.checkInLogs.length - 1]
    const timeSince = (Date.now() - new Date(lastLog.time).getTime()) / (1000 * 6)

    if (timeSince < 240) return "Checked In";
    return "Checked Out"
})

const Ticket = models.Ticket || model('Ticket', ticketSchema)

export default Ticket
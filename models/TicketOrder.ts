import { Schema, model, models } from "mongoose";

const TicketOrderSchema = new Schema({
    tickets: {
        type: Object,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        required: true,
        default: 'pending'
    },
    reference: {
        type: String,
        require: true,
    },
    isGenerated: {
        type: Boolean,
        default: false,
        required: true
    }
}, { timestamps: true })

// Force delete model to prevent caching issues in dev
if (models.TicketOrder) {
    delete models.TicketOrder;
}

const TicketOrder = model('TicketOrder', TicketOrderSchema)
export default TicketOrder
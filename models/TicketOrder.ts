import { Schema, model, models } from "mongoose";

const TicketOrderSchema = new Schema({
    tickets: {
        type: Object,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        requred: true,
    },
    event: {
        type: Schema.Types.ObjectId,
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

const TicketOrder = models.TicketOrder || model('TicketOrder', TicketOrderSchema)
export default TicketOrder
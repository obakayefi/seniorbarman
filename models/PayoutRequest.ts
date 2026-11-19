import mongoose, { Schema, models } from 'mongoose';

const PayoutRequestSchema = new Schema({
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    grossRevenueAtRequest: { type: Number, required: true },
    commissionAtRequest: { type: Number, required: true },
    requestedAmount: { type: Number, required: true },
    payoutDetails: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['pending', 'paid', 'declined'], default: 'pending', index: true },
    adminNote: { type: String, default: '' },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
}, { timestamps: true });

PayoutRequestSchema.index({ event: 1, status: 1 });
PayoutRequestSchema.index({ event: 1, organizer: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

const PayoutRequest = models.PayoutRequest || mongoose.model('PayoutRequest', PayoutRequestSchema);
export default PayoutRequest;

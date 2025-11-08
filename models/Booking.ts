import mongoose from 'mongoose'

const BookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: String,
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
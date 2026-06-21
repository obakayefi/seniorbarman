import mongoose from "mongoose";

const FormAnswerSchema = new mongoose.Schema(
    {
        fieldLabel: { type: String, required: true },
        fieldType: { type: String, required: true },
        answer: { type: mongoose.Schema.Types.Mixed }, // String or [String] for checkbox
    },
    { _id: false }
);

const EventApplicationSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Overall application status
        status: {
            type: String,
            enum: [
                "pending_payment",  // Has not paid the application fee
                "pending_form",     // Has paid (or fee is free) but hasn't filled the form
                "completed",        // Form submitted
                "approved",         // Organizer approved
                "rejected",         // Organizer rejected
            ],
            default: "pending_payment",
        },
        // Payment tracking
        paymentStatus: {
            type: String,
            enum: ["unpaid", "paid", "free"],
            default: "unpaid",
        },
        paymentRef: { type: String },
        // Actual amount paid (in Naira) — recorded at time of payment verification
        amountPaid: { type: Number, default: 0 },

        // Form answers submitted by applicant
        formAnswers: [FormAnswerSchema],

        applicantPicture: { type: String },

        rejectionReason: { type: String },

        submittedAt: { type: Date },

        // Check-in tracking for auditions
        isInside: {
            type: Boolean,
            default: false,
        },
        checkInLogs: [
            {
                time: { type: Date, required: true },
                action: { type: String, enum: ["entry", "exit"], required: true },
                method: { type: String, default: "QR Code" },
                location: { type: String },
                performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            }
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// One application per user per event
EventApplicationSchema.index({ event: 1, user: 1 }, { unique: true });

if (mongoose.models.EventApplication) {
    delete mongoose.models.EventApplication;
}

export default mongoose.model("EventApplication", EventApplicationSchema);

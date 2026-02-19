import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
    adminId: mongoose.Types.ObjectId;
    action: string;
    targetType: string;
    targetId?: string;
    details: any;
    createdAt: Date;
}

const AuditLogSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    targetType: {
        type: String,
        required: true
    },
    targetId: {
        type: String
    },
    details: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

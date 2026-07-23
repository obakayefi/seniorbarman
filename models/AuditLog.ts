import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
    actorId: mongoose.Types.ObjectId;
    adminId?: mongoose.Types.ObjectId; // For backwards compatibility
    actorRole?: string;
    action: string;
    targetType: string;
    targetId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const AuditLogSchema = new Schema({
    actorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true,
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        immutable: true,
    },
    actorRole: {
        type: String,
        immutable: true,
        index: true,
    },
    action: {
        type: String,
        required: true,
        immutable: true,
        index: true,
    },
    targetType: {
        type: String,
        required: true,
        immutable: true,
        index: true,
    },
    targetId: {
        type: String,
        immutable: true,
    },
    details: {
        type: Schema.Types.Mixed,
        immutable: true,
    },
    ipAddress: {
        type: String,
        immutable: true,
    },
    userAgent: {
        type: String,
        immutable: true,
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// Compound indexes for fast querying and pagination
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ adminId: 1, createdAt: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ createdAt: -1 });

// Virtual to alias adminId to actorId for legacy queries
AuditLogSchema.pre("save", function (next) {
    if (this.actorId && !this.adminId) {
        this.adminId = this.actorId;
    } else if (this.adminId && !this.actorId) {
        this.actorId = this.adminId;
    }

    if (!this.isNew) {
        return next(new Error("Audit logs are read-only and immutable; modifications are prohibited."));
    }
    next();
});

// Middleware pre-hooks to block any mutation or deletion operations
const blockMutation = function (next: any) {
    next(new Error("Audit logs are read-only and immutable; modifications/deletions are prohibited."));
};

AuditLogSchema.pre("updateOne", blockMutation);
AuditLogSchema.pre("updateMany", blockMutation);
AuditLogSchema.pre("findOneAndUpdate", blockMutation);
AuditLogSchema.pre("deleteOne", blockMutation);
AuditLogSchema.pre("deleteMany", blockMutation);
AuditLogSchema.pre("findOneAndDelete", blockMutation);

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);


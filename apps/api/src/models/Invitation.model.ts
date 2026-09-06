import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '@sucmeet/shared';

export interface IInvitation extends Document {
  id: string;
  roomId: mongoose.Types.ObjectId;
  email: string;
  role: Role;
  token: string;
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    email: { type: String, required: true, lowercase: true },
    role: { type: String, enum: ['member', 'admin', 'owner'], default: 'member' },
    token: { type: String, required: true, unique: true, index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true },
  }
);

InvitationSchema.virtual('id').get(function () {
  return (this._id as mongoose.Types.ObjectId).toString();
});

export const Invitation = mongoose.model<IInvitation>('Invitation', InvitationSchema);

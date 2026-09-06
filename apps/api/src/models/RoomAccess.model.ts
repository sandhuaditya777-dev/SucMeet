import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '@sucmeet/shared';

export interface IRoomAccess extends Document {
  id: string;
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: Role;
  joinedAt: Date;
}

const RoomAccessSchema = new Schema<IRoomAccess>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
      type: String,
      enum: ['member', 'admin', 'owner'],
      default: 'member',
    },
    joinedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true },
  }
);

// Ensure one access entry per user per room
RoomAccessSchema.index({ roomId: 1, userId: 1 }, { unique: true });

RoomAccessSchema.virtual('id').get(function () {
  return (this._id as mongoose.Types.ObjectId).toString();
});

export const RoomAccess = mongoose.model<IRoomAccess>('RoomAccess', RoomAccessSchema);

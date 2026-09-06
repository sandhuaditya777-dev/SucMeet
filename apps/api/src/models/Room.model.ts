import mongoose, { Schema, Document } from 'mongoose';
import { RoomAccessLevel } from '@sucmeet/shared';

export interface IRoomConfig {
  everyoneCanMute: boolean;
  lobbyEnabled: boolean;
  maxParticipants?: number;
}

export interface IRoom extends Document {
  id: string;
  name: string;
  slug: string;
  accessLevel: RoomAccessLevel;
  config: IRoomConfig;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true, maxlength: 500, trim: true },
    slug: { type: String, required: true, unique: true, maxlength: 100, index: true },
    accessLevel: {
      type: String,
      enum: ['public', 'trusted', 'restricted'],
      default: 'public',
    },
    config: {
      everyoneCanMute: { type: Boolean, default: true },
      lobbyEnabled: { type: Boolean, default: false },
      maxParticipants: { type: Number },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true },
  }
);

RoomSchema.virtual('id').get(function () {
  return (this._id as mongoose.Types.ObjectId).toString();
});

export const Room = mongoose.model<IRoom>('Room', RoomSchema);

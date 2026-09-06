import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  auth0Id: string;
  email: string;
  displayName: string;
  avatar?: string;
  language: string;
  timezone: string;
  isBot: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    auth0Id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, index: true },
    displayName: { type: String, required: true, maxlength: 100 },
    avatar: { type: String },
    language: { type: String, default: 'en', maxlength: 10 },
    timezone: { type: String, default: 'UTC' },
    isBot: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true },
  }
);

UserSchema.virtual('id').get(function () {
  return (this._id as mongoose.Types.ObjectId).toString();
});

export const User = mongoose.model<IUser>('User', UserSchema);

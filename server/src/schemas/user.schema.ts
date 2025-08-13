import { Schema, model } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import LocationSchema from './location.schema';

export const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['employer', 'worker'],
    default: 'worker',
  },
  rating: {
    type: Number,
  },
  location: {
    type: LocationSchema,
  },
});

UserSchema.plugin(passportLocalMongoose, { usernameQueryFields: ['email'] });
export const User = model('User', UserSchema);

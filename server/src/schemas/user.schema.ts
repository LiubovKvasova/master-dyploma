import { Schema, type InferSchemaType } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import AddressSchema from './address.schema';
import LocationSchema from './location.schema';

const UserSchema = new Schema({
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
  phone: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['employer', 'worker'],
    default: 'worker',
  },
  rating: {
    type: Number,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  location: {
    type: LocationSchema,
  },
  coordinates: {
    type: [Number],
  },
  address: {
    type: AddressSchema,
  },
});

UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'username',
  usernameQueryFields: ['email'],
});

UserSchema.set('toObject', {
  virtuals: true,
  transform: (_doc, ret) => {
    const coordinates = ret.location?.coordinates?.slice();

    if (coordinates) {
      ret.coordinates = coordinates;
      delete ret.location;
    }
  },
});

type UserDocument = InferSchemaType<typeof UserSchema>;

// Export UserSchema only after applying a plugin
export { UserSchema, UserDocument };

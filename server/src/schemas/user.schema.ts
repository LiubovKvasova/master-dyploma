import { Schema } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
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

UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'username',
  usernameQueryFields: ['email'],
});

// Export UserSchema only after applying a plugin
export { UserSchema };

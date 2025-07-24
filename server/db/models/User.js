import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import LocationSchema from './LocationSchema.js';

const UserSchema = new mongoose.Schema({
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
    }
});

UserSchema.plugin(passportLocalMongoose, { usernameQueryFields: ['email'] });
export default mongoose.model('User', UserSchema);

import { Document } from 'mongoose';

export interface UserDocument extends Document {
  username: string;
  email: string;
  role: 'employer' | 'worker';
  rating: number;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

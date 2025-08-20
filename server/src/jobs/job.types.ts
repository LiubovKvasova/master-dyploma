import { Document } from 'mongoose';

export interface JobDocument extends Document {
  title: string;
  description?: string;
  category: string;
  address: object;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  duration: {
    representation: string;
    value: number;
  };
  hourRate: number;
}

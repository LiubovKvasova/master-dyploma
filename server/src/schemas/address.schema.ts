import { Schema } from 'mongoose';

const AddressSchema = new Schema({
  amenity: {
    type: String,
  },
  building: {
    type: String,
  },
  house_number: {
    type: String,
  },
  road: {
    type: String,
  },
  neighbourhood: {
    type: String,
  },
  suburb: {
    type: String,
  },
  borough: {
    type: String,
    index: true,
  },
  city: {
    type: String,
    index: true,
  },
  municipality: {
    type: String,
  },
  district: {
    type: String,
    index: true,
  },
  state: {
    type: String,
    index: true,
  },
  postcode: {
    type: String,
  },
});

export default AddressSchema;

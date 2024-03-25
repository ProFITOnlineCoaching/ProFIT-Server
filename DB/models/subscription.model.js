import mongoose from 'mongoose';
const { Schema } = mongoose;

export const packageSchema = new Schema({
  packageName: {
    type: String,
  },
  packageType: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  duration: {
    type: Number, // assuming duration is in months
  },
  subscribersLimit: {
    type: Number,
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

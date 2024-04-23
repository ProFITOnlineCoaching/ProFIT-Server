import { Schema, model } from "mongoose";

const sleepSchema = new Schema({
  trainee: {
    type: Schema.ObjectId,
    ref: 'Trainee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  sleepStart: {
    type: Date,
    required: true
  },
  sleepEnd: {
    type: Date,
    required: true
  },
  duration: {
    hours: {
      type: Number,
      required: true
    },
    minutes: {
      type: Number,
      required: true
    },
    totalMinutes: { // Optional, only if you want to store the total minutes as well
      type: Number,
      required: true
    }
  }
});

export const sleepModel = model('Sleep', sleepSchema);

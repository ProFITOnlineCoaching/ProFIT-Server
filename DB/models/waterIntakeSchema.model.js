import { Schema, model } from "mongoose";

const waterIntakeSchema = new Schema({
  trainee: {
    type: Schema.ObjectId,
    ref: "Trainee",
    required: true,
  },
  dailyGoal: {
    type: Number,
    default: 3500,
  },
  currentIntake: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
export const waterIntakeModel = model("waterIntakeSchema", waterIntakeSchema);

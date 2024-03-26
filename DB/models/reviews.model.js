import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    trainer: {
      type: Schema.ObjectId,
      ref: "Trainer",
      required: true,
    },
    trainee: {
      type: Schema.ObjectId,
      ref: "Trainee",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

export const reviewModel = model("Review", reviewSchema);

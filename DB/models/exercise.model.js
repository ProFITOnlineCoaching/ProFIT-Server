import mongoose from "mongoose";
const { Schema } = mongoose;

const exerciseSchema = new Schema(
  {
    ExerciseName: {
      type: String,
      required: [true, "Exercise Name is required"],
    },
    ExerciseImage: {
      type: String,
      required: [true, "Exercise Image is required"],
    },
    images: {
      type: String,
      required: [false, " Image is required"],
    },
    ExerciseType: {
      type: String,
      required: true,
      enum: [
        "Strength",
        "Cardio",
        "Flexibility",
        "Plyometrics",
        "Balance",
        "Endurance",
      ],
    },
    ExerciseCategory: {
      type: String,
      required: true,
      enum: [
        "Legs",
        "Arms",
        "Back",
        "Chest",
        "Shoulders",
        "Core",
        "Cardio",
        "Full Body",
      ],
    },
    Intensity: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"],
    },
    Instruction: {
      type: String,
      required: false,
    },
    VideoLink: {
      type: String,
      required: false,
    },
    DifficultyLevel: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    TargetMuscle: {
      type: String,
      required: false,
    },
    Equipments: {
      type: [String],
      required: false,
    },
    ExerciseInjuries: {
      type: [String],
      // enum: ["None", "Knee", "Back", "Shoulder", "Elbow", "Wrist", "Neck"],
    },
    Location: {
      type: [String],
      enum: ["Gym", "Home"],
    },
    addedBy: {
      type: Schema.ObjectId,
      ref: "Trainer",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ExerciseModel = mongoose.model("Exercise", exerciseSchema);
import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs"

const traineeSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Full Name is required."],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "trainee", // Make sure this is set correctly when creating a trainee
    },
    //--------------------------------------------------------------------------------------------------------------------------
    traineeBasicInfo: {
      type: Schema.ObjectId,
      ref: "traineeBasicInfo",
    },
    
    //-------------------------------------------------------------------------------------------------------------------------

    assignedTrainer: {
      type: Schema.ObjectId,
      ref: "Trainer",
      default: null,
    },

    //-------------------------------------------------------------------------------------------------------------------------
    phoneNumber: {
      type: String,
      trim: true,
    },
    religion: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      trim: true,
    },
    isBlock: {
      type: Boolean,
      default: false,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    OTP: {
      type: String,
      default: null,
    },
    OTPExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

traineeSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
  } catch (error) {
      next(error);
  }
});
export const traineeModel = model("Trainee", traineeSchema);

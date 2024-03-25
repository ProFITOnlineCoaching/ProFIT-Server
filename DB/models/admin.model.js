import { Schema, model } from "mongoose";
// import { userModel } from "./User.model.js";
import bcrypt from "bcryptjs"

const adminSchema = new Schema(
  {
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
        default: "admin", // Make sure this is set correctly when creating a trainer
      },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre('save', async function (next) {
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

export const adminModel = model("Admin", adminSchema);

import { Schema, model } from "mongoose";
import { packageSchema } from './subscription.model.js';
import bcrypt from "bcryptjs"

const trainerSchema = new Schema(
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
    role: {
      type: String,
      default: "trainer", 
    },
    //------------------------------------------------------------------------------------
    profilePhoto: {
      type: String,
      default: "",
    },
    nationalId: {
      pdf: {
        type: String,
        default: "",
      },
      images: 
        {
          type: [String],
          default: "",
        },
      
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    birthDate: {
      type: Date,
    },
    biography: {
      type: String,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male","Female"],
      default: "Male",
    },
//----------------------------------------------------------------------------------------------
    specializations: 
      {
        type: [String],
      },
    yearsOfExperience: {
      type: Number,
      min: [0, "Years of experience cannot be negative."],
    },
    qualificationsAndAcheivments: {
      type: [String],
    },
    clientTransformations: [
      {
        title: {
          type: String,
        },
        description: {
          type: String,
        },
        beforeImage: {
          type: String,
        },
        afterImage: {
          type: String,
        },
      },
    ],

    socialMedia: {
      facebook: { type: String, default: "" },
      X: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
//----------------------------------------------------------------------------
    packages:{
      type:[packageSchema],
      validate: [arrayLimit, `{PATH} exceeds the limit of 3`]
    },
    traniee: [
      {
        type: Schema.ObjectId,
        ref: "Trainee",
      },
    ],
//--------------------------------------------------------------------------
    status: {
      type: String,
      enum: ["pending", "accepted", "refused"],
      default: "pending",
    },
    isBlock: {
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
function arrayLimit(val) {
  return val.length <= 3;
}

trainerSchema.pre('save', async function (next) {
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

const BASE_FILE_URL = "http://localhost:4000/";

trainerSchema.post("init", function (doc) {
  if (doc.profilePhoto) {
    doc.profilePhoto =
      BASE_FILE_URL +
      "uploads/Trainers/" +
      doc.profilePhoto.split("\\").slice(-3).join("/");
  }

  if (doc.nationalId.pdf) {
    doc.nationalId.pdf =
      BASE_FILE_URL +
      "uploads/Trainers/" +
      doc.nationalId.pdf.split("\\").slice(-3).join("/");
  }

  if (doc.nationalId.images && doc.nationalId.images.length > 0) {
    doc.nationalId.images = doc.nationalId.images.map(
      (image) =>
        BASE_FILE_URL +
        "uploads/Trainers/" +
        image.split("\\").slice(-3).join("/")
    );
  }

  if (
    doc.qualificationsAndAcheivments &&
    doc.qualificationsAndAcheivments.length > 0
  ) {
    doc.qualificationsAndAcheivments = doc.qualificationsAndAcheivments.map(
      (cert) =>
        BASE_FILE_URL +
        "uploads/Trainers/" +
        cert.split("\\").slice(-3).join("/")
    );
  }
  if (doc.clientTransformations && doc.clientTransformations.length > 0) {
    doc.clientTransformations.forEach(transformation => {
      if (transformation.beforeImage) {
        transformation.beforeImage = BASE_FILE_URL + "uploads/Trainers/" + transformation.beforeImage.split("\\").slice(-3).join("/");
      }
      if (transformation.afterImage) {
        transformation.afterImage = BASE_FILE_URL + "uploads/Trainers/" + transformation.afterImage.split("\\").slice(-3).join("/");
      }
    });
  }


});
export const trainerModel = model("Trainer", trainerSchema);

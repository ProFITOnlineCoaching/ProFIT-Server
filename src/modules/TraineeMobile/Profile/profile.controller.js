import { AppError } from "../../../utils/AppError.js";
import { generateRandomOTP } from "../../../utils/OTPGenerator.js";
import { catchAsyncError } from "../../../utils/catchAsyncError.js";
import { traineeModel } from "../../../../DB/models/trainee.model.js";
import { traineeBasicInfoModel } from "./../../../../DB/models/traineeBasicInfo.model.js";
import { calculateAge } from "../../../middlewares/factors.js";
import moment from "moment";
import bcrypt from "bcryptjs";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dbpvx37nc",
  api_key: "379943924215678",
  api_secret: "8HPjq5e6rCAY_NPLRGlNpwee-9Q",
});

const profileSettings = catchAsyncError(async (req, res, next) => {
  const traineeId = req.user.id;
  console.log(traineeId);
  const data = await traineeModel.findById(
    traineeId,
    "firstName lastName email profilePhoto"
  );
  if (!data) {
    return next(new AppError("User was not found!", 404));
  }
  res
    .status(200)
    .json({ success: true, message: "Data fetched succesfully", data });
});

const getAccountData = catchAsyncError(async (req, res, next) => {
  const traineeId = req.user.id;
  const data = await traineeModel.findById(
    traineeId,
    "firstName lastName email profilePhoto phoneNumber"
  );

  if (!data) {
    return next(new AppError("User was not found!", 404));
  }

  res
    .status(200)
    .json({ success: true, message: "Data fetched successfully", data });
});

const updateAccountData = catchAsyncError(async (req, res, next) => {
  const traineeId = req.user.id;
  let trainee = await traineeModel.findById(traineeId);

  if (!trainee) {
    return next(new AppError("User not found!", 404));
  }

  // Update other fields as necessary...
  trainee.firstName = req.body.firstName || trainee.firstName;
  trainee.lastName = req.body.lastName || trainee.lastName;
  trainee.email = req.body.email || trainee.email;
  trainee.phoneNumber = req.body.phoneNumber || trainee.phoneNumber;

  if (req.files["profilePhoto"] && req.files["profilePhoto"].length > 0) {
    const file = req.files["profilePhoto"][0];

    // If an old photo exists, delete it from Cloudinary
    if (trainee.profilePhotoId) {
      await cloudinary.uploader.destroy(trainee.profilePhotoId);
    }

    // Upload the new photo to Cloudinary
    if (file && file.buffer) {
      const folderName = `Trainee/${trainee.firstName}_${trainee.lastName}/profilePhoto`;
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          folder: folderName,
        }
      );

      // Update the trainee document with the new photo's URL and public ID
      trainee.profilePhoto = result.secure_url;
      trainee.profilePhotoId = result.public_id;
    }
  }

  await trainee.save();
  res.status(200).json({
    success: true,
    message: "Account data updated successfully",
    data: trainee,
  });
});

const getPersonalData = catchAsyncError(async (req, res, next) => {
  const traineeId = req.user.id;
  // Use .lean() to get a plain JavaScript object
  const personalData = await traineeBasicInfoModel
    .findOne({ trainee: traineeId })
    .lean();

  if (!personalData) {
    return next(new AppError("Personal data not found!", 404));
  }

  // Now you can safely modify it because it's a plain object
  personalData.birthDate = moment(personalData.birthDate).format("YYYY-MM-DD");

  res.status(200).json({
    success: true,
    message: "Personal data fetched successfully",
    data: personalData,
  });
});

const updatePersonalData = catchAsyncError(async (req, res, next) => {
  const traineeId = req.user.id;
  const updateData = req.body; // Data to update

  // Perform the update operation
  const updatedPersonalData = await traineeBasicInfoModel.findOneAndUpdate(
    { trainee: traineeId },
    updateData,
    { new: true, runValidators: true, lean: true }
  );

  if (!updatedPersonalData) {
    return next(new AppError("Personal data not found!", 404));
  }

  // Format the date in YYYY-MM-DD format
  if (updatedPersonalData.birthDate instanceof Date) {
    updatedPersonalData.birthDate = updatedPersonalData.birthDate
      .toISOString()
      .split("T")[0];
  }

  res.status(200).json({
    success: true,
    message: "Personal data updated successfully",
    data: updatedPersonalData,
  });
});

const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  // Check if newPassword and confirmPassword match
  if (newPassword !== confirmPassword) {
    return next(
      new AppError("New password and confirmation password do not match.", 400)
    );
  }

  const userId = req.user.id;

  // Check if old and new passwords are provided
  if (!oldPassword || !newPassword) {
    return next(new AppError("Please provide old and new passwords!", 400));
  }

  // Find the trainee by userId instead of email
  const trainee = await traineeModel.findById(userId).select("+password");

  if (!trainee) {
    return next(new AppError("Trainee not found", 404));
  }

  // Check if the old password is correct
  const isMatch = await bcrypt.compare(oldPassword, trainee.password);
  if (!isMatch) {
    return next(new AppError("Your old password is incorrect", 401));
  }

  // Hash the new password before saving
  const salt = await bcrypt.genSalt(10);
  trainee.password = await bcrypt.hash(newPassword, salt);

  // Save the trainee with the new password
  await trainee.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully!",
  });
});

const deleteAccount = catchAsyncError(async (req, res, next) => {
  const userId = req.user.id;

  const trainee = await traineeModel.findById(userId);

  if (!trainee) {
    return next(new AppError("Trainee not found", 404));
  }

  // Delete the trainee's account
  await traineeModel.deleteOne({ _id: userId });

  // Respond to the request indicating the account has been deleted
  res.status(200).json({
    success: true,
    message: "Account deleted successfully.",
  });
});

export {
  profileSettings,
  getAccountData,
  updateAccountData,
  getPersonalData,
  updatePersonalData,
  changePassword,
  deleteAccount,
};

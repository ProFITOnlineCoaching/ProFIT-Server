import { sendEmail } from "../../../../email/nodemailer.js";
import { generateToken } from "../../../middlewares/authToken.js";
import { AppError } from "../../../utils/AppError.js";
import { generateRandomOTP } from "../../../utils/OTPGenerator.js";
import { catchAsyncError } from "../../../utils/catchAsyncError.js";
import { traineeModel } from "../../../../DB/models/trainee.model.js";
import bcrypt from "bcryptjs";
import { traineeBasicInfoModel } from './../../../../DB/models/traineeBasicInfo.model.js';

const tranieeSignUp = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  //  console.log(req.body);

  // Check if the email already exists in the database
  const existingUser = await traineeModel.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already exists.", 409));
  }

  const OTP = generateRandomOTP();
  console.log(existingUser);

  // Create a new Trainee instance
  const newTrainee = new traineeModel({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    profilePhoto:"https://asset.cloudinary.com/dbpvx37nc/fa534bec3c11074c407903bcaabffad5",
    OTP,
    OTPExpires: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
  });

  await newTrainee.save();

  const sentEmail = await sendEmail(
    {
      email: newTrainee.email,
      firstName: newTrainee.firstName,
      lastName: newTrainee.lastName,
      OTP,
    },
    req.protocol,
    req.headers.host,
    "confirmEmail"
  );
  console.log(sentEmail);
  if (!sentEmail) {
    return next(new AppError("Email could not be sent", 500));
  }
  res.status(201).json({ success: true, message:"User registered succesfully!", data: newTrainee });
});

const verifyTraineeOTP = catchAsyncError(async (req, res, next) => {
  const { email, OTP } = req.body;

  // Find the trainee with the given email
  const trainee = await traineeModel.findOne({ email });

  if (trainee.isConfirmed) {
    return res.status(200).json({
      success: false,
      message: "Trainee is already confirmed.",
    });
  }

  // If no trainee is found or OTP is already undefined
  if (!trainee || !trainee.OTP) {
    return next(new AppError("OTP is invalid or has expired", 400));
  }

  // Check if OTP has expired
  if (trainee.OTPExpires < Date.now()) {
    // Explicitly set OTP to undefined due to expiration
    trainee.OTP = undefined;
    trainee.OTPExpires = undefined;
    await trainee.save(); // Save the changes to mark OTP as expired/used

    return next(
      new AppError("OTP has expired. Please request a new one.", 400)
    );
  }

  // Proceed with OTP verification if it has not expired
  if (trainee.OTP !== OTP) {
    return next(new AppError("Incorrect OTP", 400));
  }

  // OTP is correct and not expired, proceed to set OTP fields to undefined and confirm email
  trainee.OTP = undefined;
  trainee.OTPExpires = undefined;
  trainee.isConfirmed = true;
  await trainee.save();

  // Generate a token for the trainee
  const token = generateToken(
    {
      id: trainee._id,
      email: trainee.email,
      name: trainee.firstName,
      role: trainee.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.status(200).json({
    success: true,
    message: "Email verified successfully!",
    token,
  });
});

const resendOTP = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  // Find the trainee by email
  const trainee = await traineeModel.findOne({ email });
  if (!trainee) {
    return next(new AppError("No account found with this email.", 404));
  }

  // Check if trainee is already confirmed
  if (trainee.isConfirmed) {
    return res.status(400).json({
      success: false,
      message: "Trainee is already confirmed. No need to resend OTP.",
    });
  }

  // Generate a new OTP and update its expiration time
  const newOTP = generateRandomOTP();
  trainee.OTP = newOTP;
  trainee.OTPExpires = new Date(Date.now() + 10 * 60 * 1000); // Set to expire in 10 minutes

  // Save the updated trainee
  await trainee.save();

  // Resend the email with the new OTP
  const sentEmail = await sendEmail(
    {
      email: trainee.email,
      firstName: trainee.firstName,
      lastName: trainee.lastName,
      OTP: newOTP,
    },
    req.protocol,
    req.headers.host,
    "confirmEmail"
  );

  if (!sentEmail) {
    return next(new AppError("Email could not be sent.", 500));
  }

  // Respond to the request indicating the OTP was resent
  res.status(200).json({
    success: true,
    message: "OTP has been resent successfully.",
  });
});

const basicInformation = catchAsyncError(async (req, res, next) => {
  const { gender, birthDate, weight, height, fitnessGoals, activityLevel } =
    req.body;

  const tranieeId = req.user.id;

  // console.log(tranieeId);

  const tranieeBasicInfo = new traineeBasicInfoModel({
    trainee: tranieeId,
    gender,
    birthDate,
    weight,
    height,
    fitnessGoals,
    activityLevel,
  });

  await tranieeBasicInfo.save();

  await traineeModel.findByIdAndUpdate(tranieeId, {
    traineeBasicInfo: tranieeBasicInfo._id,
  });
  
  //Fetch the traniee data after saving basic information
  const tranieeData = await traineeModel.findById(tranieeId).populate('traineeBasicInfo')

     // Log the saved trainee data for debugging (optional)
     console.log('Saved trainee data:', tranieeData);

  res.status(200).json({ success: true, message: "Basic information saved successfully.", data:tranieeData });
});

const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  // Check if the email exists in the database

  const user = await traineeModel.findOne({ email });
  if (!user) {
    return next(new AppError("Email is not exists.", 404));
  }

  // Generate a random OTP
  const OTP = generateRandomOTP(); // Implement this function to generate OTP

  const OTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Store the OTP and its expiration date in the user's document
  user.OTP = OTP;
  user.OTPExpires = OTPExpires;
  await user.save();

  // Send an email with the OTP
  const sentEmail = await sendEmail(
    {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      OTP, // OTP serves as the token for resetting the password
    },
    req.protocol,
    req.headers.host,
    "resetPassword"
  );

  if (sentEmail) {
    return res
      .status(200)
      .json({ success: true, message: "Email sent with OTP." });
  } else {
    return next(new AppError("Email could not be sent.", 500));
  }
});

const resetPassword = catchAsyncError(async (req, res, next) => {
  const { OTP, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return next(new AppError("Password and confirm password do not match."));
  }

  // Find the user by OTP
  const user = await traineeModel.findOne({ OTP });

  if (!user) {
    return next(new AppError("OTP is incorrect", 400));
  }

  // Check if the OTP has expired
  if (user.OTPExpires < Date.now()) {
    return next(new AppError("OTP has expired", 400));
  }
  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the number of salt rounds

  user.password = hashedPassword; // Store the hashed password
  await user.save();

  res
    .status(200)
    .json({ sucess: true, message: "Password reset successfully" });
});

const traineeSignIn = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // Try to find the trainee by email
  const trainee = await traineeModel.findOne({ email });

  if (!trainee) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // Check if the password is correct
  const isMatch = await bcrypt.compare(password, trainee.password);

  if (!isMatch) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // Check if the trainee's email is confirmed
  if (!trainee.isConfirmed) {
    return next(new AppError("Please confirm your email to login", 403));
  }

  // Generate a token for the trainee
  const token = generateToken(
    {
      id: trainee._id,
      email: trainee.email,
      name: trainee.firstName,
      role: trainee.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  // Send the token to the trainee
  res.status(200).json({
    success: true,
    message: "Logged in successfully!",
    token,
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

  const userId = req.user.id; // Extracting user ID from the JWT payload

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
  const userId = req.user.id; // Assuming the user's ID is stored in req.user.payload._id after authentication

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
  tranieeSignUp,
  verifyTraineeOTP,
  resendOTP,
  basicInformation,
  forgetPassword,
  resetPassword,
  traineeSignIn,
  changePassword,
  deleteAccount,
};

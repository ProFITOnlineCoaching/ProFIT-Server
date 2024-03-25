import { adminModel } from "../../../../DB/models/admin.model.js";
import { trainerModel } from "../../../../DB/models/trainer.model.js";
import bcrypt from "bcryptjs";
import { catchAsyncError } from "../../../utils/catchAsyncError.js";
import { generateToken } from "../../../middlewares/authToken.js";

//Sign up for Admin - For development mode
const signUpAdmin = catchAsyncError(async (req, res, next) => {
  const { email, password, profilePhoto } = req.body; 

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  // Check if the email already exists
  const existingUser = await adminModel.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email is already in use.", 400));
  }

  // Create a new admin user
  const newAdmin = new adminModel({
    email,
    password,
    profilePhoto, // Optional, depending on your schema
  });

  // Save the new admin to the database
  await newAdmin.save();

  res.status(201).json({
    success: true,
    message: "Admin created successfully",
    data: newAdmin,
  });
});

const signIn = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required (Email and Password)",
    });
  }

  let user = await trainerModel.findOne({ email });
  let role = "trainer";

  if (!user) {
    user = await adminModel.findOne({ email });
    role = "admin";
  }

  if (!user) {
    return next(new AppError("Email does not exist.", 404));
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError("Invalid credentials.", 401));
  }

  // Prepare base payload
  let payload = {
    id: user._id,
    email: user.email,
    role: role,
  };

  // Extend payload based on role
  if (role === "trainer") {
    payload = { ...payload, name:`${user.firstName} ${user.lastName}` };
  } else if (role === "admin") {
    payload = { ...payload, };
  }

  // User is authenticated, generate token
  const token = generateToken(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.status(200).json({
    success:true,
    message: "Logged in successfully",
    data: user,
    token: token,
  });
});

export { signUpAdmin, signIn };

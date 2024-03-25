import { generateToken } from "../../../middlewares/authToken.js";
import { AppError } from "../../../utils/AppError.js";
import { catchAsyncError } from "../../../utils/catchAsyncError.js";
import { trainerModel } from "../../../../DB/models/trainer.model.js";

const signUpAndCompleteProfile = catchAsyncError(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    country,
    state,
    city,
    phoneNumber,
    birthDate,
    biography,
    gender,
    specializations,
    yearsOfExperience,
    socialMedia,
  } = req.body;

  // console.log(req.body);
  // console.log(req.files);

  // Check if the user already exists
  const userExists = await trainerModel.findOne({ email });
  if (userExists) {
    return next(new AppError("Email already exists.", 409));
  }

  // Initialize an empty array for packages
  let packages = [];

  // If packages were provided, handle them
  if (req.body.packages && req.body.packages.length) {
    packages = req.body.packages.map((pkg) => ({
      ...pkg,
      price: Number(pkg.price),
      duration: Number(pkg.duration),
      subscribersLimit: Number(pkg.subscribersLimit),
      isActive: pkg.isActive === "true", // Convert 'true'/'false' string to boolean
    }));

    // Additional validation can go here
    if (packages.length > 20) {
      return next(new AppError("Cannot add more than 20 packages", 400));
    }

    const activePackages = packages.filter((pkg) => pkg.isActive);
    if (activePackages.length > 3) {
      return next(new AppError("Cannot have more than 3 active packages", 400));
    }
  }

  const newTrainer = new trainerModel({
    firstName,
    lastName,
    email,
    password,
    country,
    state,
    city,
    phoneNumber,
    birthDate,
    biography,
    gender,
    specializations,
    yearsOfExperience,
    socialMedia,
    packages,
  });

  // Handling nationalId uploads
  if (req.files["nationalId"]) {
    // Check if any of the files is a PDF (assuming only one PDF can be uploaded)
    const nationalIdPdf = req.files["nationalId"].find(
      (file) => file.mimetype === "application/pdf"
    );

    if (nationalIdPdf) {
      // Assuming we only allow one PDF or multiple images but not both
      newTrainer.nationalId.pdf = nationalIdPdf.path;
    } else {
      // Handle multiple images
      const nationalIdImages = req.files["nationalId"].map((file) => file.path);
      newTrainer.nationalId.images = nationalIdImages;
    }
  }

  if (
    req.files.clientTransformationBefore &&
    req.files.clientTransformationAfter
  ) {
    let transformations = req.body.clientTransformations;

    transformations = transformations.map((transformation, index) => ({
      title: transformation.title,
      description: transformation.description,
      beforeImage: req.files.clientTransformationBefore[index]
        ? req.files.clientTransformationBefore[index].path
        : "",
      afterImage: req.files.clientTransformationAfter[index]
        ? req.files.clientTransformationAfter[index].path
        : "",
    }));

    // console.log(transformations);

    newTrainer.clientTransformations = transformations;
  }

  if (req.files["profilePhoto"]) {
    newTrainer.profilePhoto = req.files["profilePhoto"][0].path;
  }

  console.log();
  if (req.files.qualificationsAndAcheivments) {
    newTrainer.qualificationsAndAcheivments =
      req.files.qualificationsAndAcheivments.map((file) => file.path);
  }

  await newTrainer.save();

  // Generate a token for the new trainer

  const token = generateToken(
    {
      id: newTrainer._id,
      email: newTrainer.email,
      name: newTrainer.firstName,
      role: newTrainer.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.status(201).json({
    success: true,
    message: "Trainer successfully registered and profile completed",
    token,
  });
});

export { signUpAndCompleteProfile };

import { AppError } from "../../../utils/AppError.js";
import { generateRandomOTP } from "../../../utils/OTPGenerator.js";
import { catchAsyncError } from "../../../utils/catchAsyncError.js";
import { traineeModel } from "../../../../DB/models/trainee.model.js";
import { traineeBasicInfoModel } from "./../../../../DB/models/traineeBasicInfo.model.js";
import { trainerModel } from "../../../../DB/models/trainer.model.js";

const getAllTrainers = catchAsyncError(async (req, res, next) => {
  // Define sort criteria based on query parameter
  const sortCriteria = {
    price_asc: { "packages.price": 1 },
    price_desc: { "packages.price": -1 },
  };

  const sort = sortCriteria[req.query.sort] || {};

  // Fetch trainers with only specified fields including the nested packages price field
  let trainers = await trainerModel
    .find(
      {},
      "firstName lastName profilePhoto specializations yearsOfExperience packages.price"
    )
    .sort(sort) // Apply sorting if criteria are given, otherwise no sorting
    .catch((err) => {
      return next(new AppError("Failed to fetch trainers", 500));
    });

  if (!trainers.length) {
    return next(new AppError("No trainers found", 404));
  }

  // Process each trainer to find the lowest package price
  trainers = trainers.map((trainer) => {
    const lowestPrice = trainer.packages.reduce(
      (min, p) => (p.price < min ? p.price : min),
      Infinity
    );
    return {
      ...trainer.toObject(),
      lowestPrice: lowestPrice === Infinity ? null : lowestPrice, // Handle case where no packages are present
    };
  });

  res.status(200).json({
    success: true,
    message: "Trainers fetched and sorted successfully",
    results: trainers.length,
    data: trainers,
  });
});

const getTrainerDetails = catchAsyncError(async (req, res, next) => {
  const trainerId = req.params.trainerId;
  const trainer = await trainerModel.findById(trainerId).catch((err) => {
    return next(
      new AppError(`Failed to fetch trainer with ID ${trainerId}`, 500)
    );
  });

  if (!trainer) {
    return next(new AppError(`No trainer found with ID ${trainerId}`, 404));
  }

  res.status(200).json({
    success: true,
    message: "Trainer fetched successfully",
    data: trainer,
  });
});
export { getAllTrainers, getTrainerDetails };

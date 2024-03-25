import { traineeModel } from "../../../DB/models/trainee.model.js";
import { trainerModel } from "../../../DB/models/trainer.model.js";
import { sendEmail } from "../../../email/nodemailer.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsyncError } from "../../utils/catchAsyncError.js";

//Get All Trainers Requests
const getAllTrainersRequests = catchAsyncError(async (req, res, next) => {
  const trainers = await trainerModel.find({ status: "pending" });

  return res.status(200).json({ success: true, data: trainers });
});

//Get Trainer Details
const getTrainerDetails = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  const data = await trainerModel.findById(id);
  if (data) {
    res.status(200).json({ success: true, data });
  } else {
    return next(new AppError("Trainee was not found or you're not authorized to do that")
    );
  }
});

//Admin Acceptance
const adminAcceptTrainer = catchAsyncError(async (req, res, next) => {
  const { id } = req.params; // Assuming the route parameter is named trainerId

  const trainer = await trainerModel.findByIdAndUpdate(
    id,
    { status: "accepted" },
    { new: true }
  );

  if (!trainer) {
    return next(new AppError("Trainer not found.", 404));
  }

  // Send the congratulatory email
  const sentEmail = await sendEmail(
    {
      email: trainer.email,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
    },
    req.protocol,
    req.headers.host,
    "acceptanceEmail" // new messageType
  );

  if (!sentEmail) {
    return next(new AppError("Email could not be sent", 500));
  }

  res.status(200).json({
    success: true,
    message: "Trainer has been accepted successfully.",
    data: trainer,
  });
});

// Admin Delcine
const adminDeclineTrainer = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const trainer = await trainerModel.findByIdAndUpdate(
    id,
    { status: "refused" },
    { new: true }
  );

  if (!trainer) {
    return next(new AppError("Trainer not found.", 404));
  }

  // Optionally send a notification email about the declination
  // Send the congratulatory email
  const sentEmail = await sendEmail(
    {
      email: trainer.email,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
    },
    req.protocol,
    req.headers.host,
    "refusedEmail" // new messageType
  );

  if (!sentEmail) {
    return next(new AppError("Email could not be sent", 500));
  }
  res.status(200).json({
    message: "Trainer has been declined successfully.",
    trainer
  });
});

//Get All Trainees
const getAllTrainees = catchAsyncError(async (req, res, next) => {
  const data = await traineeModel.find({});
  if (data) {
    return res.status(200).json({ success: true, data });
  }
});

// Get All Accepted Trainees
const getAllAcceptedTrainees = catchAsyncError(async (req, res, next) => {
  const data = await traineeModel.find({ status: 'accepted' });
  if (data.length > 0) {
    return res.status(200).json({ success: true, data });
  } else {
    return res.status(404).json({ success: false, message: 'No accepted trainees found.' });
  }
});

// Get All Blocked Trainees
const getAllBlockedTrainees = catchAsyncError(async (req, res, next) => {
  const blockedTrainees = await traineeModel.find({ isBlock: true });
  if (blockedTrainees) {
    return res.status(200).json({ success: true, data: blockedTrainees });
  } else {
    return next(new AppError('No blocked trainees found', 404));
  }
});

//Get All Trainers
const getAllTrainers = catchAsyncError(async (req, res, next) => {
  const data = await trainerModel.find({});
  if (data) {
    return res.status(200).json({ success: true, data });
  }
});

// Get All Accepted Trainers
const getAllAcceptedTrainers = catchAsyncError(async (req, res, next) => {
  const data = await trainerModel.find({ status: 'accepted' });
  if (data.length > 0) {
    return res.status(200).json({ success: true, data });
  } else {
    return res.status(404).json({ success: false, message: 'No accepted trainers found.' });
  }
});

// Get All Blocked Trainers
const getAllBlockedTrainers = catchAsyncError(async (req, res, next) => {
  const blockedTrainers = await trainerModel.find({ isBlock: true });
  if (blockedTrainers) {
    return res.status(200).json({ success: true, data: blockedTrainers });
  } else {
    return next(new AppError('No blocked trainers found', 404));
  }
});

// Get All Pending Trainees
const getAllPendingTrainees = catchAsyncError(async (req, res, next) => {
  const pendingTrainees = await traineeModel.find({ status: 'pending' });
  if (pendingTrainees) {
    return res.status(200).json({ success: true, data: pendingTrainees });
  } else {
    return next(new ErrorHandler('No pending trainees found', 404));
  }
});

// Block a Trainee
const blockTrainee = catchAsyncError(async (req, res, next) => {
  const traineeId = req.params.id;

  const updatedTrainee = await traineeModel.findByIdAndUpdate(
    traineeId,
    { isBlock: true },
    { new: true, runValidators: true }
  );

  if (!updatedTrainee) {
    return next(new AppError(`Trainee not found with id of ${traineeId}`, 404));
  }

  res.status(200).json({
    success: true,
    message: 'Trainee has been blocked.',
    data: updatedTrainee
  });
});

// Unblock a Trainee
const unblockTrainee = catchAsyncError(async (req, res, next) => {
  const traineeId = req.params.id;

  const updatedTrainee = await traineeModel.findByIdAndUpdate(
    traineeId,
    { isBlock: false },
    { new: true, runValidators: true }
  );

  if (!updatedTrainee) {
    return next(new AppError(`Trainee not found with id of ${traineeId}`, 404));
  }

  res.status(200).json({
    success: true,
    message: 'Trainee has been unblocked.',
    data: updatedTrainee
  });
});

// Get All Pending Trainers
const getAllPendingTrainers = catchAsyncError(async (req, res, next) => {
  const pendingTrainers = await trainerModel.find({ status: 'pending' });
  if (pendingTrainers) {
    return res.status(200).json({ success: true, data: pendingTrainers });
  } else {
    return next(new ErrorHandler('No pending trainers found', 404));
  }
});

// Block a Trainer
const blockTrainer = catchAsyncError(async (req, res, next) => {
  const trainerId = req.params.id;

  const updatedTrainer = await trainerModel.findByIdAndUpdate(
    trainerId,
    { isBlock: true },
    { new: true, runValidators: true }
  );

  if (!updatedTrainer) {
    return next(new AppError(`Trainer not found with id of ${trainerId}`, 404));
  }

  res.status(200).json({
    success: true,
    message: 'Trainer has been blocked.',
    data: updatedTrainer
  });
});

// Unblock a Trainer
const unblockTrainer = catchAsyncError(async (req, res, next) => {
  const trainerId = req.params.id;

  const updatedTrainer = await trainerModel.findByIdAndUpdate(
    trainerId,
    { isBlock: false },
    { new: true, runValidators: true }
  );

  if (!updatedTrainer) {
    return next(new AppError(`Trainer not found with id of ${trainerId}`, 404));
  }

  res.status(200).json({
    success: true,
    message: 'Trainer has been unblocked.',
    data: updatedTrainer
  });
});

//Get Trainee Details
const getTraineeDetails = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const data = await traineeModel.findById(id);
  if (data) {
    res.status(200).json({ success: true, data });
  } else {
    return next(new AppError("Trainee was not found or you're not authorized to do that")
    );
  }
});

export {
  getAllTrainersRequests,
  getTrainerDetails,
  adminAcceptTrainer,
  adminDeclineTrainer,
  getAllTrainees,
  getAllAcceptedTrainees,
  getAllBlockedTrainees,
  getAllPendingTrainees,
  blockTrainee,
  unblockTrainee,
  getAllTrainers,
  getAllAcceptedTrainers,
  getAllBlockedTrainers,
  getAllPendingTrainers,
  blockTrainer,
  unblockTrainer,
  getTraineeDetails,
};

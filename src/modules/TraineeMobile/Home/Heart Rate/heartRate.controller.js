import { HeartRate } from "../../../../../DB/models/heartRate.model.js";
import { catchAsyncError } from "../../../../utils/catchAsyncError.js";

const recordHeartRate = catchAsyncError(async (req, res) => {
  const traineeId = req.user.id;
  const { bpm } = req.body;

  const newHeartRate = await HeartRate.create({
    trainee: traineeId,
    bpm: bpm,
  });

  res.status(201).json({
    success: true,
    message: "Heart rate data recorded successfully.",
    data: newHeartRate,
  });
});

const getLastHeartRateRecord = catchAsyncError(async (req, res) => {
  const traineeId = req.user.id;

  // Get the most recent heart rate record for the trainee
  const lastHeartRateRecord = await HeartRate.findOne({ trainee: traineeId })
    .sort({ _id: -1 }) // Sort by most recent first
    .limit(1); // Only fetch the last record

  if (!lastHeartRateRecord) {
    return res.status(404).json({
      success: false,
      message: "No heart rate records found for this trainee.",
    });
  }

  res.status(200).json({
    success: true,
    message: "Last heart rate record retrieved successfully.",
    data: lastHeartRateRecord,
  });
});

export { recordHeartRate, getLastHeartRateRecord };

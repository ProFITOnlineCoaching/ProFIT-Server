import { sleepModel } from "../../../../../DB/models/sleepTracking.model.js";
import { catchAsyncError } from "../../../../utils/catchAsyncError.js";

// Utility function to calculate the sleep duration in minutes
function calculateSleepDuration(sleepStart, sleepEnd) {
  const start = new Date(sleepStart);
  const end = new Date(sleepEnd);
  let durationMins = (end - start) / (60 * 1000); // duration in minutes
  durationMins = Math.max(0, durationMins); // To ensure the duration is not negative
  const hours = Math.floor(durationMins / 60);
  const minutes = durationMins % 60;
  return {
    hours: hours,
    minutes: minutes,
    totalMinutes: durationMins // keep total minutes if needed for calculations
  };
}


function getEgyptToday(inputDate) {
  // Egypt does not currently observe Daylight Saving Time
  // If this changes, you will need a more robust solution
  const egyptTimezoneOffset = +2;

  // Create a new Date object for the input date or current date and time
  const now = inputDate ? new Date(inputDate) : new Date();

  // Adjust to Egypt's timezone
  now.setHours(
    now.getHours() + egyptTimezoneOffset - now.getTimezoneOffset() / 60
  );

  // Calculate the start of the day in Egypt's timezone
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  // Calculate the start of the next day in Egypt's timezone
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfToday.getDate() + 1);

  // Return Date objects directly
  return {
    startOfToday: startOfToday,
    startOfTomorrow: startOfTomorrow,
  };
}

// Add Sleep Record
const addSleepRecord = catchAsyncError(async (req, res) => {
  const traineeId = req.user.id;
  const { sleepStart, sleepEnd } = req.body;
  console.log(sleepStart,sleepEnd);
  const { hours, minutes, totalMinutes } = calculateSleepDuration(sleepStart, sleepEnd);

  // Use getEgyptToday to get the correct start of the day for sleepStart in Egypt's timezone
  const { startOfToday } = getEgyptToday(sleepStart);

  // Create new sleep record
  let sleepRecord = new sleepModel({
    trainee: traineeId,
    sleepStart,
    sleepEnd,
    duration: {
      hours: hours,
      minutes: minutes,
      totalMinutes: totalMinutes // Optional, only if you want to store the total minutes as well
    },
    date: startOfToday,
  });

  // Save the sleep record
  await sleepRecord.save();

  res.status(201).json({
    message: "Sleep record added successfully",
    sleepRecord,
  });
});

// get Latest Sleep Record for a Trainee
const getLatestSleepRecord = catchAsyncError(async (req, res) => {
  const traineeId = req.user.id;

  // Fetch the latest sleep record for the trainee
  const latestSleepRecord = await sleepModel.findOne({ trainee: traineeId })
    .sort({ sleepStart: -1 }) // Sort by sleepStart in descending order to get the latest
    .limit(1); // Limit to one document

  if (!latestSleepRecord) {
    // If there is no record, return the default record with zeroed-out times
    return res.status(200).json({
      message: "No sleep record found for the trainee",
      sleepRecord: {
        date: new Date().toISOString().substring(0, 10), // Current date in YYYY-MM-DD format
        sleepStart: '00:00',
        sleepEnd: '00:00',
        duration: {
          hours: 0,
          minutes: 0,
          totalMinutes: 0
        }
      }
    });
  }

  // Convert sleepStart and sleepEnd to Egypt timezone (UTC+2)
  const offset = 2 * 60; // Egypt is UTC+2
  const sleepStartInEgypt = new Date(latestSleepRecord.sleepStart.getTime() + offset * 60000);
  const sleepEndInEgypt = new Date(latestSleepRecord.sleepEnd.getTime() + offset * 60000);

  // Format the sleep data for the UI
  const formattedSleepData = {
    date: sleepStartInEgypt.toISOString().substring(0, 10), // Keep the date in YYYY-MM-DD format
    sleepStart: sleepStartInEgypt.toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit', hour12: true }),
    sleepEnd: sleepEndInEgypt.toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit', hour12: true }),
    duration: latestSleepRecord.duration
  };

  res.status(200).json({
    message: "Sleep record retrieved successfully",
    sleepRecord: formattedSleepData,
  });
});

// Update Sleep Record
const updateSleepRecord = catchAsyncError(async (req, res) => {
  const { id } = req.params; // ID of the sleep record
  const { sleepStart, sleepEnd } = req.body;
  const duration = calculateSleepDuration(sleepStart, sleepEnd);

  // Find and update the sleep record
  const updatedSleepRecord = await Sleep.findByIdAndUpdate(
    id,
    {
      sleepStart,
      sleepEnd,
      duration,
    },
    { new: true }
  );

  if (!updatedSleepRecord) {
    return res.status(404).json({ message: "Sleep record not found" });
  }

  res.status(200).json({
    message: "Sleep record updated successfully",
    updatedSleepRecord,
  });
});

// Reset Sleep Record - This functionality may need clarification; resetting implies erasing data
const resetSleepRecord = catchAsyncError(async (req, res) => {
  const traineeId = req.user.id;
  const { date } = req.query; // The reset might need a specific date

  // Use the date to find the start and end of the day in Egypt's timezone
  const { startOfToday } = getEgyptToday(date); // Assuming this function is adjusted to accept a date parameter

  // Reset the sleep record(s) for the specified date
  const updatedRecords = await Sleep.updateMany(
    {
      trainee: traineeId,
      date: startOfToday,
    },
    {
      $set: {
        sleepStart: null,
        sleepEnd: null,
        duration: 0,
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json({ message: "Sleep records have been reset", updatedRecords });
});

export { addSleepRecord, getLatestSleepRecord, updateSleepRecord, resetSleepRecord };

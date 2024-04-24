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
  const { sleepStartUtc, sleepEndUtc } = req.body;

  // Convert the incoming string dates to Date objects without adjusting for Egypt local time
  const sleepStart = new Date(sleepStartUtc);
  const sleepEnd = new Date(sleepEndUtc);

  // Calculate duration based on the provided UTC times
  const { hours, minutes, totalMinutes } = calculateSleepDuration(sleepStart, sleepEnd);

  // Adjust sleepStart to the start of the day in UTC
  const utcDate = new Date(sleepStart);
  utcDate.setUTCHours(0, 0, 0, 0); // Sets the time to midnight UTC

  // Create new sleep record with UTC dates
  let sleepRecord = new sleepModel({
    trainee: traineeId,
    sleepStart, // stored in UTC
    sleepEnd,   // stored in UTC
    duration: {
      hours: hours,
      minutes: minutes,
      totalMinutes: totalMinutes // this is the duration in minutes
    },
    date: utcDate, // the start of the day in UTC
  });

  // Save the sleep record
  await sleepRecord.save();

  // Return the response with the stored UTC times
  res.status(201).json({
    success: true,
    message: "Sleep record added successfully",
    sleepRecord: {
      ...sleepRecord.toObject(),
      sleepStart: sleepRecord.sleepStart.toISOString(), // Returned in UTC
      sleepEnd: sleepRecord.sleepEnd.toISOString(),     // Returned in UTC
      date: sleepRecord.date.toISOString().split('T')[0] // The date in UTC
    },
  });
});


const getLatestSleepRecord = catchAsyncError(async (req, res) => {
  const traineeId = req.user.id;

  // Fetch the latest sleep record for the trainee
  const latestSleepRecord = await sleepModel.findOne({ trainee: traineeId })
  .sort({ _id: -1 }) // Sort by the _id field in descending order to get the latest record
  .limit(1);

    console.log(latestSleepRecord);

  if (!latestSleepRecord) {
    // If there is no record, return a default record with zeroed-out times
    return res.status(200).json({
      success: true,
      message: "No sleep record found for the trainee",
      data: {
        date: '', // You could use today's date in UTC converted to Egyptian time
        sleepStart: '00:00 AM',
        sleepEnd: '00:00 AM',
        duration: {
          hours: 0,
          minutes: 0,
          totalMinutes: 0
        }
      }
    });
  }

  // Helper function to convert UTC date to Egypt local time (UTC+2)
  const convertToEgyptLocalTime = (utcDate) => {
    // Create a new Date object from the UTC date
    const date = new Date(utcDate);
    // Convert it to local time in Egypt by adding 2 hours
    date.setUTCHours(date.getUTCHours() + 2);
    return date;
  };

  const sleepStartLocal = convertToEgyptLocalTime(latestSleepRecord.sleepStart);
  const sleepEndLocal = convertToEgyptLocalTime(latestSleepRecord.sleepEnd);

  // Format the sleep times to a user-friendly 12-hour clock string
  const formatTo12HourClock = (date) => {
    const hours = date.getUTCHours(); // getUTCHours() because we've manually adjusted the date object
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 24h to 12h format; 0 becomes 12
    return `${formattedHours}:${minutes} ${amPm}`;
  };

  // Construct the response data
  const sleepRecordData = {
    date: latestSleepRecord.date.toISOString().substring(0, 10), // Keep the date as is
    sleepStart: formatTo12HourClock(sleepStartLocal),
    sleepEnd: formatTo12HourClock(sleepEndLocal),
    duration: latestSleepRecord.duration
  };

  res.status(200).json({
    success: true,
    message: "Latest sleep record retrieved successfully",
    data: sleepRecordData
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

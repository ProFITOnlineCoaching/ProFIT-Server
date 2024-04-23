import mongoose from "mongoose";
import { catchAsyncError } from "../../../../utils/catchAsyncError.js";
import { waterIntakeModel } from "../../../../../DB/models/waterIntakeSchema.model.js";

function getEgyptToday() {
  // Create a new Date object for the current date and time
  const now = new Date();

  // Specify the timezone to Egypt (UTC+2)
  const egyptTimezoneOffset = 2 * 60; // Egypt is UTC+2 (in minutes)

  // Calculate the UTC timestamp for Egypt's midnight (start of the day)
  const egyptMidnightUTC = new Date(
    now.getTime() + egyptTimezoneOffset * 60000
  );
  egyptMidnightUTC.setUTCHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0

  // Calculate the UTC timestamp for Egypt's midnight tomorrow
  const egyptMidnightTomorrowUTC = new Date(egyptMidnightUTC);
  egyptMidnightTomorrowUTC.setDate(egyptMidnightUTC.getDate() + 1);

  // Return Date objects directly
  return {
    startOfToday: egyptMidnightUTC,
    startOfTomorrow: egyptMidnightTomorrowUTC,
  };
}

function getSevenDaysAgoFromEgyptToday() {
  // Retrieve the start of today as a Date object from Egypt's time calculation
  const { startOfToday } = getEgyptToday();

  // Use the Date object directly
  const sevenDaysAgo = new Date(startOfToday);

  // Calculate the date seven days ago
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Optionally, ensure the time is still set to midnight UTC, if necessary
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);

  // Return the Date object directly
  console.log(sevenDaysAgo);
  return sevenDaysAgo;
}

function getThirtyDaysAgoEgypt() {
  // Get the current date and time
  const now = new Date();
  // Calculate the local time in Egypt (UTC+2)
  const egyptNow = new Date(
    now.getTime() + (2 * 60 - now.getTimezoneOffset()) * 60000
  );
  // Subtract 30 days
  egyptNow.setDate(egyptNow.getDate() - 30);
  // Set to midnight
  egyptNow.setHours(0, 0, 0, 0);
  console.log(egyptNow);

  return egyptNow;
}

const addCup = catchAsyncError(async (req, res) => {
  const traineeId = req.user.id;
  const { startOfToday, startOfTomorrow } = getEgyptToday();
  const cupAmount = 250; // Amount of water per cup

  let intake = await waterIntakeModel.findOne({
    trainee: traineeId,
    date: {
      $gte: startOfToday,
      $lt: startOfTomorrow,
    },
  });

  if (intake) {
    if (intake.currentIntake + cupAmount > intake.dailyGoal) {
      return res
        .status(400)
        .json({ message: "You have reached your daily water intake goal!" });
    } else {
      intake.currentIntake += cupAmount;
      await intake.save();
    }
  } else {
    intake = await waterIntakeModel.create({
      trainee: traineeId,
      currentIntake: cupAmount,
      dailyGoal: 3500,
      date: startOfToday, // this should be the start of the current day in Egypt's local time
    });
  }

  res.status(200).json({
    message: `Added ${cupAmount} mL to your daily intake`,
    currentIntake: intake.currentIntake,
  });
});

// Logic for Filling All Daily Water Needs with check not to exceed dailyGoal
const fillAll = catchAsyncError(async (req, res) => {
  const traineeId = req.user.id;
  const { startOfToday, startOfTomorrow } = getEgyptToday();

  let intake = await waterIntakeModel.findOne({
    trainee: traineeId,
    date: {
      $gte: startOfToday, // Use the start of today in Egypt's timezone
      $lt: startOfTomorrow, // Use the start of tomorrow in Egypt's timezone
    },
  });

  if (!intake) {
    // If no intake record exists for today, create a new one and set it to the daily goal
    intake = new waterIntakeModel({
      trainee: traineeId,
      currentIntake: 3500, // Assuming 3500 mL is the daily goal
      dailyGoal: 3500,
      date: startOfToday, // Ensure the date is set correctly for Egypt's timezone
    });
    await intake.save();
  } else {
    // If intake already exists and it's less than the daily goal, update it to the daily goal
    if (intake.currentIntake < intake.dailyGoal) {
      intake.currentIntake = intake.dailyGoal;
      await intake.save();
    } else {
      // If the daily goal has already been reached, respond with an appropriate message
      return res.status(400).json({
        message: "You have already reached your daily water intake goal!",
      });
    }
  }

  res.status(200).json({ message: "Daily water needs have been filled" });
});

const getCurrentIntake = catchAsyncError(async (req, res) => {
  const traineeId = req.user.id;
  const { startOfToday, startOfTomorrow } = getEgyptToday(); // Use the Egypt timezone aware date

  const intake = await waterIntakeModel.findOne({
    trainee: traineeId,
    date: {
      $gte: startOfToday,
      $lt: startOfTomorrow,
    },
  });

  // Initialize the response object
  let response = {
    date: startOfToday, // We use startOfToday to show the current date in the response
    currentIntake: 0,
    dailyGoal: 3500, // Assuming a static daily goal, can be dynamic if needed
    percentage: 0.0, // Set as a string formatted number for consistency in response format
  };

  if (intake) {
    // Calculate the percentage only if there is an intake record
    const percentage = (intake.currentIntake / intake.dailyGoal) * 100;
    response = {
      ...response,
      currentIntake: intake.currentIntake,
      percentage: +percentage.toFixed(2), // Convert string to Number after formatting
    };
  }

  res.status(200).json(response);
});

// Logic for Resetting Daily Water Intake
const resetIntake = catchAsyncError(async (req, res) => {
  const traineeId = req.user.id;
  const { startOfToday, startOfTomorrow } = getEgyptToday(); // Use the Egypt timezone aware dates

  // Find the record for today and reset the currentIntake
  await waterIntakeModel.findOneAndUpdate(
    {
      trainee: traineeId,
      date: {
        $gte: startOfToday, // Use the start of today in Egypt's timezone
        $lt: startOfTomorrow, // Use the start of tomorrow in Egypt's timezone
      },
    },
    { currentIntake: 0 }, // Reset current intake to 0
    { new: true } // Return the updated document (optional)
  );

  res.status(200).json({ message: "Daily intake has been reset" });
});

const getWeeklyAverageIntake = catchAsyncError(async (req, res) => {
  const traineeId = new mongoose.Types.ObjectId(req.user.id);
  const sevenDaysAgo = getSevenDaysAgoFromEgyptToday();
  const dailyGoal = 3500;
  const daysInWeek = 7;

  const results = await waterIntakeModel.aggregate([
    { $match: { trainee: traineeId, date: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: null,
        totalIntake: { $sum: "$currentIntake" },
        count: { $sum: 1 }, // Counting days with entries
      },
    },
    {
      $project: {
        _id: 0,
        averageIntake: { $divide: ["$totalIntake", "$count"] }, // Average per active day
        totalPercentage: {
          $multiply: [
            { $divide: ["$totalIntake", dailyGoal * daysInWeek] },
            100,
          ],
        }, // Total percentage of weekly goal
      },
    },
  ]);

  if (results.length === 0) {
    return res.status(200).json({
      averageIntake: 0,
      averagePercentage: 0,
    });
  }

  const averageData = results[0];
  res.status(200).json({
    averagePercentage: +averageData.totalPercentage.toFixed(2), // Making sure to format as a fixed decimal
  });
});

const getMonthlyAverageIntake = catchAsyncError(async (req, res) => {
  const traineeId = new mongoose.Types.ObjectId(req.user.id);
  const thirtyDaysAgo = getThirtyDaysAgoEgypt();
  const dailyGoal = 3500;
  const daysInMonth = 30; // Assuming a fixed 30-day period for simplicity

  const results = await waterIntakeModel.aggregate([
    { $match: { trainee: traineeId, date: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: null,
        totalIntake: { $sum: "$currentIntake" },
        count: { $sum: 1 }, // Count the days with entries to calculate a more accurate average
      },
    },
    {
      $project: {
        _id: 0,
        averageIntake: { $divide: ["$totalIntake", "$count"] }, // Average intake per day recorded
        totalPercentage: {
          $multiply: [
            { $divide: ["$totalIntake", dailyGoal * daysInMonth] },
            100,
          ],
        }, // Total percentage of monthly goal
      },
    },
  ]);

  // If no records were found, return zeros
  if (results.length === 0) {
    return res.status(200).json({
      averagePercentage: 0,
    });
  }

  // Send the average intake and percentage of the goal achieved
  const averageData = results[0];
  res.status(200).json({
    averagePercentage: +averageData.totalPercentage.toFixed(2), // Round to two decimal places and ensure it's a number
  });
});

export {
  addCup,
  getWeeklyAverageIntake,
  getMonthlyAverageIntake,
  fillAll,
  resetIntake,
  getCurrentIntake,
};

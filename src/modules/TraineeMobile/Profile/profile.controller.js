import { AppError } from "../../../utils/AppError.js";
import { generateRandomOTP } from "../../../utils/OTPGenerator.js";
import { catchAsyncError } from "../../../utils/catchAsyncError.js";
import { traineeModel } from "../../../../DB/models/trainee.model.js";
import { traineeBasicInfoModel } from "./../../../../DB/models/traineeBasicInfo.model.js";
import { trainerModel } from "../../../../DB/models/trainer.model.js";
import { calculateAge } from "../../../middlewares/factors.js";
import moment from 'moment';


const profileSettings = catchAsyncError(async (req, res, next) => {
    const traineeId = req.user.id;  
    console.log(traineeId);
    const data = await traineeModel.findById(traineeId, 'firstName lastName email profilePhoto'); 
    if (!data) {
        return next(new AppError("User was not found!", 404));
    }
    res.status(200).json({ success: true, message: "Data fetched succesfully", data });
});

const getAccountData = catchAsyncError(async (req, res, next) => {
    const traineeId = req.user.id;
    const data = await traineeModel.findById(traineeId, 'firstName lastName email profilePhoto phoneNumber');
    
    if (!data) {
        return next(new AppError("User was not found!", 404));
    }
    
    res.status(200).json({ success: true, message: "Data fetched successfully", data });
});

const updateAccountData = catchAsyncError(async (req, res, next) => {
    const traineeId = req.user.id;
    const { firstName, lastName, email, phoneNumber } = req.body;
    
    const updatedData = await traineeModel.findByIdAndUpdate(
        traineeId,
        { firstName, lastName, email, phoneNumber },
        { new: true, runValidators: true }
    );

    if (!updatedData) {
        return next(new AppError("User not found!", 404));
    }

    res.status(200).json({ success: true, message: "Account data updated successfully", data: updatedData });
});

const getPersonalData = catchAsyncError(async (req, res, next) => {
    const traineeId = req.user.id;
    // Use .lean() to get a plain JavaScript object
    const personalData = await traineeBasicInfoModel.findOne({ trainee: traineeId }).lean();
    
    if (!personalData) {
        return next(new AppError("Personal data not found!", 404));
    }

    // Now you can safely modify it because it's a plain object
    personalData.birthDate = moment(personalData.birthDate).format('YYYY-MM-DD');

    res.status(200).json({ success: true, message: "Personal data fetched successfully", data: personalData });
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
        updatedPersonalData.birthDate = updatedPersonalData.birthDate.toISOString().split('T')[0];
    }

    res.status(200).json({ success: true, message: "Personal data updated successfully", data: updatedPersonalData });
});


export { profileSettings,getAccountData,updateAccountData,getPersonalData,updatePersonalData };
  
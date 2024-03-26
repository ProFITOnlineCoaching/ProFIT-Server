import { AppError } from "../../../utils/AppError.js";
import { generateRandomOTP } from "../../../utils/OTPGenerator.js";
import { catchAsyncError } from "../../../utils/catchAsyncError.js";
import { traineeModel } from "../../../../DB/models/trainee.model.js";
import { traineeBasicInfoModel } from "./../../../../DB/models/traineeBasicInfo.model.js";
import { trainerModel } from "../../../../DB/models/trainer.model.js";
import { calculateAge } from "../../../middlewares/factors.js";


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
    const trainee = await traineeModel.findById(traineeId).populate('traineeBasicInfo');

    if (!trainee) {
        return next(new AppError("Trainee not found", 404));
    }

    // Extract the traineeBasicInfo for easier access
    const basicInfo = trainee.traineeBasicInfo;

    // Assemble the response data
    const data = {
        fullName: `${trainee.firstName} ${trainee.lastName}`,
        profilePhoto: trainee.profilePhoto,
        biography: trainee.biography,
        phoneNumber: trainee.phoneNumber,
        age: basicInfo && basicInfo.birthDate ? calculateAge(basicInfo.birthDate) : null,
        height: basicInfo ? basicInfo.height : null,
        gender: basicInfo ? basicInfo.gender : null,
        fitnessGoals: basicInfo ? basicInfo.fitnessGoals : null,
        experience: trainee.experience,
        activityLevel: basicInfo ? basicInfo.activityLevel : null,
        religion: trainee.religion,
        nationality: trainee.nationality,
    };

    res.status(200).json({ success: true, message: "Data fetched successfully", data });
});
export { profileSettings,getAccountData,updateAccountData,getPersonalData };
  
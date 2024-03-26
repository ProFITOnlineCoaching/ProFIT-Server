import { AppError } from "../../../utils/AppError.js";
import { generateRandomOTP } from "../../../utils/OTPGenerator.js";
import { catchAsyncError } from "../../../utils/catchAsyncError.js";
import { traineeModel } from "../../../../DB/models/trainee.model.js";
import { traineeBasicInfoModel } from "./../../../../DB/models/traineeBasicInfo.model.js";
import { trainerModel } from "../../../../DB/models/trainer.model.js";




const profileSettings = catchAsyncError(async (req, res, next) => {
    const traineeId = req.user.id;  
    console.log(traineeId);
    const data = await traineeModel.findById(traineeId, 'firstName lastName email'); 
    if (!data) {
        return next(new AppError("User was not found!", 404));
    }
    res.status(200).json({ success: true, message: "Data fetched succesfully", data });
});
  export { profileSettings };
  
import { traineeModel } from "../../../../DB/models/trainee.model.js";
import { AppError } from "../../../utils/AppError.js";
import { catchAsyncError } from "../../../utils/catchAsyncError.js";

const homeNavbar = catchAsyncError(async (req, res, next) => {
  const traineeId = req.user.id;
  console.log(traineeId);
  const data = await traineeModel.findById(
    traineeId,
    "firstName lastName profilePhoto"
  );
  if (!data) {
    return next(new AppError("User was not found!", 404));
  }
  res
    .status(200)
    .json({ success: true, message: "Data fetched succesfully", data });
});


export { homeNavbar };

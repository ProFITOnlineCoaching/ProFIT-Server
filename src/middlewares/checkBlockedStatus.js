import { traineeModel } from "../../../DB/models/trainee.model.js";
import { trainerModel } from "../../../DB/models/trainer.model.js";

export const checkBlockedStatus = (userType) => {
    return catchAsyncError(async (req, res, next) => {
      const User = userType === 'trainer' ? trainerModel : traineeModel; 

      const userId = req.user.id; 
      const user = await User.findById(userId);
                                                                                     
      if (!user) {
        return res.status(404).json({ message: `${userType} not found.` });
      }

      // Check the isBlock status of the user
      if (user.isBlock) {
        return res.status(403).json({ message: `${userType} is blocked and cannot perform this action.` });
      }

      next();
    });
};

// checkBlockedStatus('trainer')
// checkBlockedStatus('trainee')
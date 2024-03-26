import { Router } from "express";
const tranieeAuthRouter = Router();
import * as auth from "./auth.controller.js";
import { checkRole, verifyToken } from "../../../middlewares/authToken.js";




tranieeAuthRouter.post("/signup", auth.tranieeSignUp);
tranieeAuthRouter.post("/verify-otp", auth.verifyTraineeOTP); //it takes 10 min to expire
tranieeAuthRouter.post("/resend-otp", auth.resendOTP);
tranieeAuthRouter.post("/basic-info",verifyToken,checkRole('trainee') , auth.basicInformation);
tranieeAuthRouter.post("/forget-password", auth.forgetPassword);
tranieeAuthRouter.post("/reset-password", auth.resetPassword);
tranieeAuthRouter.post("/signin", auth.traineeSignIn);


// checkBlockedStatus('trainer')




export default tranieeAuthRouter;

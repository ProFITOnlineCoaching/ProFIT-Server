import { Router } from "express";
const tranieeProfileRouter = Router();
import * as profile from "./profile.controller.js";
import { checkRole, verifyToken } from "../../../middlewares/authToken.js";


tranieeProfileRouter.get("/",verifyToken,checkRole('trainee'),profile.profileSettings);

tranieeProfileRouter.get("/account-data", verifyToken, checkRole('trainee'), profile.getAccountData);

tranieeProfileRouter.patch("/account-data", verifyToken, checkRole('trainee'), profile.updateAccountData);

tranieeProfileRouter.get("/personal-data", verifyToken, checkRole('trainee'), profile.getPersonalData);

tranieeProfileRouter.patch("/personal-data", verifyToken, checkRole('trainee'), profile.updatePersonalData);



export default tranieeProfileRouter;

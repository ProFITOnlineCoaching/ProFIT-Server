import { Router } from "express";
const tranieeProfileRouter = Router();
import * as profile from "./profile.controller.js";
import { checkRole, verifyToken } from "../../../middlewares/authToken.js";


tranieeProfileRouter.get("/",verifyToken,checkRole('trainee'),profile.profileSettings);
// GET route for fetching account data
tranieeProfileRouter.get("/account-data", verifyToken, checkRole('trainee'), profile.getAccountData);

// PATCH route for updating account data
tranieeProfileRouter.patch("/account-data", verifyToken, checkRole('trainee'), profile.updateAccountData);


tranieeProfileRouter.get("/personal-data",verifyToken,checkRole('trainee'),profile.getPersonalData);



export default tranieeProfileRouter;

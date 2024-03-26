import { Router } from "express";
const tranieeProfileRouter = Router();
import * as profile from "./profile.controller.js";
import { checkRole, verifyToken } from "../../../middlewares/authToken.js";


tranieeProfileRouter.get("/",verifyToken,checkRole('trainee'),profile.profileSettings);



export default tranieeProfileRouter;

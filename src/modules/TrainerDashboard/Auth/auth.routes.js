import { Router } from "express";
const trainerAuthRoutes = Router();
import * as auth from "./auth.controller.js";
import { checkRole, verifyToken } from "../../../middlewares/authToken.js";
import { uploadMixOfFiles } from "../../../Multer/multer.js";

let arrFields = [
    { name: "profilePhoto", maxCount: 1 },
    { name: "nationalId", maxCount: 2 },
    { name: "qualificationsAndAcheivments", maxCount: 10 },
    { name: "clientTransformationBefore", maxCount: 10 }, // Ensure these lines
    { name: "clientTransformationAfter", maxCount: 10 },  // are added];
  ]

trainerAuthRoutes.post('/signup',uploadMixOfFiles(arrFields),auth.signUpAndCompleteProfile)



export default trainerAuthRoutes;

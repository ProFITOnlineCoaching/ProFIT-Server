import { Router } from "express";
const tranieeheartRate = Router();
import * as heartRate from "./heartRate.controller.js";
import { checkRole, verifyToken } from "../../../../middlewares/authToken.js";

tranieeheartRate.post("/", verifyToken, checkRole("trainee"), heartRate.recordHeartRate);
tranieeheartRate.get("/", verifyToken, checkRole("trainee"), heartRate.getLastHeartRateRecord);


export default tranieeheartRate;

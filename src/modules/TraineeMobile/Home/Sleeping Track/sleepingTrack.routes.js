import { Router } from "express";
const tranieeSleepingTrack = Router();
import * as sleepingTrack from "./sleepingTrack.controller.js";
import { checkRole, verifyToken } from "../../../../middlewares/authToken.js";

tranieeSleepingTrack.post("/", verifyToken, checkRole("trainee"), sleepingTrack.addSleepRecord);
tranieeSleepingTrack.get("/", verifyToken, checkRole("trainee"), sleepingTrack.getLatestSleepRecord);


export default tranieeSleepingTrack;

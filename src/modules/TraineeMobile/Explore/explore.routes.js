import { Router } from "express";
const tranieeExploreRouter = Router();
import * as explore from "./explore.controller.js";
import { checkRole, verifyToken } from "../../../middlewares/authToken.js";


tranieeExploreRouter.get("/trainers",verifyToken,checkRole('trainee'),explore.getAllTrainers);
tranieeExploreRouter.get("/trainers/:trainerId", verifyToken, checkRole('trainee'), explore.getTrainerDetails);



export default tranieeExploreRouter;

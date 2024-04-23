import { Router } from "express";
const tranieeWaterNeedsRouter = Router();
import * as waterNeeds from "./waterNeeds.controller.js";
import { checkRole, verifyToken } from "../../../../middlewares/authToken.js";

// Route for adding a cup of water (250mL)
tranieeWaterNeedsRouter.post(
  "/add-cup",
  verifyToken,
  checkRole("trainee"),
  waterNeeds.addCup
);

tranieeWaterNeedsRouter.get(
  "/weekly-average",
  verifyToken,
  checkRole("trainee"),
  waterNeeds.getWeeklyAverageIntake
);

tranieeWaterNeedsRouter.get(
  "/monthly-average",
  verifyToken,
  checkRole("trainee"),
  waterNeeds.getMonthlyAverageIntake
);
// Route for filling all the daily water needs
tranieeWaterNeedsRouter.post(
  "/fill-all",
  verifyToken,
  checkRole("trainee"),
  waterNeeds.fillAll
);

// Route for resetting the daily water intake
tranieeWaterNeedsRouter.post(
  "/reset",
  verifyToken,
  checkRole("trainee"),
  waterNeeds.resetIntake
);

// Route for getting the current water intake and percentage
tranieeWaterNeedsRouter.get(
  "/current",
  verifyToken,
  checkRole("trainee"),
  waterNeeds.getCurrentIntake
);
export default tranieeWaterNeedsRouter;

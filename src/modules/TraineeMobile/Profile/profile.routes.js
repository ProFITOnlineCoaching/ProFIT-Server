import { Router } from "express";
const tranieeProfileRouter = Router();
import * as profile from "./profile.controller.js";
import { checkRole, verifyToken } from "../../../middlewares/authToken.js";
import { uploadMixOfFiles } from "../../../Multer/multer.js";

import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
export const uploadProfilePhoto = upload.fields([{ name: 'profilePhoto', maxCount: 1 }]);


tranieeProfileRouter.get(
  "/",
  verifyToken,
  checkRole("trainee"),
  profile.profileSettings
);

tranieeProfileRouter.get(
  "/account-data",
  verifyToken,
  checkRole("trainee"),
  profile.getAccountData
);

tranieeProfileRouter.patch(
  "/account-data",
  verifyToken,
  checkRole("trainee"),
  uploadProfilePhoto,
  profile.updateAccountData
);

tranieeProfileRouter.get(
  "/personal-data",
  verifyToken,
  checkRole("trainee"),
  profile.getPersonalData
);

tranieeProfileRouter.patch(
  "/personal-data",
  verifyToken,
  checkRole("trainee"),
  profile.updatePersonalData
);

tranieeProfileRouter.post(
  "/change-password",
  verifyToken,
  checkRole("trainee"),
  profile.changePassword
);

tranieeProfileRouter.delete(
  "/delete-account",
  verifyToken,
  checkRole("trainee"),
  profile.deleteAccount
);

export default tranieeProfileRouter;

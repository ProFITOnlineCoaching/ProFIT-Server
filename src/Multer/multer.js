import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../utils/AppError.js";
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({ 
  cloud_name: 'dbpvx37nc', 
  api_key: '379943924215678', 
  api_secret: '8HPjq5e6rCAY_NPLRGlNpwee-9Q' 
});

function multerRefactor() {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let name;
      let basePath;

      console.log(req.user);
      // Check the user's role to determine the folder structure
      if (req.user.role === "trainee") {
        // For trainees, use the trainee's name to create a folder
        name = `${req.user.firstName} ${req.user.lastName}`;
        basePath = `uploads/Trainees/${name}`;
      } else {
        // For trainers, use the trainer's name from the body to create a folder
        name = `${req.body.firstName} ${req.body.lastName}`;
        basePath = `uploads/Trainers/${name}`;
      }
      console.log(name);
      console.log(file.fieldname);

      let subfolderName;
      switch (file.fieldname) {
        case "profilePhoto":
          subfolderName = "ProfilePhotos";
          break;
        case "nationalId":
          subfolderName = "NationalIDs";
          break;
        case "qualificationsAndAcheivments":
          subfolderName = "QualificationsAndAchievements";
          break;
        default:
          subfolderName = "Other";
      }

      const dir = `${basePath}/${subfolderName}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      // Generate a unique filename
      const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, `${file.fieldname}-${Date.now()}-${uniqueSuffix}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    // Allow only images and PDFs
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new AppError("Only image files or PDF are allowed!", 400), false);
    }
  };

  return multer({ storage, fileFilter });
}

export const uploadMixOfFiles = (arrOfFields) => {
  return multerRefactor().fields(arrOfFields);
};

import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../utils/AppError.js";

import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: 'dbpvx37nc', 
  api_key: '379943924215678', 
  api_secret: '8HPjq5e6rCAY_NPLRGlNpwee-9Q' 
});

cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });

function multerRefactor() {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const name = `${req.body.firstName} ${req.body.lastName}` || "default";
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
            
            const dir = `uploads/Trainers/${name}/${subfolderName}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
            cb(null, `${file.fieldname}-${Date.now()}-${uniqueSuffix}`);
        },
    });

    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
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

import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../utils/AppError.js";

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

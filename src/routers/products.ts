import express, { NextFunction, Request, Response, Router } from "express";

import { S3Client } from "@aws-sdk/client-s3";
import { validateBufferMIMEType } from "validate-image-type";

import multer from "multer";
import multerS3 from "multer-s3";

const router: Router = express.Router();

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESSKEY,
    secretAccessKey: process.env.AWS_BUCKET_SECRETKEY!,
  },
});

router.use(multer().single("image"));

async function verifyUploadedFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.file) {
    console.log("sample", req.file);
    const isValid = await validateBufferMIMEType(req.file?.buffer, {
      originalFilename: req.file.originalname,
      allowMimeTypes: ["image/png", "image/jpeg"],
    });

    if (!isValid.ok) {
      return res.status(400).json({ message: "invalid uploaded image" });
    }
  } else {
    return res.status(400).json({ message: "please upload a file." });
  }

  next();
}

router.post(
  "/:storeId/upload",
  verifyUploadedFile,
  async (req: Request, res: Response) => {
    return res.status(201).json({ message: "okay" });
  }
);

export default router;

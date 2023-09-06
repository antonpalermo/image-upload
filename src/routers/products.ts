import express, { NextFunction, Request, Response, Router } from "express";

import { S3Client } from "@aws-sdk/client-s3";
import { validateBufferMIMEType } from "validate-image-type";

import multer from "multer";
import multerS3 from "multer-s3";
import checkImageBuffer from "../middlewares/check-image-buffer";

const router: Router = express.Router();

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESSKEY,
    secretAccessKey: process.env.AWS_BUCKET_SECRETKEY!,
  },
});

router.use(multer().single("image"));

router.post(
  "/:storeId/upload",
  checkImageBuffer,
  async (req: Request, res: Response) => {
    return res.status(201).json({ message: "okay" });
  }
);

export default router;

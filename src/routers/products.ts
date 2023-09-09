import express, { Request, Response, Router } from "express";

import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import multer from "multer";

import checkImageBuffer from "../middlewares/check-image-buffer";
import resizeImage from "../middlewares/resize-image";

import { generateFilename } from "../libs/generate-filename";

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
  resizeImage,
  async (req: Request, res: Response) => {
    const params: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `sample/${generateFilename}.webp`,
      Body: req.file?.buffer,
      ContentType: "image/webp",
    };

    const uploadCommand = new PutObjectCommand(params);

    await s3Client.send(uploadCommand);

    return res.status(201).json({ message: "image uploaded" });
  }
);

export default router;

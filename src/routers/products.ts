import express, { NextFunction, Request, Response, Router } from "express";

import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
  UploadPartCommand,
  UploadPartCommandInput,
} from "@aws-sdk/client-s3";
import { validateBufferMIMEType } from "validate-image-type";

import sharp from "sharp";
import multer from "multer";
import multerS3 from "multer-s3";

import checkImageBuffer from "../middlewares/check-image-buffer";
import processImageBuffer from "../middlewares/process-image-buffer";

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
  processImageBuffer,
  async (req: Request, res: Response) => {
    const uploadedFile = await sharp(req.file?.buffer)
      .resize({ width: 500, height: 500 })
      .withMetadata()
      .toFormat("webp")
      .toBuffer({
        resolveWithObject: true,
      });

    console.log(uploadedFile.info);

    const params: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `sample/${req.file?.originalname}`,
      Body: uploadedFile.data,
      ContentType: "image/webp",
    };

    const uploadCommand = new PutObjectCommand(params);

    await s3Client.send(uploadCommand);

    return res.status(201).json({ message: "okay" });
  }
);

export default router;

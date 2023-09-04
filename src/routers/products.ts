import express, { Request, Response, Router } from "express";

import multer from "multer";
import multerS3 from "multer-s3";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const router: Router = express.Router();

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESSKEY,
    secretAccessKey: process.env.AWS_BUCKET_SECRETKEY!,
  },
});

router.post(
  "/:storeId/upload",
  multer().single("image"),
  async (req: Request, res: Response) => {
    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `screenshots/${req.file?.originalname}`,
      Body: req.file?.buffer,
      ContentType: req.file?.mimetype,
    };

    const command = new PutObjectCommand(s3Params);
    await s3Client.send(command);

    return res.status(201).json({ message: "okay" });
  }
);

export default router;

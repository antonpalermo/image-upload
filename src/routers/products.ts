import multer from "multer";
import express, { Request, Response, Router } from "express";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

import prisma from "../libs/prisma";
import resizeImage from "../middlewares/resize-image";
import checkImageBuffer from "../middlewares/check-image-buffer";

import { generateFilename } from "../libs/generate-filename";
import { fetchImages } from "../handlers/fetch-images";

const router: Router = express.Router();

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESSKEY,
    secretAccessKey: process.env.AWS_BUCKET_SECRETKEY!,
  },
});

router.use(multer().single("image"));

router.get("/:storeId/images", fetchImages);

router.post(
  "/:storeId/upload",
  checkImageBuffer,
  resizeImage,
  async (req: Request, res: Response) => {
    try {
      const filename = generateFilename();
      // setup s3 upload parameters
      const params: PutObjectCommandInput = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: req.file?.buffer,
        ContentType: "image/webp",
      };
      // create a new put object command
      const uploadCommand = new PutObjectCommand(params);
      // send upload command to s3
      await s3Client.send(uploadCommand);
      // store the filename assigned to the uploaded image
      await prisma.images.create({ data: { name: filename } });
      // return created status
      return res.status(201).json({ message: "image successfully uploaded." });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "unable to upload image to s3 bucket." });
    }
  }
);

export default router;

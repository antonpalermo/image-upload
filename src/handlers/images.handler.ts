import { Request, Response } from "express";

import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

import { CloudFrontClient } from "@aws-sdk/client-cloudfront";

import prisma from "../libs/prisma";

import { generateFilename } from "../libs/generate-filename";
import { deleteS3Object, invalidateCDNCache } from "../libs/helpers";

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESSKEY,
    secretAccessKey: process.env.AWS_BUCKET_SECRETKEY!,
  },
});

const cloudfrontClient = new CloudFrontClient({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESSKEY,
    secretAccessKey: process.env.AWS_BUCKET_SECRETKEY!,
  },
});

interface IncomingRequest extends Omit<Request, "params"> {
  params: {
    filename: string;
  };
}

async function uploadImage(req: IncomingRequest, res: Response) {
  try {
    const filename = generateFilename();
    // store the filename assigned to the uploaded image
    await prisma.images.create({ data: { name: filename } });

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
    // return created status
    return res.status(201).json({ message: "image successfully uploaded." });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ message: "unable to upload image to s3 bucket." });
  }
}

async function deleteImage(req: IncomingRequest, res: Response) {
  try {
    const filename = req.params.filename;

    await invalidateCDNCache(cloudfrontClient, filename);
    await deleteS3Object(s3Client, filename);
    await prisma.images.delete({ where: { name: filename } });

    return res
      .status(200)
      .json({ message: `${filename} successfully deleted` });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Unable to complete requested action." });
  }
}

export default { deleteImage, uploadImage };

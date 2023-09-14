import { Request, Response } from "express";

import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import prisma from "../libs/prisma";
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

export default { deleteImage };

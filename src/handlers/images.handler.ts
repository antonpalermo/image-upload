import { Request, Response } from "express";

import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

import { CloudFrontClient } from "@aws-sdk/client-cloudfront";

import prisma from "../libs/prisma";
import helpers from "../libs/helpers";

import { generateFilename } from "../libs/generate-filename";

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

async function getImages(_: IncomingRequest, res: Response) {
  try {
    // query all images.
    const images = await prisma.images.findMany({
      select: { name: true },
    });
    // mutate the array and return a generated signed cloudfront urls.
    const signedImages = images.map((image) =>
      helpers.signUrl(`${process.env.CLOUDFRONT_ORIGIN}/${image.name}`)
    );
    // return the generated urls
    return res.status(200).json(signedImages);
  } catch (e) {
    return res.status(500).json({ message: "Unable to get all images" });
  }
}

async function uploadImage(req: IncomingRequest, res: Response) {
  try {
    if (!req.file?.buffer) {
      throw new Error("invalid file buffer");
    }

    const filename = generateFilename();
    // store the filename assigned to the uploaded image
    await prisma.images.create({ data: { name: filename } });

    await helpers.putS3Object(s3Client, filename, req.file?.buffer);
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

    await helpers.invalidateCDNCache(cloudfrontClient, filename);
    await helpers.deleteS3Object(s3Client, filename);
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

export default { getImages, deleteImage, uploadImage };

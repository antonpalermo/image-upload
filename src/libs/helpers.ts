import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { CloudfrontSignInput, getSignedUrl } from "@aws-sdk/cloudfront-signer";

import { Buffer } from "node:buffer";

/**
 * conver base64 encoded string content to ascii encoding
 * @param content content to conver from base64 to ascii
 * @returns ascii converted strings
 */
export const base64ToAsciiDecoder = (content: string) =>
  Buffer.from(content, "base64").toString("ascii");

async function invalidateCDNCache(client: CloudFrontClient, filename: string) {
  try {
    const invalidateCDNCache = new CreateInvalidationCommand({
      DistributionId: process.env.CLOUDFRONT_DIST_ID,
      InvalidationBatch: {
        CallerReference: filename,
        Paths: {
          Quantity: 1,
          Items: ["/" + filename],
        },
      },
    });

    await client.send(invalidateCDNCache);
  } catch (e) {
    throw new Error("Unable to invalidate cdn cache");
  }
}

function signUrl(
  url: string,
  expiration: string = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
) {
  try {
    const params: CloudfrontSignInput = {
      url,
      keyPairId: process.env.CLOUDFRONT_KEY_ID,
      privateKey: base64ToAsciiDecoder(process.env.CLOUDFRONT_PRIVATE_KEY),
      dateLessThan: expiration,
    };

    return getSignedUrl(params);
  } catch (e) {
    throw new Error("Unable to generate signed url");
  }
}

async function putS3Object(client: S3Client, filename: string, buffer: Buffer) {
  try {
    // setup s3 upload parameters
    const params: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: "image/webp",
    };

    // create a new put object command
    const putCommand = new PutObjectCommand(params);
    await client.send(putCommand);
  } catch (e) {
    throw new Error("unable to put object to s3 bucket");
  }
}

async function deleteS3Object(client: S3Client, filename: string) {
  try {
    const deleteS3Command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
    });

    await client.send(deleteS3Command);
  } catch (e) {
    throw new Error("Unable to delete s3 object");
  }
}

export default {
  signUrl,
  putS3Object,
  deleteS3Object,
  invalidateCDNCache,
};

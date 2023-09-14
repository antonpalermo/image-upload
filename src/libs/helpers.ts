import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function invalidateCDNCache(
  client: CloudFrontClient,
  filename: string
) {
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
    console.log(e)
    throw new Error("Unable to invalidate cdn cache");
  }
}

export async function deleteS3Object(client: S3Client, filename: string) {
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

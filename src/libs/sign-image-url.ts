import { base64ToAsciiDecoder } from "./parser";
import { CloudfrontSignInput, getSignedUrl } from "@aws-sdk/cloudfront-signer";

export default function signedImageUrl(
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

import { Buffer } from "node:buffer";

/**
 * conver base64 encoded string content to ascii encoding
 * @param content content to conver from base64 to ascii
 * @returns ascii converted strings
 */
export const base64ToAsciiDecoder = (content: string) =>
  Buffer.from(content, "base64").toString("ascii");

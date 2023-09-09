import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

import sharp from "sharp";

export default async function processImageBuffer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) {
      throw new Error("req.file is not available");
    }

    const processedImage = await sharp(req.file?.buffer)
      .resize({
        width: 1920,
        height: 1080,
        fit: "contain",
      })
      .toFormat("webp")
      .toBuffer({
        resolveWithObject: true,
      });

    req.file = {
      ...req.file,
      mimetype: "image/webp",
      buffer: processedImage.data,
      size: processedImage.info.size,
    };
  } catch (e) {
    if (e instanceof MulterError) {
      return res
        .status(500)
        .json({ message: "Multer error, unable to process uploaded image" });
    }
    return res.status(500).json({
      message: "unable to process image",
    });
  }

  next();
}

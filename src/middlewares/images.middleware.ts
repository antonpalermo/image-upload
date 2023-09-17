import { MulterError } from "multer";
import { NextFunction, Request, Response } from "express";
import { validateBufferMIMEType } from "validate-image-type";

import sharp from "sharp";
import prisma from "../libs/prisma";
interface IncomingRequest extends Omit<Request, "params"> {
  params: {
    filename: string;
  };
}

async function checkImageBuffer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.file) {
    const isValid = await validateBufferMIMEType(req.file?.buffer, {
      originalFilename: req.file.originalname,
      allowMimeTypes: ["image/png", "image/jpeg"],
    });

    if (!isValid.ok) {
      return res
        .status(400)
        .json({ message: "uploaded file is not a valid image" });
    }
  } else {
    return res
      .status(400)
      .json({ message: "no file uploaded, please upload a file." });
  }

  next();
}

async function resizeImage(
  req: IncomingRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.file) {
    throw new Error("req.file is not available");
  }

  try {
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

async function isFilenameExist(
  req: IncomingRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.params.filename) {
      return res.status(400).json({ message: "filename is required!" });
    }

    const file = await prisma.images.findUnique({
      where: { name: req.params.filename },
    });

    if (!file) {
      return res
        .status(404)
        .json({ message: `${req.params.filename} does not exist` });
    }

    return next();
  } catch (e) {
    return next(e);
  }
}

export default { resizeImage, checkImageBuffer, isFilenameExist };

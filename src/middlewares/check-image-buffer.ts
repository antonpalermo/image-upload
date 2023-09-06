import { NextFunction, Request, Response } from "express";
import { validateBufferMIMEType } from "validate-image-type";

export default async function checkImageBuffer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.file) {
    console.log("sample", req.file);
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

import { NextFunction, Request, Response } from "express";

import sharp from "sharp";

export default async function processImageBuffer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  

  next();
}

import { NextFunction, Request, Response } from "express";
import prisma from "../libs/prisma";

interface IncomingRequest extends Omit<Request, "params"> {
  params: {
    filename: string;
  };
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

export default { isFilenameExist };

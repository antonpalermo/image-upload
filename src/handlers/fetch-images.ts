import { Request, Response } from "express";

import prisma from "../libs/prisma";
import getSignedUrl from "../libs/sign-image-url";

export async function fetchImages(_: Request, res: Response) {
  try {
    // query all images.
    const images = await prisma.images.findMany({
      select: { name: true },
    });
    // mutate the array and return a generated signed cloudfront urls.
    const signedImages = images.map((image) =>
      getSignedUrl(`${process.env.CLOUDFRONT_ORIGIN}/${image.name}`)
    );
    // return the generated urls
    return res.status(200).json(signedImages);
  } catch (e) {
    return res.status(500).json({ message: "Unable to get all images" });
  }
}

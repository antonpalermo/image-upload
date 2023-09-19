import multer from "multer";
import express, { Router } from "express";

import handler from "../handlers/images.handler";
import middleware from "../middlewares/images.middleware";

const router: Router = express.Router();

router.use(multer().single("image"));

router
  .get("/:storeId/images", handler.getImages)
  .get(
    "/:storeId/images/:filename",
    middleware.isFilenameExist,
    handler.getImage
  );

router.delete(
  "/:storeId/image/:filename",
  middleware.isFilenameExist,
  handler.deleteImage
);

router.post(
  "/:storeId/upload",
  middleware.checkImageBuffer,
  middleware.resizeImage,
  handler.uploadImage
);

export default router;

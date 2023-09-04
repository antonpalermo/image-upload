import express, { Request, Response, Router } from "express";
import multer from "multer";

const router: Router = express.Router();

const upload = multer();

router.post(
  "/:storeId/upload",
  upload.single("image"),
  (req: Request, res: Response) => {

    console.log(req.file)

    return res.status(201).json({ message: "okay" });
  }
);

export default router;

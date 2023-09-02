import express, { Request, Response, Router } from "express";

const router: Router = express.Router();

router.post("/:storeId/upload", (req: Request, res: Response) => {
  const storeId = req.query.storeId;

  return res.status(201).json({ message: `Image uploaded successfully on ${storeId}` });
});

export default router;

import Busboy from "busboy";
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();

router.post("/:storeId/upload", (req: Request, res: Response) => {
  const busboy = Busboy({ headers: req.headers });

  busboy.on("file", (name, file, info) => {
    console.log("sample", name, file, info);

    file.on("data", (chunk) => {
      console.log("chunk", chunk);
    });

    file.on("close", () => {
      console.log(`file ${name} done`);
    });
  });

  busboy.on('close', () => {
    console.log('done parsing form')
  })

  req.pipe(busboy)

  return res.status(201).json({ message: "okay" });
});

export default router;

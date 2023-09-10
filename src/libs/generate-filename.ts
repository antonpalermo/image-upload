import { customAlphabet } from "nanoid";

export const generateFilename = (lenght: number = 25) =>
  customAlphabet(process.env.NANO_ID, lenght);

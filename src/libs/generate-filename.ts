import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(process.env.NANO_ID, 25);

export const generateFilename = nanoid();

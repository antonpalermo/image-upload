import { customAlphabet } from "nanoid";

export const generateId: string = customAlphabet(
  process.env.NANO_ID,
  20
).toString();

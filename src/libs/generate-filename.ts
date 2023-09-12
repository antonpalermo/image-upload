import { customAlphabet } from "nanoid";

export const generateFilename = (lenght: number = 25): string => {
  const nanoId = customAlphabet(process.env.NANO_ID, lenght);
  return nanoId();
};

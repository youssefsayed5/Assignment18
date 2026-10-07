import bcrypt from "bcrypt";
import { env } from "../../config/env.service.js";



export const hashWord = async (word: string) => {
    const hashedWord = await bcrypt.hash(String(word), Number(env.salt));
    return hashedWord;
}

export const compareWord = async (word: string, hashedWord: string) => {
    const isMatch = await bcrypt.compare(String(word), hashedWord);
    return isMatch;
}






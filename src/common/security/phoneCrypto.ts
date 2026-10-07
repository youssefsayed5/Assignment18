import crypto from "crypto";
import { env } from "../../config/env.service.js";

const ENCRYPTED_PHONE_PREFIX = "enc:v1:";

function getPhoneEncryptionKey() {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET must be configured to encrypt phone numbers");
  }

  return crypto
    .createHash("sha256")
    .update("wave:phone-number:v1:")
    .update(env.jwtSecret)
    .digest();
}

export async function encryptPhoneNumber(phoneNumber: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getPhoneEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(phoneNumber, "utf8"),
    cipher.final(),
  ]);

  return [
    "enc",
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export async function decryptPhoneNumber(storedPhoneNumber: string) {
  if (!storedPhoneNumber.startsWith(ENCRYPTED_PHONE_PREFIX)) {
    return storedPhoneNumber;
  }

  const [marker, version, encodedIv, encodedTag, encodedValue] =
    storedPhoneNumber.split(":");
  if (
    marker !== "enc" ||
    version !== "v1" ||
    !encodedIv ||
    !encodedTag ||
    !encodedValue
  ) {
    throw new Error("Stored phone number has an invalid encrypted format");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getPhoneEncryptionKey(),
    Buffer.from(encodedIv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encodedValue, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

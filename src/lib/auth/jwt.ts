import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export function signAccessToken(payload: object) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "1h" });
}

export function singRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET);
}

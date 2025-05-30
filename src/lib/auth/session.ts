import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";

export async function getSession() {
  const accessToken = (await cookies()).get("accessToken")?.value;

  if (!accessToken) return null;

  try {
    const payload = verifyAccessToken(accessToken);
    return payload;
  } catch {
    return null;
  }
}

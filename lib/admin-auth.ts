import { cookies } from "next/headers";
import { getAdminSessionCookieName, verifyAdminSessionToken } from "./admin-session";

export async function isAdminSessionValid(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(getAdminSessionCookieName())?.value;
  return verifyAdminSessionToken(token);
}

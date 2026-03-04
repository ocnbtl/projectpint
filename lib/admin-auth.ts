import { cookies } from "next/headers";

export async function isAdminSessionValid(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  return Boolean(process.env.ADMIN_PASSWORD && token && token === process.env.ADMIN_PASSWORD);
}

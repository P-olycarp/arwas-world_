import "server-only";
import { redirect } from "next/navigation";
import { readSession } from "./session";

export async function requireAdmin() {
  const session = await readSession();
  if (!session) redirect("/admin/login");
  return session;
}

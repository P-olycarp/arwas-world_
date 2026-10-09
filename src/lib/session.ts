import "server-only";
import { cookies } from "next/headers";
import { COOKIE, SESSION_SECONDS, signToken, verifyToken } from "./token";

export async function createSession(userId: string, email: string) {
  const token = await signToken(userId, email);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function readSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

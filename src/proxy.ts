import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifyToken } from "@/lib/token";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const token = request.cookies.get(COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };

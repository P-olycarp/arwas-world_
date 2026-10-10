import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifyToken } from "@/lib/token";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Visitors who chose Arabic before go straight to the Arabic site.
  if (path === "/") {
    if (request.cookies.get("arwas_lang")?.value === "ar") {
      const url = request.nextUrl.clone();
      url.pathname = "/ar";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (path === "/admin/login") return NextResponse.next();
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

export const config = { matcher: ["/", "/admin/:path*"] };
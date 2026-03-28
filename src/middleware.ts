import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/api/auth"];
const ADMIN_ROUTES = ["/admin"];
const COURIER_ROUTES = ["/courier"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes and Next.js internals
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return NextResponse.next();
  if (pathname.startsWith("/api/products") || pathname.startsWith("/api/categories") || pathname.startsWith("/api/suppliers")) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.user.role;

  // Guard admin routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!["admin", "superadmin", "supplier"].includes(role)) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  // Guard courier routes
  if (COURIER_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!["courier", "admin", "superadmin"].includes(role)) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

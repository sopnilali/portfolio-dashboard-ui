
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./components/Utils/verifyToken";

type Role = keyof typeof roleBasedPrivateRoutes;

const authRoutes = ["/login"];

const roleBasedPrivateRoutes = {
  Admin: [/^\/dashboard/, /^\/profile/, /^\/register/],
  User: [ /^\/profile/],
};

const corsOrigins = [
  "http://localhost:3000",
  "https://my-portfolio-dashboard-one.vercel.app",
  "https://mdabduladud-ui.vercel.app",
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()) : []),
];

// CORS for /api so the public portfolio site can still call this backend
const handleApiCors = (request: NextRequest) => {
  const origin = request.headers.get("origin");
  const allowed = origin && corsOrigins.includes(origin);

  const response =
    request.method === "OPTIONS"
      ? new NextResponse(null, { status: 204 })
      : NextResponse.next();

  if (allowed) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.append("Vary", "Origin");
  }
  return response;
};

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return handleApiCors(request);
  }
  const accessToken = request.cookies.get("accessToken")?.value;
  let userInfo = null;

  if (accessToken) {
    try {
      userInfo = verifyToken(accessToken);
    } catch {
      // malformed cookie -> treat as logged out instead of crashing
      userInfo = null;
    }
  }

  if (!userInfo) {
    if (authRoutes.includes(pathname)) {
      return NextResponse.next();
    } else {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectPath", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const role = userInfo?.role as Role;
  const allowedRoutes = roleBasedPrivateRoutes[role];

  if (allowedRoutes && allowedRoutes.some((route) => pathname.match(route))) {
    return NextResponse.next();
  }
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set("accessToken", "", { maxAge: 0 });
  return response;
};

export const config = {
  matcher: [
    '/api/:path*',
    '/register',
    '/profile',
    '/dashboard',
    "/dashboard/:page*"
  ],
};

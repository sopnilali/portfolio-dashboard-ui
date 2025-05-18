
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./components/Utils/verifyToken";

type Role = keyof typeof roleBasedPrivateRoutes;

const authRoutes = ["/login"];

const roleBasedPrivateRoutes = {
  Admin: [/^\/dashboard/, /^\/profile/, /^\/register/],
  User: [ /^\/profile/],
};

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  let userInfo = null;

  if (accessToken) {
    userInfo = verifyToken(accessToken);
  }

  if (!userInfo) {
    if (authRoutes.includes(pathname)) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(
        new URL(
          `http://localhost:3000/login?redirectPath=${pathname}`,
          request.url
        )
      );
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
    '/register',
    '/profile',
    '/dashboard',
    "/dashboard/:page*"
  ],
};

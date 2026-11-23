import { NextResponse } from "next/server";
import { api } from "@/server/lib/handler";

export const POST = api(async ({ req }) => {
  if (!req.cookies.get("refreshToken")) {
    return NextResponse.json(
      { success: false, message: "Refresh token not found", statusCode: 401 },
      { status: 401 }
    );
  }

  const res = NextResponse.json({
    success: true,
    message: "User logged out successfully",
    statusCode: 200,
    meta: null,
    data: null,
  });
  res.cookies.set("refreshToken", "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
});

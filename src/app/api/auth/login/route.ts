import { NextResponse } from "next/server";
import { api, readBody } from "@/server/lib/handler";
import config from "@/server/lib/config";
import { AuthService } from "@/server/modules/auth.service";

export const POST = api(async ({ req }) => {
  const { body } = await readBody(req);
  const result = await AuthService.userLogin(body);

  const res = NextResponse.json({
    success: true,
    message: "User logged in successfully",
    statusCode: 200,
    meta: null,
    data: { accessToken: result.accessToken },
  });
  res.cookies.set("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.node_env === "production",
    maxAge: 24 * 60 * 60, // 1 day (seconds)
    path: "/",
  });
  return res;
});

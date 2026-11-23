import bcrypt from "bcryptjs";
import { Secret } from "jsonwebtoken";
import AppError from "../lib/AppError";
import config from "../lib/config";
import prisma from "../lib/prisma";
import { IAuthUser, TokenUtils } from "../lib/token";

const userLogin = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  const existUser = await prisma.user.findUnique({ where: { email } });
  if (!existUser) {
    throw new AppError(400, "User Not Found");
  }
  if (existUser.status === "Blocked") {
    throw new AppError(400, "User is Blocked");
  }

  const isPasswordMatch = await bcrypt.compare(password, existUser.password);
  if (!isPasswordMatch) {
    throw new AppError(400, "Password is incorrect");
  }

  const jwtUser: IAuthUser = {
    id: existUser.id,
    name: existUser.name,
    email: existUser.email,
    role: existUser.role,
  };

  const accessToken = TokenUtils.GenerateToken(jwtUser, config.jwt.access_secret as Secret, config.jwt.access_expires_in);
  const refreshToken = TokenUtils.GenerateToken(jwtUser, config.jwt.refresh_secret as Secret, config.jwt.refresh_expires_in);

  return { accessToken, refreshToken };
};

export const AuthService = { userLogin };

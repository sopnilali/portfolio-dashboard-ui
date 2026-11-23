import jwt, { Secret, SignOptions } from "jsonwebtoken";

export type IAuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const GenerateToken = (payload: IAuthUser, secret: Secret, expiresIn: unknown) =>
  jwt.sign(payload, secret, { expiresIn } as SignOptions);

const VerifyToken = (token: string, secret: Secret) => jwt.verify(token, secret);

export const TokenUtils = { GenerateToken, VerifyToken };

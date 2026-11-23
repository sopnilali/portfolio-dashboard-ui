import { NextRequest, NextResponse } from "next/server";
import { Secret } from "jsonwebtoken";
import AppError from "./AppError";
import config from "./config";
import { IAuthUser, TokenUtils } from "./token";
import { UploadedFile, validateFile } from "./upload";

export type ApiResult = {
  message: string;
  data?: unknown;
  meta?: { page: number; limit: number; total: number };
  statusCode?: number;
  success?: boolean;
};

type Ctx<P> = { req: NextRequest; params: P; user?: IAuthUser };

type Options = {
  /** If set, the route needs a valid token whose role is in this list (empty list = any logged-in user). */
  roles?: string[];
};

function sendResponse(r: ApiResult) {
  const statusCode = r.statusCode ?? 200;
  return NextResponse.json(
    {
      success: r.success ?? true,
      message: r.message,
      statusCode,
      meta: r.meta ?? null,
      data: r.data || null,
    },
    { status: statusCode }
  );
}

function authenticate(req: NextRequest, roles: string[]): IAuthUser {
  const token = req.headers.get("authorization");
  if (!token) {
    throw new AppError(401, "You are not authorized to access this resource");
  }
  let decoded: IAuthUser;
  try {
    decoded = TokenUtils.VerifyToken(token, config.jwt.access_secret as Secret) as unknown as IAuthUser;
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
  if (roles.length && !roles.includes(decoded.role)) {
    throw new AppError(403, "You do not have permission to access this resource");
  }
  return decoded;
}

function errorResponse(err: any) {
  let statusCode = 500;
  let message = "Something went wrong!";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err?.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  } else if (err?.code === "P2002") {
    statusCode = 400;
    message = `${(err.meta?.target ?? []).toString() || "Value"} already exists`;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (statusCode === 500) console.error(err);

  return NextResponse.json(
    {
      success: false,
      message,
      errorSources: [{ path: "", message }],
      stack: config.node_env === "production" ? undefined : err?.stack,
    },
    { status: statusCode }
  );
}

/** Wraps a route handler: auth check, params resolving, uniform JSON + error handling. */
export function api<P = Record<string, never>>(
  fn: (ctx: Ctx<P>) => Promise<ApiResult | Response>,
  options: Options = {}
) {
  return async (req: NextRequest, routeCtx: { params: Promise<P> }) => {
    try {
      const user = options.roles ? authenticate(req, options.roles) : undefined;
      const params = (routeCtx?.params ? await routeCtx.params : {}) as P;
      const out = await fn({ req, params, user });
      return out instanceof Response ? out : sendResponse(out);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

/**
 * Reads the request body. Supports:
 *  - multipart/form-data with a JSON string in field `data` (+ optional `file`)
 *  - multipart/form-data with plain fields
 *  - application/json
 */
export async function readBody(
  req: NextRequest,
  opts: { editor?: boolean } = {}
): Promise<{ body: any; file?: UploadedFile }> {
  const type = req.headers.get("content-type") || "";

  if (type.includes("multipart/form-data")) {
    const form = await req.formData();
    let body: any = {};
    let file: UploadedFile | undefined;

    for (const [key, value] of form.entries()) {
      if (typeof value !== "string") {
        if (key === "file" && value.size > 0) {
          file = {
            originalname: value.name,
            mimetype: value.type,
            size: value.size,
            buffer: Buffer.from(await value.arrayBuffer()),
          };
        }
      } else if (key !== "data") {
        body[key] = value;
      }
    }

    const raw = form.get("data");
    if (typeof raw === "string" && raw.trim() !== "") {
      try {
        body = JSON.parse(raw);
      } catch {
        throw new AppError(400, "Invalid JSON in form field `data`");
      }
    }
    if (file) validateFile(file, opts.editor);
    return { body, file };
  }

  if (type.includes("application/json")) {
    try {
      return { body: await req.json() };
    } catch {
      throw new AppError(400, "Invalid JSON body");
    }
  }
  return { body: {} };
}

export function queryObject(req: NextRequest) {
  return Object.fromEntries(req.nextUrl.searchParams.entries());
}

export function pick(obj: Record<string, any>, keys: string[]) {
  const out: Record<string, any> = {};
  for (const k of keys) if (obj && Object.hasOwn(obj, k)) out[k] = obj[k];
  return out;
}

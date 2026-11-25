// services/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from 'cookies-next';
import type { RootState } from "../store";

const apiRootRaw = process.env.NEXT_PUBLIC_BASE_API;
const apiRoot =
  typeof apiRootRaw === 'string' && apiRootRaw.trim() !== ''
    ? apiRootRaw.replace(/\/$/, '')
    : '';

/** Avoid JSON.parse failures on empty bodies or backends that send the literal "undefined". */
async function parseResponseBodySafely(response: Response): Promise<unknown> {
  const text = await response.text();
  const trimmed = text.trim();
  if (!trimmed || trimmed === 'undefined') {
    return {};
  }
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return { message: trimmed.slice(0, 500), _nonJson: true };
  }
}

const baseQuery = fetchBaseQuery({
  baseUrl: apiRoot ? `${apiRoot}/api` : '/api',
  credentials: "include", 
  prepareHeaders: (headers, { getState }) => {
    const cookieToken = getCookie('accessToken') as string | undefined;
    const stateToken = (getState() as RootState).auth.token;
    const token = cookieToken || stateToken;
    if (token) {
      headers.set("authorization", `${token}`);
    }
    return headers;
  },
  responseHandler: parseResponseBodySafely,
});

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQuery,
  tagTypes: [
    "project", 
    "user",
    "skill",
    "experience",
    "blog",
    "contact",
    "menu",
    "about",
    "cors",
  ],
  endpoints: () => ({}),
});

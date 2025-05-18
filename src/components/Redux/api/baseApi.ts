// services/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from 'cookies-next';

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_BASE_API}/api`,
  credentials: "include", 
  prepareHeaders: (headers,) => {
    const token = getCookie('accessToken') as string;
    if (token) {
      headers.set("authorization", `${token}`);
    }
    return headers;
  },
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
  ],
  endpoints: () => ({}),
});

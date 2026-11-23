"use client";

import React, { useEffect, useState } from "react";

type Endpoint = { method: string; path: string; auth: string; note?: string };
type Group = { title: string; endpoints: Endpoint[] };

const groups: Group[] = [
  {
    title: "Auth",
    endpoints: [
      { method: "POST", path: "/api/auth/login", auth: "Public", note: "{ email, password }" },
      { method: "POST", path: "/api/auth/logout", auth: "Public", note: "needs refreshToken cookie" },
    ],
  },
  {
    title: "User",
    endpoints: [
      { method: "POST", path: "/api/user", auth: "Public", note: "form-data: data (JSON), file" },
      { method: "GET", path: "/api/user", auth: "Admin", note: "?searchTerm&role&status&page&limit" },
      { method: "GET", path: "/api/user/:id", auth: "Admin, User" },
      { method: "PATCH", path: "/api/user/:id", auth: "Admin, User", note: "form-data: data (JSON), file" },
      { method: "DELETE", path: "/api/user/:id", auth: "Admin" },
      { method: "DELETE", path: "/api/user/soft/:id", auth: "Admin" },
    ],
  },
  {
    title: "Project",
    endpoints: [
      { method: "GET", path: "/api/project", auth: "Public" },
      { method: "GET", path: "/api/project/:id", auth: "Public" },
      { method: "POST", path: "/api/project", auth: "Admin", note: "form-data: data (JSON), file" },
      { method: "PATCH", path: "/api/project/:id", auth: "Admin", note: "form-data: data (JSON), file" },
      { method: "DELETE", path: "/api/project/:id", auth: "Admin" },
    ],
  },
  {
    title: "Skill",
    endpoints: [
      { method: "GET", path: "/api/skill", auth: "Public" },
      { method: "GET", path: "/api/skill/:id", auth: "Public" },
      { method: "POST", path: "/api/skill", auth: "Admin", note: "form-data: data (JSON), file" },
      { method: "PATCH", path: "/api/skill/:id", auth: "Admin", note: "form-data: data (JSON), file" },
      { method: "DELETE", path: "/api/skill/:id", auth: "Admin" },
    ],
  },
  {
    title: "Blog",
    endpoints: [
      { method: "GET", path: "/api/blog/all", auth: "Public" },
      { method: "GET", path: "/api/blog/:id", auth: "Public" },
      { method: "POST", path: "/api/blog/create", auth: "Admin", note: "form-data: data (JSON), file" },
      { method: "PATCH", path: "/api/blog/:id", auth: "Admin", note: "form-data: data (JSON), file" },
      { method: "DELETE", path: "/api/blog/:id", auth: "Admin" },
      { method: "POST", path: "/api/blog/editor-upload", auth: "Admin", note: "form-data: file" },
    ],
  },
  {
    title: "Experience",
    endpoints: [
      { method: "GET", path: "/api/experience", auth: "Public" },
      { method: "POST", path: "/api/experience", auth: "Admin" },
      { method: "PATCH", path: "/api/experience/:id", auth: "Admin" },
      { method: "DELETE", path: "/api/experience/:id", auth: "Admin" },
    ],
  },
  {
    title: "Contact",
    endpoints: [
      { method: "GET", path: "/api/contact", auth: "Public" },
      { method: "POST", path: "/api/contact", auth: "Public", note: "{ name, email, message }" },
      { method: "PUT", path: "/api/contact/:id", auth: "Admin" },
      { method: "DELETE", path: "/api/contact/:id", auth: "Admin" },
    ],
  },
  {
    title: "About",
    endpoints: [
      { method: "GET", path: "/api/about", auth: "Public" },
      { method: "POST", path: "/api/about/create", auth: "Admin", note: "form-data: data (JSON), file" },
      { method: "PATCH", path: "/api/about/:id", auth: "Admin", note: "form-data: data (JSON), file" },
    ],
  },
  {
    title: "Menu",
    endpoints: [
      { method: "GET", path: "/api/menu", auth: "Public", note: "active menus only" },
      { method: "GET", path: "/api/menu/admin", auth: "Admin", note: "all menus" },
      { method: "GET", path: "/api/menu/:id", auth: "Public" },
      { method: "POST", path: "/api/menu", auth: "Admin" },
      { method: "PATCH", path: "/api/menu/:id", auth: "Admin" },
      { method: "DELETE", path: "/api/menu/:id", auth: "Admin" },
    ],
  },
];

const methodColor: Record<string, string> = {
  GET: "bg-green-500/15 text-green-400",
  POST: "bg-blue-500/15 text-blue-400",
  PUT: "bg-amber-500/15 text-amber-400",
  PATCH: "bg-purple-500/15 text-purple-400",
  DELETE: "bg-red-500/15 text-red-400",
};

const ApiSection = () => {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">API</h2>
        <p className="text-sm text-gray-400 mt-1">
          Base URL: <span className="text-gray-200">{origin}/api</span>. Protected routes need the access token in the{" "}
          <code className="text-gray-200">Authorization</code> header.
        </p>
      </div>

      {groups.map((group) => (
        <div key={group.title} className="bg-surface-1 border border-line rounded-xl overflow-hidden">
          <h3 className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 border-b border-line">{group.title}</h3>
          <ul className="divide-y divide-line">
            {group.endpoints.map((e) => (
              <li key={e.method + e.path} className="flex flex-wrap items-center gap-3 px-4 py-2">
                <span className={`w-16 text-center text-xs font-bold rounded px-2 py-1 ${methodColor[e.method]}`}>
                  {e.method}
                </span>
                <button
                  type="button"
                  onClick={() => copy(`${origin}${e.path}`)}
                  className="font-mono text-sm text-gray-200 hover:text-white text-left"
                  title="Copy full URL"
                >
                  {e.path}
                </button>
                {copied === `${origin}${e.path}` && <span className="text-xs text-green-400">Copied</span>}
                <span className="ml-auto text-xs text-gray-400">{e.auth}</span>
                {e.note && <span className="w-full text-xs text-gray-500 sm:w-auto sm:basis-full">{e.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ApiSection;

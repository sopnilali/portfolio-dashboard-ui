"use client";

import React, { useEffect, useState } from "react";
import { MdAdd, MdDelete, MdLanguage, MdLock } from "react-icons/md";
import { toast } from "sonner";
import {
  useAddCorsOriginMutation,
  useDeleteCorsOriginMutation,
  useGetCorsOriginsQuery,
} from "@/components/Redux/features/cors/corsApi";
import { getRtkQueryErrorMessage } from "@/components/Utils/getRtkQueryErrorMessage";
import ConfirmDialog from "@/components/Modals/ConfirmDialog";
import LoadingSpinner from "@/components/Shared/LoadingSpinner";

type AllowedOrigin = {
  id: string;
  origin: string;
  note: string | null;
  source: "database" | "env";
  createdAt: string | null;
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";

const field =
  "h-9 rounded-lg border border-line bg-surface-0 px-3 text-[13px] text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent/60";

const AllowedWebsites = () => {
  const { data, isLoading } = useGetCorsOriginsQuery(undefined);
  const [addOrigin, { isLoading: isAdding }] = useAddCorsOriginMutation();
  const [deleteOrigin] = useDeleteCorsOriginMutation();

  const [origin, setOrigin] = useState("");
  const [note, setNote] = useState("");
  const [toRemove, setToRemove] = useState<AllowedOrigin | null>(null);
  const [selfOrigin, setSelfOrigin] = useState("");

  useEffect(() => {
    setSelfOrigin(window.location.origin);
  }, []);

  const list: AllowedOrigin[] = Array.isArray(data?.data) ? data.data : [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim()) return;
    const toastId = toast.loading("Allowing website...");
    try {
      await addOrigin({ origin: origin.trim(), note: note.trim() || undefined }).unwrap();
      toast.success("Website allowed", { id: toastId });
      setOrigin("");
      setNote("");
    } catch (error: unknown) {
      toast.error(getRtkQueryErrorMessage(error, "Could not add website"), { id: toastId });
    }
  };

  const handleRemove = async () => {
    if (!toRemove) return;
    const target = toRemove;
    setToRemove(null);
    const toastId = toast.loading("Removing website...");
    try {
      await deleteOrigin(target.id).unwrap();
      toast.success("Website removed", { id: toastId });
    } catch (error: unknown) {
      toast.error(getRtkQueryErrorMessage(error, "Could not remove website"), { id: toastId });
    }
  };

  return (
    <section className="bg-surface-1 border border-line rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          Allowed websites (CORS)
        </h3>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] tabular-nums text-gray-400 ring-1 ring-line">
          {list.length}
        </span>
      </div>

      <p className="px-4 pt-3 text-[12px] leading-relaxed text-gray-500">
        Only these websites can call this API from a browser. Add the exact address of your frontend, like{" "}
        <span className="font-mono text-gray-400">https://yoursite.com</span> (no path, no trailing slash). Changes apply
        within about 30 seconds.
      </p>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 px-4 py-3">
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="https://yoursite.com"
          aria-label="Website address"
          required
          className={`${field} min-w-56 flex-2 font-mono`}
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          aria-label="Note"
          maxLength={120}
          className={`${field} min-w-40 flex-1`}
        />
        <button
          type="submit"
          disabled={isAdding}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-violet-600 px-4 text-[13px] font-medium text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500 disabled:opacity-50"
        >
          <MdAdd className="h-4 w-4" /> Allow
        </button>
      </form>

      <ul className="divide-y divide-line border-t border-line">
        {/* This dashboard: same-origin, always allowed */}
        <li className="flex flex-wrap items-center gap-3 px-4 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
            <MdLock className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[13px] text-gray-200">{selfOrigin || "This dashboard"}</p>
            <p className="text-[11px] text-gray-600">This dashboard — always allowed</p>
          </div>
        </li>

        {isLoading ? (
          <li className="flex justify-center py-6 text-gray-400">
            <LoadingSpinner />
          </li>
        ) : list.length === 0 ? (
          <li className="px-4 py-6 text-center text-[12px] text-gray-500">
            No other website is allowed yet. Add your frontend above.
          </li>
        ) : (
          list.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20">
                <MdLanguage className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[13px] text-gray-100" title={item.origin}>
                  {item.origin}
                </p>
                <p className="truncate text-[11px] text-gray-600">
                  {item.note || "No note"}
                  {item.createdAt && ` · Added ${formatDate(item.createdAt)}`}
                </p>
              </div>
              {item.source === "env" ? (
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-gray-500 ring-1 ring-line">
                  From env
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setToRemove(item)}
                  title="Remove"
                  aria-label={`Remove ${item.origin}`}
                  className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/8 hover:text-rose-300"
                >
                  <MdDelete className="h-4 w-4" />
                </button>
              )}
            </li>
          ))
        )}
      </ul>

      <ConfirmDialog
        isOpen={Boolean(toRemove)}
        title="Remove this website?"
        description={`${toRemove?.origin ?? ""} will no longer be able to call this API from a browser.`}
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onClose={() => setToRemove(null)}
      />
    </section>
  );
};

export default AllowedWebsites;

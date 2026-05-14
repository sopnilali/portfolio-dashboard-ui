/**
 * Readable message from RTK Query `.unwrap()` rejections, SerializedError, or string `data`.
 */
export function getRtkQueryErrorMessage(error: unknown, fallback: string): string {
  if (error == null || typeof error !== 'object') {
    return fallback
  }

  const e = error as Record<string, unknown>
  const data = e.data

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (data != null && typeof data === 'object' && 'message' in data) {
    const msg = (data as { message: unknown }).message
    if (typeof msg === 'string' && msg.trim()) return msg
    if (msg != null && msg !== '') return String(msg)
  }

  if (typeof e.error === 'string' && e.error.trim()) {
    return e.error
  }

  if (typeof e.message === 'string' && e.message.trim()) {
    return e.message
  }

  return fallback
}

import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  RotateCcw,
  Maximize2,
  Scaling,
  PanelBottom,
  PanelRight,
  Grid3x3,
} from 'lucide-react'

const MIN_SIDE = 40
const MAX_SIDE = 4000

/** Corner / edge IDs for proportional resize */
type ResizeHandle =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/**
 * Sizes from cursor + initial image bounding rect + handle.
 * Coordinates relative to viewport; rect is frozen at pointerdown.
 */
function sizeFromHandle(
  handle: ResizeHandle,
  rect: DOMRect,
  clientX: number,
  clientY: number,
  ratio: number,
  shiftKey: boolean,
): { width: number; height: number } {
  let w = rect.width
  let h = rect.height

  switch (handle) {
    case 'se':
      w = clientX - rect.left
      h = clientY - rect.top
      break
    case 'nw':
      w = rect.right - clientX
      h = rect.bottom - clientY
      break
    case 'ne':
      w = clientX - rect.left
      h = rect.bottom - clientY
      break
    case 'sw':
      w = rect.right - clientX
      h = clientY - rect.top
      break
    case 'e':
      w = clientX - rect.left
      h = rect.height
      break
    case 'w':
      w = rect.right - clientX
      h = rect.height
      break
    case 's':
      w = rect.width
      h = clientY - rect.top
      break
    case 'n':
      w = rect.width
      h = rect.bottom - clientY
      break
    default:
      break
  }

  w = clamp(Math.round(w), MIN_SIDE, MAX_SIDE)
  h = clamp(Math.round(h), MIN_SIDE, MAX_SIDE)

  if (shiftKey && ratio > 0) {
    if (handle === 'e' || handle === 'w') {
      h = clamp(Math.round(w * ratio), MIN_SIDE, MAX_SIDE)
    } else if (handle === 'n' || handle === 's') {
      w = clamp(Math.round(h / ratio), MIN_SIDE, MAX_SIDE)
    } else {
      const wd = w
      const hd = Math.round(wd * ratio)
      const he = h
      const we = Math.round(he / ratio)
      if (Math.abs(hd - h) < Math.abs(we - w)) {
        h = clamp(hd, MIN_SIDE, MAX_SIDE)
        w = clamp(Math.round(h / ratio), MIN_SIDE, MAX_SIDE)
      } else {
        w = clamp(we, MIN_SIDE, MAX_SIDE)
        h = clamp(Math.round(w * ratio), MIN_SIDE, MAX_SIDE)
      }
    }
  }

  return { width: w, height: h }
}

const HANDLE_CURSOR: Record<ResizeHandle, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
}

const ResizableImageComponent = (props: NodeViewProps) => {
  const imageRef = useRef<HTMLImageElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [proseWidth, setProseWidth] = useState(720)
  const dragRef = useRef<{
    handle: ResizeHandle
    rect: DOMRect
    ratio: number
  } | null>(null)
  const naturalRef = useRef({ w: 0, h: 0 })

  const { node, updateAttributes, selected } = props

  const attrs = node.attrs as {
    src: string
    alt: string
    width: number | null
    height: number | null
    textAlign: 'left' | 'center' | 'right'
  }

  const getAlignmentClass = (align: string | undefined) => {
    switch (align) {
      case 'center':
        return 'flex justify-center'
      case 'right':
        return 'flex justify-end'
      default:
        return 'flex justify-start'
    }
  }

  useEffect(() => {
    const root = frameRef.current?.closest('.ProseMirror')
    if (!root) return

    const ro = new ResizeObserver(() => {
      setProseWidth(root.getBoundingClientRect().width)
    })
    ro.observe(root)
    setProseWidth(root.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const startDrag = useCallback(
    (handle: ResizeHandle) => (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const img = imageRef.current
      if (!img) return

      const rect = img.getBoundingClientRect()
      const w = attrs.width ?? rect.width
      const h = attrs.height ?? rect.height
      const ratio = w > 0 ? h / w : 1

      dragRef.current = { handle, rect, ratio }
      setIsResizing(true)

      const onMove = (ev: PointerEvent) => {
        const session = dragRef.current
        if (!session || !imageRef.current) return
        const { width, height } = sizeFromHandle(
          session.handle,
          session.rect,
          ev.clientX,
          ev.clientY,
          session.ratio,
          ev.shiftKey,
        )
        updateAttributes({ width, height })
      }

      const onUp = () => {
        dragRef.current = null
        setIsResizing(false)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [attrs.height, attrs.width, updateAttributes],
  )

  const applyWidthPercent = (pct: number) => {
    const img = imageRef.current
    const rw = proseWidth > 48 ? proseWidth - 32 : proseWidth
    const w = clamp(Math.round((rw * pct) / 100), MIN_SIDE, MAX_SIDE)
    const ratio =
      attrs.width && attrs.height && attrs.width > 0
        ? attrs.height / attrs.width
        : img && img.naturalWidth > 0
          ? img.naturalHeight / img.naturalWidth
          : 0.5625
    updateAttributes({
      width: w,
      height: Math.max(MIN_SIDE, Math.round(w * ratio)),
    })
  }

  const resetToNatural = () => {
    const { w, h } = naturalRef.current
    if (w > 0 && h > 0) {
      updateAttributes({
        width: clamp(w, MIN_SIDE, MAX_SIDE),
        height: clamp(h, MIN_SIDE, MAX_SIDE),
      })
    }
  }

  const setWidthPx = (raw: string) => {
    const n = Number.parseInt(raw, 10)
    if (!Number.isFinite(n) || n < MIN_SIDE) return
    const img = imageRef.current
    const ratio =
      attrs.width && attrs.height && attrs.width > 0
        ? attrs.height / attrs.width
        : img && img.naturalWidth > 0
          ? img.naturalHeight / img.naturalWidth
          : 0.5625
    const w = clamp(n, MIN_SIDE, MAX_SIDE)
    updateAttributes({ width: w, height: Math.max(MIN_SIDE, Math.round(w * ratio)) })
  }

  /** Touch targets slightly larger than visual hit area */
  const handleCls = (extra: string) =>
    `-m-2 p-2 ${extra}`

  const showChrome = selected || isResizing

  return (
    <NodeViewWrapper className="react-component-with-content">
      <div
        className={[
          'relative my-6 w-full',
          getAlignmentClass(attrs.textAlign),
        ].join(' ')}
      >
        <div
          ref={frameRef}
          className={[
            'relative inline-block max-w-full align-middle',
            selected ? 'ring-2 ring-violet-500 ring-offset-2 rounded-xl' : '',
          ].join(' ')}
          contentEditable={false}
        >
          {showChrome && (
            <div
              className="pointer-events-none absolute -top-11 left-1/2 z-30 flex max-w-[min(100vw-2rem,22rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-xl border border-zinc-200/90 bg-white/95 px-1.5 py-1 shadow-lg shadow-zinc-950/10 backdrop-blur-sm"
              contentEditable={false}
            >
              <span className="hidden items-center gap-0.5 pr-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 sm:inline-flex">
                <Scaling className="h-3 w-3" />
                Resize
              </span>
              <button
                type="button"
                tabIndex={-1}
                className="pointer-events-auto shrink-0 rounded-md border border-transparent bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-violet-100 hover:text-violet-900"
                title="Fit content width (~100%)"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyWidthPercent(100)}
              >
                <span className="inline-flex items-center gap-1">
                  <Maximize2 className="h-3 w-3 opacity-70" /> 100%
                </span>
              </button>
              <button
                type="button"
                tabIndex={-1}
                className="pointer-events-auto shrink-0 rounded-md border border-transparent bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-violet-100 hover:text-violet-900"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyWidthPercent(75)}
              >
                75%
              </button>
              <button
                type="button"
                tabIndex={-1}
                className="pointer-events-auto shrink-0 rounded-md border border-transparent bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-violet-100 hover:text-violet-900"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyWidthPercent(50)}
              >
                50%
              </button>
              <button
                type="button"
                tabIndex={-1}
                className="pointer-events-auto shrink-0 rounded-md border border-transparent bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-violet-100 hover:text-violet-900"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyWidthPercent(33)}
              >
                33%
              </button>
              <span className="pointer-events-auto flex items-center gap-0.5 border-l border-zinc-200 pl-1.5">
                <PanelRight className="h-3 w-3 text-zinc-400" />
                <input
                  type="number"
                  min={MIN_SIDE}
                  max={MAX_SIDE}
                  defaultValue={attrs.width ?? ''}
                  key={`${attrs.width}-${attrs.height}`}
                  className="w-14 rounded border border-zinc-200 bg-white px-1 py-0.5 text-center text-[11px] font-mono text-zinc-800"
                  title="Width (px)"
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      setWidthPx((e.target as HTMLInputElement).value)
                      ;(e.target as HTMLInputElement).blur()
                    }
                  }}
                  onBlur={(e) => setWidthPx(e.target.value)}
                />
                <span className="text-[10px] text-zinc-400">px</span>
              </span>
              <button
                type="button"
                tabIndex={-1}
                className="pointer-events-auto shrink-0 rounded-md border border-transparent p-1.5 text-zinc-600 hover:bg-amber-50 hover:text-amber-900"
                title="Original image size"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => resetToNatural()}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <span
                className="hidden items-center gap-0.5 border-l border-zinc-200 pl-1 text-[10px] text-zinc-400 xl:inline-flex"
                title="Hold Shift while dragging handles to lock aspect ratio"
              >
                <Grid3x3 className="h-3 w-3 flex-shrink-0" />
                Shift = ratio
              </span>
            </div>
          )}

          <div className="relative inline-flex max-w-full flex-col overflow-visible rounded-xl">
            <img
              ref={imageRef}
              src={attrs.src || ''}
              alt={attrs.alt || ''}
              draggable={false}
              className={[
                'max-w-full rounded-xl object-contain select-none',
                isResizing ? 'brightness-[0.98] ring-2 ring-violet-400/70' : 'shadow-md',
              ].join(' ')}
              style={{
                width: attrs.width ?? undefined,
                height: attrs.height ?? undefined,
                maxWidth: '100%',
              }}
              onLoad={(e) => {
                const img = e.currentTarget
                naturalRef.current = {
                  w: img.naturalWidth,
                  h: img.naturalHeight,
                }
                if (!attrs.width && !attrs.height) {
                  updateAttributes({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                  })
                }
              }}
            />

            {/* Drag overlay — capture pointer during resize */}
            {isResizing && (
              <div className="fixed inset-0 z-[50] cursor-inherit bg-transparent" />
            )}

            {showChrome && (
              <>
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-violet-500/40 ring-inset" />

                {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as ResizeHandle[]).map(
                  (handle) => {
                    const pos =
                      handle === 'nw'
                        ? 'left-0 top-0 -translate-x-1/2 -translate-y-1/2'
                        : handle === 'n'
                          ? 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2'
                          : handle === 'ne'
                            ? 'right-0 top-0 translate-x-1/2 -translate-y-1/2'
                            : handle === 'e'
                              ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2'
                              : handle === 'se'
                                ? 'right-0 bottom-0 translate-x-1/2 translate-y-1/2'
                                : handle === 's'
                                  ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2'
                                  : handle === 'sw'
                                    ? 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2'
                                    : 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2'

                    return (
                      <button
                        key={handle}
                        type="button"
                        aria-label={`Resize ${handle}`}
                        className={`${handleCls('absolute z-40')} ${pos}`}
                        style={{ cursor: HANDLE_CURSOR[handle], touchAction: 'none' }}
                        onMouseDown={(e) => e.preventDefault()}
                        onPointerDown={startDrag(handle)}
                      >
                        <span className="block h-2.5 w-2.5 rounded-sm border-2 border-violet-600 bg-white shadow-md transition hover:bg-violet-100 hover:scale-110 active:scale-95" />
                      </button>
                    )
                  },
                )}

                <div className="pointer-events-none absolute -bottom-6 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900/90 px-2 py-0.5 text-[10px] font-mono text-zinc-100 shadow-md">
                  <PanelBottom className="mr-1 inline h-3 w-3 opacity-70" />
                  {attrs.width ?? '—'} × {attrs.height ?? '—'}
                  {isResizing && (
                    <span className="ml-2 text-violet-300"> · drag</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export const ResizableImage = Node.create({
  name: 'resizableImage',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      textAlign: {
        default: 'left',
        renderHTML: (attributes) => ({
          style: `text-align: ${attributes.textAlign}`,
        }),
        parseHTML: (element) => element.style.textAlign || 'left',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return {}

          return {
            src: dom.getAttribute('src'),
            alt: dom.getAttribute('alt'),
            width: dom.getAttribute('width'),
            height: dom.getAttribute('height'),
            textAlign: dom.style.textAlign || 'left',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },
})

export default ResizableImage

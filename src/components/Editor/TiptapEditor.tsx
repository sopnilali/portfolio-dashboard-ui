'use client'

import {
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import FontFamily from '@tiptap/extension-font-family'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Typography from '@tiptap/extension-typography'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import ResizableImage from './ResizableImage'
import { toast } from 'sonner'
import { getRtkQueryErrorMessage } from '@/components/Utils/getRtkQueryErrorMessage'
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaUndo,
  FaRedo,
  FaQuoteLeft,
  FaCode,
  FaTable,
  FaHighlighter,
  FaListOl,
  FaStrikethrough,
  FaSuperscript,
  FaSubscript,
} from 'react-icons/fa'
import { IoColorPalette, IoColorFill } from 'react-icons/io5'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImagePlus,
  Heading2,
  ListTodo,
  List as ListIcon,
  SeparatorHorizontal,
  Sigma,
} from 'lucide-react'
import { useEditorUploadMutation } from '../Redux/features/blog/blogApi'
import { motion, AnimatePresence } from 'framer-motion'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  onImageUpload?: (file: File) => Promise<string>
  placeholder?: string
}

const COLORS = {
  text: [
    { name: 'Default', color: '#000000' },
    { name: 'Gray', color: '#4B5563' },
    { name: 'Red', color: '#DC2626' },
    { name: 'Orange', color: '#EA580C' },
    { name: 'Green', color: '#059669' },
    { name: 'Blue', color: '#2563EB' },
    { name: 'Purple', color: '#7C3AED' },
    { name: 'Pink', color: '#DB2777' },
  ],
  background: [
    { name: 'Default', color: '#FFFFFF' },
    { name: 'Light Gray', color: '#F3F4F6' },
    { name: 'Light Red', color: '#FEE2E2' },
    { name: 'Light Orange', color: '#FFEDD5' },
    { name: 'Light Green', color: '#DCFCE7' },
    { name: 'Light Blue', color: '#DBEAFE' },
    { name: 'Light Purple', color: '#F3E8FF' },
    { name: 'Light Pink', color: '#FCE7F3' },
  ],
}

function toolbarBtnClass(active: boolean, extra = '') {
  return [
    'flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-medium transition-colors select-none',
    active
      ? 'border-violet-500/50 bg-violet-500/15 text-violet-900 shadow-sm'
      : 'border-transparent bg-white/80 text-zinc-600 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900',
    extra,
  ].join(' ')
}

const ColorPicker = ({
  anchorRef,
  colors,
  activeColor,
  onChange,
  isOpen,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLElement | null>
  colors: typeof COLORS.text
  activeColor?: string
  onChange: (color: string) => void
  isOpen: boolean
  onClose: () => void
}) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const updatePos = useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const panelW = 224
    const panelH = 140
    let left = r.left
    if (left + panelW > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - panelW - 8)
    }
    let top = r.bottom + 6
    if (top + panelH > window.innerHeight - 8) {
      top = Math.max(8, r.top - panelH - 6)
    }
    setPos({ top, left })
  }, [anchorRef])

  useLayoutEffect(() => {
    if (!isOpen) return
    updatePos()
    window.addEventListener('resize', updatePos)
    window.addEventListener('scroll', updatePos, true)
    return () => {
      window.removeEventListener('resize', updatePos)
      window.removeEventListener('scroll', updatePos, true)
    }
  }, [isOpen, updatePos])

  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (anchorRef.current?.contains(t)) return
      if (panelRef.current?.contains(t)) return
      onClose()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [isOpen, onClose, anchorRef])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={panelRef}
      className="fixed z-[300] w-48 rounded-xl border border-zinc-200 bg-white p-2 shadow-2xl shadow-zinc-950/25 sm:w-56"
      style={{ top: pos.top, left: pos.left }}
      role="listbox"
    >
      <div className="grid grid-cols-5 gap-2">
        {colors.map(({ name, color }) => (
          <button
            key={color}
            type="button"
            onClick={() => {
              onChange(color)
              onClose()
            }}
            className="group relative rounded-lg p-1 hover:bg-zinc-50"
            title={name}
          >
            <div
              className={`mx-auto h-6 w-6 rounded-full border shadow-inner ${
                color === activeColor ? 'ring-2 ring-violet-500 ring-offset-2' : 'border-zinc-200'
              }`}
              style={{ backgroundColor: color }}
            />
          </button>
        ))}
      </div>
    </div>,
    document.body,
  )
}

const ToolbarGroup = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className="flex flex-wrap items-center gap-1">
    <span className="hidden pr-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 md:inline">
      {label}
    </span>
    {children}
  </div>
)

const TiptapEditor = ({
  content,
  onChange,
  onImageUpload,
  placeholder = 'Tell your story — use the toolbar to format and insert blocks.',
}: TiptapEditorProps) => {
  const [editorUpload] = useEditorUploadMutation()
  const [, setCountTick] = useState(0)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [activeTextColor, setActiveTextColor] = useState('#000000')
  const [activeBgColor, setActiveBgColor] = useState('#FFFFFF')
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkInputValue, setLinkInputValue] = useState('')
  const textColorAnchorRef = useRef<HTMLButtonElement>(null)
  const bgColorAnchorRef = useRef<HTMLButtonElement>(null)

  const bumpCounts = useCallback(() => setCountTick((t) => t + 1), [])

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Typography,
      CharacterCount.configure({ limit: null }),
      ResizableImage.configure({
        HTMLAttributes: { class: 'rounded-xl mx-auto' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-violet-600 underline decoration-violet-400/70 underline-offset-2' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'resizableImage'],
        alignments: ['left', 'center', 'right'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'border-collapse table-auto w-full' },
      }),
      TableRow,
      TableCell,
      TableHeader,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      FontFamily.configure({ types: ['textStyle'] }),
      Placeholder.configure({ placeholder }),
    ],
    [placeholder],
  )

  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-zinc max-w-none min-h-[240px] px-4 py-6 sm:px-6 md:min-h-[320px] focus:outline-none',
      },
    },
    onTransaction: bumpCounts,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      onChange(html)
      bumpCounts()
    },
  })

  if (!editor) return null

  const words = editor.storage.characterCount.words()
  const characters = editor.storage.characterCount.characters()

  const addImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      if (!input.files?.length) return
      try {
        const file = input.files[0]
        let imageUrl: string

        if (onImageUpload) {
          imageUrl = await onImageUpload(file)
        } else {
          const formData = new FormData()
          formData.append('file', file)
          const response = await editorUpload(formData).unwrap()
          imageUrl = response.data.file.url
        }

        if (!imageUrl || imageUrl.startsWith('blob:')) {
          throw new Error('Invalid image URL received')
        }

        const img = new Image()
        img.onload = () => {
          editor
            .chain()
            .focus()
            .insertContent({
              type: 'resizableImage',
              attrs: {
                src: imageUrl,
                alt: 'Blog image',
                width: img.naturalWidth,
                height: img.naturalHeight,
              },
            })
            .run()
        }
        img.src = imageUrl
      } catch (error: unknown) {
        console.error('Image upload failed:', error)
        toast.error(getRtkQueryErrorMessage(error, 'Failed to upload image'))
      }
    }
    input.click()
  }

  const addLink = () => {
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' ',
    )

    if (!selectedText.trim()) {
      toast.error('Select text first, then add a link.')
      return
    }

    const prior = editor.getAttributes('link').href as string | undefined
    setLinkInputValue(prior ?? '')
    setShowLinkModal(true)
  }

  const handleLinkModalSubmit = () => {
    if (!linkInputValue.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      toast.success('Link removed')
      setShowLinkModal(false)
      return
    }

    const formattedUrl =
      linkInputValue.startsWith('http://') || linkInputValue.startsWith('https://')
        ? linkInputValue
        : `https://${linkInputValue}`

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: formattedUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
      })
      .run()

    toast.success('Link applied')
    setShowLinkModal(false)
    setLinkInputValue('')
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const HeadingToggle = ({ level }: { level: 1 | 2 | 3 }) => {
    const isActive = editor.isActive('heading', { level })
    return (
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
        className={toolbarBtnClass(isActive)}
        title={`Heading ${level}`}
      >
        <span className="px-0.5 text-xs font-black">H{level}</span>
      </button>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-inner">
      <AnimatePresence>
        {showLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-link-title"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl"
            >
              <h3 id="editor-link-title" className="text-lg font-semibold text-white">
                Link
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Paste a URL. Leave empty and save to remove the link.</p>
              <input
                type="url"
                placeholder="https://example.com"
                value={linkInputValue}
                onChange={(e) => setLinkInputValue(e.target.value)}
                className="mt-4 w-full rounded-xl border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                onKeyDown={(e) => e.key === 'Enter' && handleLinkModalSubmit()}
                autoFocus
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="rounded-xl border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLinkModalSubmit}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-900/40"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BubbleMenu
        editor={editor}
        tippyOptions={{
          duration: 120,
          placement: 'top',
          zIndex: 70,
          maxWidth: 'none',
        }}
        className="flex flex-wrap items-center gap-0.5 rounded-2xl border border-zinc-200/90 bg-white/95 p-1 shadow-xl shadow-zinc-950/20 backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarBtnClass(editor.isActive('bold'))}
          title="Bold"
        >
          <FaBold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarBtnClass(editor.isActive('italic'))}
          title="Italic"
        >
          <FaItalic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarBtnClass(editor.isActive('underline'))}
          title="Underline"
        >
          <FaUnderline className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={toolbarBtnClass(editor.isActive('strike'))}
          title="Strikethrough"
        >
          <FaStrikethrough className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={addLink}
          className={toolbarBtnClass(editor.isActive('link'))}
          title="Link"
        >
          <FaLink className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={toolbarBtnClass(editor.isActive('highlight'))}
          title="Highlight"
        >
          <FaHighlighter className="h-3.5 w-3.5" />
        </button>
        <span className="mx-0.5 h-6 w-px bg-zinc-200" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={toolbarBtnClass(editor.isActive('heading', { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={toolbarBtnClass(editor.isActive('heading', { level: 3 }))}
          title="Heading 3"
        >
          <span className="text-[10px] font-black tracking-tighter">H3</span>
        </button>
      </BubbleMenu>

      <div className="sticky top-0 z-30 overflow-visible border-b border-zinc-200/90 bg-gradient-to-b from-zinc-50 to-zinc-100/90 px-2 py-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 overflow-x-auto overflow-y-visible py-0.5 [scrollbar-width:thin]">
          <ToolbarGroup label="Block">
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={toolbarBtnClass(false)}
              title="Normal paragraph text"
            >
              <span className="px-1 text-xs font-bold">P</span>
            </button>
            <HeadingToggle level={1} />
            <HeadingToggle level={2} />
            <HeadingToggle level={3} />
          </ToolbarGroup>

          <div className="hidden h-8 w-px shrink-0 bg-zinc-200 sm:block" />

          <ToolbarGroup label="Style">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={toolbarBtnClass(editor.isActive('bold'))}
              title="Bold"
            >
              <FaBold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={toolbarBtnClass(editor.isActive('italic'))}
              title="Italic"
            >
              <FaItalic className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={toolbarBtnClass(editor.isActive('underline'))}
              title="Underline"
            >
              <FaUnderline className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={toolbarBtnClass(editor.isActive('highlight'))}
              title="Highlight"
            >
              <FaHighlighter className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={toolbarBtnClass(editor.isActive('strike'))}
              title="Strikethrough"
            >
              <FaStrikethrough className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={toolbarBtnClass(editor.isActive('subscript'))}
              title="Subscript"
            >
              <FaSubscript className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={toolbarBtnClass(editor.isActive('superscript'))}
              title="Superscript"
            >
              <FaSuperscript className="h-3.5 w-3.5" />
            </button>
          </ToolbarGroup>

          <div className="hidden h-8 w-px shrink-0 bg-zinc-200 sm:block" />

          <ToolbarGroup label="Lists">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={toolbarBtnClass(editor.isActive('bulletList'))}
              title="Bullet list"
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={toolbarBtnClass(editor.isActive('orderedList'))}
              title="Numbered list"
            >
              <FaListOl className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={toolbarBtnClass(editor.isActive('taskList'))}
              title="Task list"
            >
              <ListTodo className="h-4 w-4" />
            </button>
          </ToolbarGroup>

          <div className="hidden h-8 w-px shrink-0 bg-zinc-200 sm:block" />

          <ToolbarGroup label="Insert">
            <button type="button" onClick={addLink} className={toolbarBtnClass(editor.isActive('link'))} title="Link">
              <FaLink className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={addImage} className={toolbarBtnClass(false)} title="Image">
              <ImagePlus className="h-4 w-4" />
            </button>
            <button type="button" onClick={addTable} className={toolbarBtnClass(editor.isActive('table'))} title="Table">
              <FaTable className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className={toolbarBtnClass(false)}
              title="Horizontal rule"
            >
              <SeparatorHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={toolbarBtnClass(editor.isActive('blockquote'))}
              title="Blockquote"
            >
              <FaQuoteLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={toolbarBtnClass(editor.isActive('codeBlock'))}
              title="Code block"
            >
              <FaCode className="h-3.5 w-3.5" />
            </button>
          </ToolbarGroup>

          <div className="hidden h-8 w-px shrink-0 bg-zinc-200 md:block" />

          <ToolbarGroup label="Align">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={toolbarBtnClass(editor.isActive({ textAlign: 'left' }))}
              title="Align left"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={toolbarBtnClass(editor.isActive({ textAlign: 'center' }))}
              title="Align center"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={toolbarBtnClass(editor.isActive({ textAlign: 'right' }))}
              title="Align right"
            >
              <AlignRight className="h-4 w-4" />
            </button>
          </ToolbarGroup>

          <div className="hidden h-8 w-px shrink-0 bg-zinc-200 lg:block" />

          <ToolbarGroup label="History">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className={toolbarBtnClass(false, !editor.can().undo() ? 'cursor-not-allowed opacity-40' : '')}
              title="Undo"
            >
              <FaUndo className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className={toolbarBtnClass(false, !editor.can().redo() ? 'cursor-not-allowed opacity-40' : '')}
              title="Redo"
            >
              <FaRedo className="h-3.5 w-3.5" />
            </button>
          </ToolbarGroup>

          <div className="hidden h-8 w-px shrink-0 bg-zinc-200 xl:block" />

          <ToolbarGroup label="Font">
            <select
              onChange={(e) => {
                const v = e.target.value
                editor.chain().focus().setFontFamily(v).run()
              }}
              className="h-9 max-w-[140px] cursor-pointer appearance-auto rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-800 shadow-sm"
              value={editor.getAttributes('textStyle').fontFamily || 'Inter, system-ui, sans-serif'}
            >
              <option value="Inter, system-ui, sans-serif">Inter / System</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Times New Roman, Times, serif">Times New Roman</option>
              <option value="ui-monospace, monospace">Monospace</option>
            </select>

            <div className="relative z-40 flex items-center">
              <button
                ref={textColorAnchorRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowColorPicker((v) => !v)
                  setShowBgColorPicker(false)
                }}
                className={toolbarBtnClass(showColorPicker)}
                title="Text color"
              >
                <IoColorPalette className="h-4 w-4" style={{ color: activeTextColor }} />
              </button>
              <ColorPicker
                anchorRef={textColorAnchorRef}
                colors={COLORS.text}
                activeColor={activeTextColor}
                onChange={(color) => {
                  editor.chain().focus().setColor(color).run()
                  setActiveTextColor(color)
                }}
                isOpen={showColorPicker}
                onClose={() => setShowColorPicker(false)}
              />
            </div>

            <div className="relative z-40 flex items-center">
              <button
                ref={bgColorAnchorRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowBgColorPicker((v) => !v)
                  setShowColorPicker(false)
                }}
                className={toolbarBtnClass(showBgColorPicker)}
                title="Highlight color"
              >
                <IoColorFill className="h-4 w-4" style={{ color: activeBgColor }} />
              </button>
              <ColorPicker
                anchorRef={bgColorAnchorRef}
                colors={COLORS.background}
                activeColor={activeBgColor}
                onChange={(color) => {
                  editor.chain().focus().setHighlight({ color }).run()
                  setActiveBgColor(color)
                }}
                isOpen={showBgColorPicker}
                onClose={() => setShowBgColorPicker(false)}
              />
            </div>
          </ToolbarGroup>
        </div>
      </div>

      <div className="relative max-h-[min(70vh,560px)] min-h-[240px] overflow-y-auto bg-white md:max-h-[min(75vh,640px)]">
        <EditorContent editor={editor} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200/90 bg-zinc-50 px-4 py-2 text-[11px] text-zinc-500">
        <div className="flex items-center gap-3 tabular-nums">
          <span className="inline-flex items-center gap-1">
            <Sigma className="h-3 w-3 opacity-70" />
            <strong className="text-zinc-700">{words.toLocaleString()}</strong> words
          </span>
          <span className="text-zinc-300">|</span>
          <span>
            <strong className="text-zinc-700">{characters.toLocaleString()}</strong> chars
          </span>
        </div>
        <span className="hidden text-zinc-400 sm:inline">
          Typography · Selection toolbar · Task lists · Tables
        </span>
      </div>

      <style jsx global>{`
        .ProseMirror {
          position: relative;
          outline: none;
        }

        .ProseMirror h1 {
          font-size: 2.25rem;
          line-height: 1.15;
          margin-top: 0.5rem;
          margin-bottom: 0.75rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .ProseMirror h2 {
          font-size: 1.75rem;
          line-height: 1.2;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .ProseMirror h3 {
          font-size: 1.35rem;
          line-height: 1.25;
          margin-top: 0.75rem;
          margin-bottom: 0.4rem;
          font-weight: 700;
        }

        .ProseMirror p {
          margin: 0.5rem 0;
          line-height: 1.7;
        }

        .ProseMirror hr {
          margin: 1.5rem 0;
          border: none;
          border-top: 2px solid #e4e4e7;
        }

        .ProseMirror blockquote {
          margin: 1rem 0;
          padding-left: 1rem;
          border-left: 4px solid #a78bfa;
          color: #52525b;
          font-style: italic;
        }

        .ProseMirror pre {
          margin: 1rem 0;
          border-radius: 0.75rem;
          background: #18181b;
          color: #fafafa;
          padding: 1rem;
          font-size: 0.875rem;
          overflow-x: auto;
        }

        .ProseMirror code {
          font-size: 0.9em;
          background: #f4f4f5;
          padding: 0.15em 0.4em;
          border-radius: 0.35rem;
        }

        .ProseMirror pre code {
          background: transparent;
          padding: 0;
        }

        .ProseMirror img {
          position: relative;
          max-width: 100%;
          height: auto;
          margin: 1em auto;
          display: block;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        .ProseMirror table {
          border-collapse: collapse;
          margin: 1em 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }

        .ProseMirror td,
        .ProseMirror th {
          border: 1px solid #d4d4d8;
          box-sizing: border-box;
          min-width: 1em;
          padding: 0.5em 0.75em;
          vertical-align: top;
        }

        .ProseMirror th {
          background-color: #fafafa;
          font-weight: 600;
          text-align: left;
        }

        .ProseMirror .selectedCell:after {
          background: rgba(139, 92, 246, 0.12);
          content: '';
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }

        .ProseMirror ul[data-type='taskList'] {
          list-style: none;
          padding-left: 0;
          margin: 0.75em 0;
        }

        .ProseMirror ul[data-type='taskList'] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }

        .ProseMirror ul[data-type='taskList'] li > label {
          flex-shrink: 0;
          margin-top: 0.35rem;
        }

        .ProseMirror ul[data-type='taskList'] li > div {
          flex: 1;
        }

        .ProseMirror ul[data-type='taskList'] input[type='checkbox'] {
          width: 1rem;
          height: 1rem;
          accent-color: #7c3aed;
          cursor: pointer;
        }

        .ProseMirror ul:not([data-type='taskList']) {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 1em 0;
        }

        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 1em 0;
        }

        .ProseMirror .is-editor-empty:first-child::before {
          color: #a1a1aa;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

export default TiptapEditor

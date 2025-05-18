'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
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
import Strike from '@tiptap/extension-strike'
import FontFamily from '@tiptap/extension-font-family'
import Placeholder from '@tiptap/extension-placeholder'
import ResizableImage from './ResizableImage'
import { toast } from 'sonner'
import { 
  FaBold, FaItalic, FaUnderline, FaHeading, FaListUl, FaLink, 
  FaImage, FaUndo, FaRedo, FaAlignLeft, FaAlignCenter, 
  FaAlignRight, FaQuoteLeft, FaCode, FaTable, FaHighlighter,
  FaListOl, FaStrikethrough, FaSuperscript, FaSubscript,
  FaPalette
} from 'react-icons/fa'
import { IoColorPalette, IoColorFill } from 'react-icons/io5'
import { useEditorUploadMutation } from '../Redux/features/blog/blogApi'
import { motion } from 'framer-motion'

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
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
  ]
}

const ColorPicker = ({ 
  colors, 
  activeColor, 
  onChange, 
  isOpen, 
  onClose 
}: { 
  colors: typeof COLORS.text,
  activeColor?: string,
  onChange: (color: string) => void,
  isOpen: boolean,
  onClose: () => void
}) => (
  isOpen && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-48 sm:w-56 md:w-64"
    >
      <div className="flex flex-col gap-1">
        {colors.map(({ name, color }) => (
          <button
            key={color}
            type="button"
            onClick={() => {
              onChange(color);
              onClose();
            }}
            className="group relative p-1.5 rounded hover:bg-gray-50"
            title={name}
          >
            <div 
              className={`w-5 h-5 rounded-full border ${
                color === activeColor 
                  ? 'ring-2 ring-offset-1 ring-gray-500' 
                  : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
            />
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {name}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  )
)

const TypingAnimation = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
  >
    <motion.div 
      className="flex items-center gap-1"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-2 h-2 bg-gray-600 rounded-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-600 rounded-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-600 rounded-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.8, delay: 0.4, repeat: Infinity, repeatType: "reverse" }}
      />
    </motion.div>
  </motion.div>
)

const TiptapEditor = ({ content, onChange, onImageUpload, placeholder = 'Start writing...' }: TiptapEditorProps) => {
  const [editorUpload] = useEditorUploadMutation()
  const [wordCount, setWordCount] = useState({ words: 0, characters: 0 })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [showTypingAnimation, setShowTypingAnimation] = useState(true)
  const [activeTextColor, setActiveTextColor] = useState('#000000')
  const [activeBgColor, setActiveBgColor] = useState('#FFFFFF')
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState('');

  const calculateWordCount = (text: string) => {
    // Remove HTML tags and entities
    const cleanText = text.replace(/<[^>]*>/g, ' ')
                         .replace(/&nbsp;/g, ' ')
                         .replace(/\s+/g, ' ')
                         .trim();
    
    // Handle empty or whitespace-only content
    if (!cleanText) {
      return {
        words: 0,
        characters: 0
      };
    }

    // Count actual words (excluding pure whitespace)
    const words = cleanText.split(/\s+/).filter(word => word.length > 0).length;
    
    // Count characters (excluding HTML and extra spaces)
    const characters = cleanText.length;

    return {
      words,
      characters
    };
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: 'rounded-lg mx-auto'
        }
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'resizableImage'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'left',
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      Subscript,
      Superscript,
      Strike,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setWordCount(calculateWordCount(html));
    },
    onFocus: () => {
      setIsEditorFocused(true)
      setShowTypingAnimation(false)
    },
    onBlur: () => {
      setIsEditorFocused(false)
    },
  })

  // Hide typing animation after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTypingAnimation(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!editor) return null

  const addImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      if (input.files?.length) {
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

          // Create a temporary image to get dimensions
          const img = new Image()
          img.onload = () => {
            editor.chain().focus().insertContent({
              type: 'resizableImage',
              attrs: {
                src: imageUrl,
                alt: 'Blog image',
                width: img.naturalWidth,
                height: img.naturalHeight,
              }
            }).run()
          }
          img.src = imageUrl
        } catch (error) {
          console.error('Image upload failed:', error)
          toast.error('Failed to upload image')
        }
      }
    }
    input.click()
  }

  const addLink = () => {
    // Check if text is selected
    const selectedText = editor?.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    );

    if (!selectedText || selectedText.trim() === '') {
      toast.error('Please select some text first');
      return;
    }

    setLinkInputValue('');
    setShowLinkModal(true);
  };

  const handleLinkModalSubmit = () => {
    if (linkInputValue) {
      // Add http:// if protocol is missing
      const formattedUrl = linkInputValue.startsWith('http://') || linkInputValue.startsWith('https://') 
        ? linkInputValue 
        : `https://${linkInputValue}`;

      editor.chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ 
          href: formattedUrl,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-blue-500',
        })
        .run();

      toast.success('Link added successfully');
      setShowLinkModal(false);
      setLinkInputValue('');
    }
  };

  const addTable = () => {
    editor?.chain()
      .focus()
      .insertTable({
        rows: 3,
        cols: 3,
        withHeaderRow: true
      })
      .run();

    // Add some default content to make the table visible
    const cells = editor?.state.doc.descendants(node => {
      if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
        editor.chain()
          .focus()
          .insertContent('Cell')
          .run();
        return true;
      }
      return false;
    });
  };

  const HeadingButton = ({ level }: { level: 1 | 2 | 3 }) => {
    const isActive = editor?.isActive('heading', { level: level })
    
    return (
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
        className={`px-3 py-1.5 font-bold rounded hover:bg-gray-200 ${
          isActive ? 'bg-gray-200 text-indigo-600' : 'text-gray-700'
        }`}
        title={`Heading ${level}`}
      >
        H{level}
      </button>
    )
  }

  return (
    <div className=" rounded-lg">
      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h3 className="text-lg font-medium mb-3">Insert Link</h3>
            <input
              type="text"
              placeholder="https://example.com"
              value={linkInputValue}
              onChange={(e) => setLinkInputValue(e.target.value)}
              className="w-full p-2 border rounded mb-3"
              onKeyDown={(e) => e.key === 'Enter' && handleLinkModalSubmit()}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkModalSubmit}
                className="px-3 py-1.5 bg-gray-600 text-white rounded"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b p-2 flex flex-wrap gap-2 bg-gray-50 sticky top-0 z-10">
        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <button
            type="button"
            onClick={() => editor?.chain().focus().setParagraph().run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
              editor?.isActive('paragraph') ? 'bg-gray-200 text-indigo-600' : 'text-gray-700'
            }`}
            title="Paragraph"
          >
            P
          </button>
          <HeadingButton level={1} />
          <HeadingButton level={2} />
          <HeadingButton level={3} />
        </div>

        <div className="h-6 w-px bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
          title="Bold"
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
          title="Italic"
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
          title="Underline"
        >
          <FaUnderline />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-gray-300' : ''}`}
          title="Highlight"
        >
          <FaHighlighter />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
            editor?.isActive('bulletList') ? 'bg-gray-200 text-indigo-600' : ''
          }`}
          title="Bullet List"
        >
          <FaListUl className="w-4 h-4" />
          <span className="text-sm">List</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
            editor?.isActive('orderedList') ? 'bg-gray-200 text-indigo-600' : ''
          }`}
          title="Numbered List"
        >
          <FaListOl className="w-4 h-4" />
          <span className="text-sm">Numbered</span>
        </button>
        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
            editor?.isActive('link') ? 'bg-gray-200 text-indigo-600' : ''
          }`}
          title="Add Link (Select text first)"
        >
          <FaLink className="w-4 h-4" />
          <span className="text-sm">Link</span>
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200"
          title="Add Image"
        >
          <FaImage />
        </button>
        <button
          type="button"
          onClick={addTable}
          className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
            editor?.isActive('table') ? 'bg-gray-200 text-indigo-600' : ''
          }`}
          title="Insert Table"
        >
          <FaTable className="w-4 h-4" />
          <span className="text-sm">Table</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200"
          title="Undo"
        >
          <FaUndo />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200"
          title="Redo"
        >
          <FaRedo />
        </button>
        <button
          type="button"
          onClick={() => editor.commands.setTextAlign('left')}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
          title="Align Left"
        >
          <FaAlignLeft />
        </button>
        <button
          type="button"
          onClick={() => editor.commands.setTextAlign('center')}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
          title="Align Center"
        >
          <FaAlignCenter />
        </button>
        <button
          type="button"
          onClick={() => editor.commands.setTextAlign('right')}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
          title="Align Right"
        >
          <FaAlignRight />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-300' : ''}`}
          title="Blockquote"
        >
          <FaQuoteLeft />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-gray-300' : ''}`}
          title="Code Block"
        >
          <FaCode />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
          title="Strike-through"
        >
          <FaStrikethrough />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('subscript') ? 'bg-gray-300' : ''}`}
          title="Subscript"
        >
          <FaSubscript />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('superscript') ? 'bg-gray-300' : ''}`}
          title="Superscript"
        >
          <FaSuperscript />
        </button>

        <div className="h-6 w-px bg-gray-300 mx-1" />

        <select
          onChange={(e) => {
            editor.chain().focus().setFontFamily(e.target.value).run()
          }}
          className="px-2 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50"
          value={editor.getAttributes('textStyle').fontFamily || 'Arial'}
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>

        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 transition-colors duration-200 ${
              showColorPicker ? 'bg-gray-200' : ''
            }`}
            title="Text Color"
          >
            <IoColorPalette className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: activeTextColor }} />
          </button>
          <ColorPicker
            colors={COLORS.text}
            activeColor={activeTextColor}
            onChange={(color) => {
              editor?.chain().focus().setColor(color).run();
              setActiveTextColor(color);
            }}
            isOpen={showColorPicker}
            onClose={() => setShowColorPicker(false)}
          />
        </div>

        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            className={`p-2 rounded bg-white hover:bg-gray-200 flex items-center gap-1 transition-colors duration-200 ${
              showBgColorPicker ? 'bg-gray-200' : ''
            }`}
            title="Background Color"
          >
            <IoColorFill className="w-4 h-4 sm:w-5 sm:h-5 fill-black" style={{ color: activeBgColor }} />
          </button>
          <ColorPicker
            colors={COLORS.background}
            activeColor={activeBgColor}
            onChange={(color) => {
              editor?.chain().focus().setHighlight({ color }).run();
              setActiveBgColor(color);
            }}
            isOpen={showBgColorPicker}
            onClose={() => setShowBgColorPicker(false)}
          />
        </div>
      </div>

      <div className="overflow-y-auto max-h-[600px] relative">
        <EditorContent 
          editor={editor} 
          className="   max-w-none py-4 px-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
        {showTypingAnimation && !isEditorFocused && (
          <TypingAnimation />
        )}
      </div>

      <div className="border-t p-2 flex justify-end text-sm text-gray-500 space-x-4">
        <span>Words: {wordCount.words.toLocaleString()}</span>
        <span>|</span>
        <span>Characters: {wordCount.characters.toLocaleString()}</span>
      </div>

      <style jsx global>{`
        .ProseMirror {
          position: relative;
          outline: none;
        }

        .ProseMirror h1 {
          font-size: 2.5rem;
          line-height: 1.2;
          margin-bottom: 1rem;
          font-weight: bold;
        }

        .ProseMirror h2 {
          font-size: 2rem;
          line-height: 1.25;
          margin-bottom: 0.875rem;
          font-weight: bold;
        }

        .ProseMirror h3 {
          font-size: 1.75rem;
          line-height: 1.3;
          margin-bottom: 0.75rem;
          font-weight: bold;
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

        .ProseMirror img.resize {
          resize: both;
          overflow: hidden;
          border: 2px solid transparent;
          padding: 4px;
          min-width: 100px;
          max-width: 100%;
        }

        .ProseMirror img.resize:hover {
          border-color: #4f46e5;
        }

        .ProseMirror img.resize:active,
        .ProseMirror img.resize:focus {
          border-color: #4338ca;
        }

        .ProseMirror img.resize::after {
          content: '';
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 10px;
          height: 10px;
          border-right: 2px solid #4f46e5;
          border-bottom: 2px solid #4f46e5;
          cursor: se-resize;
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
        }

        .ProseMirror img.resize:hover::after {
          opacity: 1;
        }

        .ProseMirror .selected-image {
          outline: 2px solid #4f46e5;
          outline-offset: 2px;
        }

        /* Loading state styles */
        .ProseMirror .image-loading {
          position: relative;
          min-height: 100px;
          background: #f3f4f6;
          border-radius: 4px;
        }

        .ProseMirror .image-loading::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .ProseMirror table {
          border-collapse: collapse;
          margin: 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
          margin: 1em 0;
        }

        .ProseMirror td,
        .ProseMirror th {
          border: 2px solid #ced4da;
          box-sizing: border-box;
          min-width: 1em;
          padding: 0.5em 1em;
          position: relative;
          vertical-align: top;
        }

        .ProseMirror th {
          background-color: #f8f9fa;
          font-weight: bold;
          text-align: left;
        }

        .ProseMirror .selectedCell:after {
          background: rgba(200, 200, 255, 0.4);
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }

        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 1em 0;
        }

        .ProseMirror ul li {
          margin-bottom: 0.5em;
        }

        .ProseMirror ul li p {
          margin: 0;
        }

        .ProseMirror ul[data-type="bulletList"] {
          list-style-type: disc;
        }

        .ProseMirror ul[data-type="bulletList"] li {
          position: relative;
        }

        .ProseMirror ul[data-type="bulletList"] li p {
          margin: 0;
        }

        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 1em 0;
        }

        .ProseMirror ol li {
          margin-bottom: 0.5em;
          padding-left: 0.5em;
        }

        .ProseMirror ol li p {
          margin: 0;
        }

        .ProseMirror ol[data-type="orderedList"] {
          list-style-type: decimal;
        }

        .ProseMirror ol[data-type="orderedList"] li {
          position: relative;
        }

        /* Nested list styling */
        .ProseMirror ol[data-type="orderedList"] ol {
          list-style-type: lower-alpha;
          margin-top: 0.5em;
        }

        .ProseMirror ol[data-type="orderedList"] ol ol {
          list-style-type: lower-roman;
        }
      `}</style>
    </div>
  )
}

export default TiptapEditor
import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

const ResizableImageComponent = (props: NodeViewProps) => {
  const imageRef = useRef<HTMLImageElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [initialWidth, setInitialWidth] = useState(0)
  const [initialHeight, setInitialHeight] = useState(0)
  const [initialX, setInitialX] = useState(0)

  const { node, updateAttributes, selected } = props

  useEffect(() => {
    if (imageRef.current) {
      const { width, height } = imageRef.current
      updateAttributes({
        width,
        height,
      })
    }
  }, [updateAttributes])

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!imageRef.current) return

    setIsResizing(true)
    setInitialWidth(imageRef.current.width)
    setInitialHeight(imageRef.current.height)
    setInitialX(e.clientX)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      e.preventDefault()
      const deltaX = e.clientX - initialX
      const newWidth = Math.max(100, initialWidth + deltaX)
      const aspectRatio = initialHeight / initialWidth
      const newHeight = Math.round(newWidth * aspectRatio)

      updateAttributes({
        width: newWidth,
        height: newHeight,
      })
    }
  }, [isResizing, initialWidth, initialHeight, initialX, updateAttributes])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
    }

    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing, resize, stopResizing])

  const attrs = node.attrs as { 
    src: string, 
    alt: string, 
    width: number, 
    height: number,
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

  return (
    <NodeViewWrapper className="react-component-with-content">
      <div 
        className={`
          relative w-full my-4
          ${getAlignmentClass(attrs.textAlign)}
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        `}
      >
        <div className="relative inline-block group" contentEditable={false}>
          <img
            ref={imageRef}
            src={attrs.src || ''}
            alt={attrs.alt || ''}
            width={attrs.width || undefined}
            height={attrs.height || undefined}
            className={`
              max-w-full rounded-lg transition-shadow
              ${selected ? 'shadow-lg' : 'shadow-md'}
            `}
            style={{ 
              width: attrs.width || 'auto',
              height: attrs.height || 'auto',
            }}
            draggable={false}
          />
          {selected && (
            <div 
              className="absolute bottom-0 right-0 w-4 h-4 bg-white border-2 border-blue-500 rounded-bl 
                       cursor-se-resize shadow-md"
              onMouseDown={startResizing}
            />
          )}
          {isResizing && (
            <div className="fixed inset-0 cursor-se-resize" />
          )}
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
        renderHTML: attributes => ({
          style: `text-align: ${attributes.textAlign}`,
        }),
        parseHTML: element => element.style.textAlign || 'left',
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
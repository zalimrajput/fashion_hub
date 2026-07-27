import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'

export default function ChatInput({ onSend, loading }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    if (!loading && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [loading])

  const adjustHeight = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 160) + 'px'
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || loading) return
    onSend(text.trim())
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  const canSend = text.trim().length > 0 && !loading

  return (
    <div className="border-t border-gray-100 bg-white/95 backdrop-blur-sm">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto flex items-end gap-2.5 px-4 pt-3 pb-2"
      >
        <div className="flex-1 relative">
          <div
            className={`flex items-end rounded-xl border bg-gray-50 transition-all duration-150 ${
              loading
                ? 'border-gray-200 opacity-50'
                : 'border-gray-200/80 hover:border-gray-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100/60 focus-within:bg-white'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                adjustHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about products, cart, or place an order..."
              rows={1}
              disabled={loading}
              className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none disabled:cursor-not-allowed"
              aria-label="Chat message"
            />
            {!text.trim() && !loading && (
              <div className="flex items-center pr-4 pb-3 pointer-events-none">
                <Sparkles size={15} className="text-gray-300" />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSend}
          className={`flex-shrink-0 flex items-center justify-center w-[42px] h-[42px] rounded-xl transition-all duration-150 ${
            canSend
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm shadow-indigo-200'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <Send size={17} strokeWidth={2.2} />
        </button>
      </form>

      <p className="text-[10px] text-center text-gray-300 pb-2 font-medium">
        Enter to send · Shift + Enter for new line
      </p>
    </div>
  )
}

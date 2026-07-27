import { useEffect, useRef } from 'react'
import { Sparkles, MessageSquare, ArrowRight } from 'lucide-react'
import MessageBubble from './MessageBubble.jsx'
import LoadingIndicator from './LoadingIndicator.jsx'

const suggestions = [
  { label: 'Show me black jackets under 5000' },
  { label: 'What are your delivery charges?' },
  { label: 'Add 2 Polo Shirts to my cart' },
  { label: 'Give me some recommendations' },
]

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-indigo-100 via-indigo-50 to-purple-100 flex items-center justify-center shadow-sm shadow-indigo-200/30">
          <Sparkles size={30} className="text-indigo-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2 tracking-tight">
          Fashion Hub AI Assistant
        </h2>
        <p className="text-sm text-gray-400 mb-7 leading-relaxed max-w-sm mx-auto font-medium">
          Your personal AI stylist. Ask me about products, get recommendations,
          manage your cart, or place an order.
        </p>

        <div className="flex flex-col items-center gap-2">
          {suggestions.map((s) => (
            <div
              key={s.label}
              className="group w-full max-w-sm"
            >
              <div className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 rounded-xl bg-gray-50/80 border border-gray-100 text-sm text-gray-500 transition-all duration-150">
                <MessageSquare
                  size={14}
                  className="flex-shrink-0 text-gray-300 group-hover:text-indigo-400 transition-colors"
                />
                <span className="font-medium">{s.label}</span>
                <ArrowRight
                  size={13}
                  className="ml-auto flex-shrink-0 text-gray-200 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-300 mt-6 font-medium">
          Type a message to get started
        </p>
      </div>
    </div>
  )
}

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  if (messages.length === 0) {
    return <EmptyState />
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
          />
        ))}
        {loading && <LoadingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

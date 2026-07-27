import { useState, useCallback, useRef } from 'react'
import { sendChatMessage } from '../services/api.js'

function genSessionId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
}

export function useChat(initialSessionId, customerId) {
  const [sessions, setSessions] = useState(() => {
    const sid = initialSessionId || genSessionId()
    return [{ id: sid, messages: [], title: 'New Chat' }]
  })
  const [activeSessionId, setActiveSessionId] = useState(
    initialSessionId || sessions[0].id
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const messages = activeSession ? activeSession.messages : []

  const updateSession = useCallback((sessionId, updater) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? updater(s) : s))
    )
  }, [])

  const switchSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId)
    setError(null)
  }, [])

  const createNewSession = useCallback(() => {
    const id = genSessionId()
    setSessions((prev) => [...prev, { id, messages: [], title: 'New Chat' }])
    setActiveSessionId(id)
    setError(null)
  }, [])

  const deleteSession = useCallback(
    (sessionId) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId)
        if (filtered.length === 0) {
          const id = genSessionId()
          return [{ id, messages: [], title: 'New Chat' }]
        }
        return filtered
      })
      setActiveSessionId((prev) => {
        if (prev === sessionId) {
          const remaining = sessions.filter((s) => s.id !== sessionId)
          return remaining.length > 0 ? remaining[0].id : genSessionId()
        }
        return prev
      })
      setError(null)
    },
    [sessions]
  )

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || loading) return

      setError(null)
      const sessionId = activeSessionId

      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      }

      updateSession(sessionId, (s) => ({
        ...s,
        messages: [...s.messages, userMsg],
        title: s.messages.length === 0 ? text.slice(0, 40) + (text.length > 40 ? '...' : '') : s.title,
      }))

      setLoading(true)

      const currentMessages =
        sessions.find((s) => s.id === sessionId)?.messages || []

      const history = currentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      try {
        const data = await sendChatMessage({
          session_id: sessionId,
          message: text,
          customer_id: customerId || '',
          platform: 'web',
          history,
        })
      console.log("AI RESPONSE:", data)    
        // const aiMsg = {
        //   id: (Date.now() + 1).toString(),
        //   role: 'assistant',
        //   content: data.reply || 'Sorry, I could not process that.',
        //   timestamp: new Date().toISOString(),
        //   intent: data.intent,
        //   sentiment: data.sentiment,
        //   entities: data.entities,
        // }
        const aiMsg = {
  id: (Date.now() + 1).toString(),
  role: 'assistant',
  content: (data.reply != null && data.reply !== undefined) ? data.reply : 'Sorry, I could not process that.',
  timestamp: new Date().toISOString(),
  intent: data.intent,
  sentiment: data.sentiment,
  entities: data.entities,
  products: data.products || []
}
        updateSession(sessionId, (s) => ({
          ...s,
          messages: [...s.messages, aiMsg],
        }))
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail?.[0]?.msg ||
          err.message ||
          'Something went wrong. Please try again.'

        setError(errorMsg)

        const errAiMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `[Error] ${errorMsg}`,
          timestamp: new Date().toISOString(),
        }

        updateSession(sessionId, (s) => ({
          ...s,
          messages: [...s.messages, errAiMsg],
        }))
      } finally {
        setLoading(false)
      }
    },
    [activeSessionId, loading, sessions, updateSession]
  )

  const clearSession = useCallback(() => {
    updateSession(activeSessionId, (s) => ({
      ...s,
      messages: [],
      title: 'New Chat',
    }))
    setError(null)
  }, [activeSessionId, updateSession])

  return {
    sessions,
    activeSessionId,
    messages,
    loading,
    error,
    sendMessage,
    switchSession,
    createNewSession,
    deleteSession,
    clearSession,
  }
}

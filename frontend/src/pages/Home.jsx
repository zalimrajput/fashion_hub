import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import Sidebar from '../components/Sidebar.jsx'
import ChatWindow from '../components/ChatWindow.jsx'
import ChatInput from '../components/ChatInput.jsx'
import { useChat } from '../hooks/useChat.js'
import { sendChatMessage } from '../services/api.js'

export default function Home() {
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [connected, setConnected] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const {
    sessions,
    activeSessionId,
    messages,
    loading,
    sendMessage,
    switchSession,
    createNewSession,
    deleteSession,
  } = useChat(null, customerId)

  useEffect(() => {
    fetch('/api/customers')
      .then(r => r.json())
      .then(data => {
        const list = data.customers || []
        setCustomers(list)
        if (list.length > 0 && !customerId) {
          setCustomerId(list[0]._id)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        await sendChatMessage({
          session_id: 'health',
          message: '',
          customer_id: customerId || '',
          platform: 'web',
          history: [],
        })
        if (!cancelled) setConnected(true)
      } catch {
        if (!cancelled) setConnected(false)
      }
    }
    check()
    return () => { cancelled = true }
  }, [customerId])

  return (
    <div className="h-screen flex bg-gradient-to-br from-white via-gray-50/30 to-gray-100/40">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSwitch={switchSession}
        onNewChat={createNewSession}
        onDelete={deleteSession}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Header connected={connected} customers={customers} customerId={customerId} onCustomerChange={setCustomerId} />

        <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white to-gray-50/30 overflow-hidden">
          <ChatWindow messages={messages} loading={loading} />
          <ChatInput onSend={sendMessage} loading={loading} />
        </main>
      </div>
    </div>
  )
}

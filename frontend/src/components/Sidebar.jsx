import { useState } from 'react'
import {
  Plus,
  MessageSquare,
  Trash2,
  ChevronLeft,
  PanelRightOpen,
  History,
} from 'lucide-react'

function SidebarItem({ session, isActive, onSelect, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    setDeleting(true)
    setTimeout(() => {
      onDelete(session.id)
    }, 250)
  }

  return (
    <div
      onClick={() => onSelect(session.id)}
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
        deleting ? 'scale-95 opacity-0' : ''
      } ${
        isActive
          ? 'bg-indigo-50/70 text-indigo-700 ring-1 ring-indigo-200/60'
          : 'text-gray-600 hover:bg-gray-100/70 active:bg-gray-200/50'
      }`}
    >
      <MessageSquare size={15} className="flex-shrink-0 opacity-70" />
      <span className="text-xs font-medium truncate flex-1">
        {session.title}
      </span>
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 hover:text-red-500 transition-all"
        title="Delete chat"
        aria-label="Delete chat"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSwitch,
  onNewChat,
  onDelete,
  collapsed,
  onToggle,
}) {
  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/15 z-20 md:bg-transparent md:static md:inset-auto md:z-auto"
          onClick={onToggle}
        />
      )}

      <aside
        className={`${
          collapsed ? 'w-0 md:w-[52px] overflow-hidden' : 'w-64'
        } flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out relative z-30`}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-3 pt-3">
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <PanelRightOpen size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <button
                onClick={onNewChat}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-semibold hover:from-indigo-700 hover:to-indigo-600 active:scale-[0.97] transition-all duration-150 shadow-sm shadow-indigo-200"
              >
                <Plus size={16} strokeWidth={2.5} />
                New Chat
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <SidebarItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={onSwitch}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-300">
                  <History size={28} strokeWidth={1.5} />
                  <p className="text-xs font-medium">No chats yet</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 text-center font-medium">
                {sessions.length} chat{sessions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

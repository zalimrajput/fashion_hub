import { Bot, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'

function StatusDot({ online }) {
  return (
    <span className="relative shrink-0">
      <span
        className={`block h-1.75 w-1.75 rounded-full ${
          online ? 'bg-emerald-500' : 'bg-red-400'
        }`}
      />
      {online && (
        <span className="absolute inset-0 block h-1.75 w-1.75 rounded-full bg-emerald-500 animate-ping opacity-40" />
      )}
    </span>
  )
}

export default function Header({ connected, customers, customerId, onCustomerChange }) {
  return (
    <header className="z-40 flex h-14 shrink-0 items-center justify-between border-b border-gray-100 bg-white/95 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-700 shadow-sm shadow-indigo-200">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-800 leading-tight tracking-tight">
            Fashion Hub AI Assistant
          </h1>
          <p className="text-[10px] text-gray-400 leading-tight font-medium">
            Powered by Gemini 2.5 Flash
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <LayoutDashboard size={14} />
          Admin Dashboard
        </Link>
        {customers && customers.length > 0 && (
          <select
            value={customerId || ''}
            onChange={e => onCustomerChange(e.target.value)}
            className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {customers.map(c => (
              <option key={c._id} value={c._id}>
                {c.name} {c.phoneNumber ? `(${c.phoneNumber})` : ''}
              </option>
            ))}
          </select>
        )}
        <div
          className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
            connected
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          <StatusDot online={connected} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </header>
  )
}

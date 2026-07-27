export default function LoadingIndicator() {
  return (
    <div className="flex items-center gap-3 pl-14 animate-fade-in">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse-dot" />
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse-dot animation-delay-200" />
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse-dot animation-delay-400" />
      </div>
      <span className="text-xs text-gray-400 font-medium">Thinking...</span>
    </div>
  )
}

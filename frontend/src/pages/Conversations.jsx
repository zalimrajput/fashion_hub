import { useEffect, useState } from "react";
import api from "../api/client";
import {
  PageHeader,
  Card,
  Loading,
  EmptyState,
  Badge,
  Button,
} from "../components/ui";

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/conversations");
      const list = data.data || [];
      setConversations(list);
      if (selected) {
        setSelected(list.find((c) => c._id === selected._id) || list[0] || null);
      } else {
        setSelected(list[0] || null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleResolved = async (conversation) => {
    await api.put(`/api/conversations/${conversation._id}`, {
      isResolved: !conversation.isResolved,
    });
    load();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Conversations"
        subtitle="AI and customer message history"
      />

      {conversations.length === 0 ? (
        <Card>
          <EmptyState
            title="No conversations yet"
            description="Messages will appear when WhatsApp customers chat with the AI."
          />
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr] gap-4 min-h-[560px]">
          <Card className="overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-line text-sm font-medium">
              Threads ({conversations.length})
            </div>
            <div className="overflow-y-auto flex-1">
              {conversations.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left px-4 py-3 border-b border-line hover:bg-paper-2 ${
                    selected?._id === c._id ? "bg-accent-soft" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">
                      {c.customer?.name || "Customer"}
                    </p>
                    <Badge>{c.platform}</Badge>
                  </div>
                  <p className="text-xs text-ink-soft mt-1 line-clamp-1">
                    {c.lastMessage}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="flex flex-col overflow-hidden">
            {selected ? (
              <>
                <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {selected.customer?.name || "Customer"}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {selected.customer?.phoneNumber} · {selected.platform}
                      {selected.sentiment ? ` · ${selected.sentiment}` : ""}
                      {selected.intent ? ` · ${selected.intent}` : ""}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => toggleResolved(selected)}
                  >
                    {selected.isResolved ? "Reopen" : "Mark resolved"}
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-paper/50">
                  {(selected.messages || []).map((m, idx) => (
                    <div
                      key={`${m.timestamp}-${idx}`}
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        m.sender === "Customer"
                          ? "bg-white border border-line"
                          : m.sender === "AI"
                            ? "bg-accent text-white ml-auto"
                            : "bg-paper-2 ml-auto"
                      }`}
                    >
                      <p className="text-[10px] uppercase tracking-wide opacity-70 mb-1">
                        {m.sender}
                      </p>
                      {m.message}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState title="Select a conversation" />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

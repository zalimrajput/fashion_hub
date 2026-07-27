import { useState } from "react";
import { Send } from "lucide-react";
import api from "../api/client";
import { PageHeader, Card, Button, Input } from "../components/ui";

export default function AITester() {
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("+923001234567");
  const [persist, setPersist] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Welcome to FashionHub ❤ Ask me about dresses, sizes, delivery, or place an order.",
    },
  ]);

  const send = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userText = message.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setMessage("");
    setBusy(true);
    setError("");

    try {
      const endpoint = persist ? "/api/chat/simulate" : "/api/chat/test";
      const payload = persist
        ? { message: userText, phone }
        : { message: userText, sessionId: `admin_${phone}` };

      const { data } = await api.post(endpoint, payload);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.data.reply },
      ]);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "AI request failed. Is the AI service running on port 8000?";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `⚠️ ${msg}` },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Tester"
        subtitle="Chat with the sales assistant and optionally save the conversation"
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <Card className="p-5 h-fit space-y-4">
          <Input
            label="Customer phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={persist}
              onChange={(e) => setPersist(e.target.checked)}
            />
            Save to Conversations / Customers
          </label>
          <p className="text-xs text-ink-soft leading-relaxed">
            Backend calls <code className="text-accent">AI_SERVICE_URL/chat</code>{" "}
            then returns the reply. With save enabled, the same path used by
            WhatsApp is exercised.
          </p>
          {error && <p className="text-xs text-danger">{error}</p>}
        </Card>

        <Card className="flex flex-col min-h-[560px] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-paper/40">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-white border border-line"
                    : "bg-accent text-white ml-auto"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={send}
            className="p-4 border-t border-line flex gap-2 bg-white"
          >
            <input
              className="flex-1 rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="Try: I need a black dress for Eid"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={busy}
            />
            <Button type="submit" disabled={busy}>
              <Send size={16} />
              {busy ? "..." : "Send"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

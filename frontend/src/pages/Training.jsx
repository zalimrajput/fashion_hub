import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../api/client";
import {
  PageHeader,
  Card,
  Button,
  Input,
  TextArea,
  Select,
  Table,
  Loading,
  EmptyState,
  Badge,
} from "../components/ui";

const categories = [
  "Greeting",
  "Product",
  "Price",
  "Size",
  "Color",
  "Delivery",
  "Order",
  "Tracking",
  "Return",
  "Exchange",
  "Complaint",
  "Discount",
  "General",
];

const empty = {
  intent: "",
  category: "General",
  question: "",
  answer: "",
  keywords: "",
  language: "English",
  isActive: true,
};

export default function Training() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/training");
      setRows(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/training", {
        ...form,
        keywords: form.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      });
      setForm(empty);
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this training reply?")) return;
    await api.delete(`/api/training/${id}`);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Train AI responses"
        subtitle="Add Q&A pairs the sales assistant can learn from"
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus size={16} />
            {showForm ? "Hide form" : "Add reply"}
          </Button>
        }
      />

      {showForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Intent"
              name="intent"
              value={form.intent}
              onChange={onChange}
              placeholder="greeting, delivery_inquiry..."
              required
            />
            <Select
              label="Category"
              name="category"
              value={form.category}
              onChange={onChange}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Input
              label="Language"
              name="language"
              value={form.language}
              onChange={onChange}
            />
            <Input
              label="Keywords (comma separated)"
              name="keywords"
              value={form.keywords}
              onChange={onChange}
            />
            <div className="sm:col-span-2">
              <TextArea
                label="Customer question"
                name="question"
                value={form.question}
                onChange={onChange}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <TextArea
                label="AI answer"
                name="answer"
                value={form.answer}
                onChange={onChange}
                required
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={onChange}
              />
              Active
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save training data"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No training data yet" />
        ) : (
          <Table
            headers={["Category", "Question", "Answer", "Language", "Status", ""]}
          >
            {rows.map((r) => (
              <tr key={r._id} className="border-b border-line last:border-0 align-top">
                <td className="px-4 py-3">
                  <Badge>{r.category}</Badge>
                  <p className="text-xs text-ink-soft mt-1">{r.intent}</p>
                </td>
                <td className="px-4 py-3 max-w-xs">{r.question}</td>
                <td className="px-4 py-3 max-w-sm text-ink-soft">{r.answer}</td>
                <td className="px-4 py-3">{r.language}</td>
                <td className="px-4 py-3">
                  <Badge tone={r.isActive ? "success" : "danger"}>
                    {r.isActive ? "Active" : "Off"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="danger"
                    className="!px-2.5 !py-2"
                    onClick={() => remove(r._id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

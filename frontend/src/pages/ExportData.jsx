import { Download } from "lucide-react";
import api from "../api/client";
import { PageHeader, Card, Button } from "../components/ui";

const downloads = [
  {
    key: "products",
    title: "Products",
    description: "Export full product catalog as CSV",
  },
  {
    key: "customers",
    title: "Customers",
    description: "Export customer contacts and preferences",
  },
  {
    key: "orders",
    title: "Orders",
    description: "Export order history with totals and status",
  },
  {
    key: "conversations",
    title: "Conversations",
    description: "Export AI chat threads metadata",
  },
];

async function downloadCsv(key) {
  const res = await api.get(`/api/export/${key}`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${key}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function ExportData() {
  return (
    <div>
      <PageHeader
        title="Export data"
        subtitle="Download CSV files for reporting and backups"
      />
      <div className="grid sm:grid-cols-2 gap-4">
        {downloads.map((item) => (
          <Card key={item.key} className="p-6">
            <h2 className="font-display text-xl mb-1">{item.title}</h2>
            <p className="text-sm text-ink-soft mb-5">{item.description}</p>
            <Button onClick={() => downloadCsv(item.key)}>
              <Download size={16} /> Download CSV
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

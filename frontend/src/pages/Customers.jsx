import { useEffect, useState } from "react";
import api from "../api/client";
import {
  PageHeader,
  Card,
  Table,
  Loading,
  EmptyState,
  Badge,
} from "../components/ui";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/customers")
      .then(({ data }) => setCustomers(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Shoppers from WhatsApp and Instagram"
      />
      <Card>
        {loading ? (
          <Loading />
        ) : customers.length === 0 ? (
          <EmptyState title="No customers yet" />
        ) : (
          <Table
            headers={[
              "Name",
              "Phone",
              "WhatsApp",
              "Instagram",
              "City",
              "Orders",
              "Prefs",
            ]}
          >
            {customers.map((c) => (
              <tr key={c._id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.phoneNumber}</td>
                <td className="px-4 py-3">{c.whatsappNumber || "—"}</td>
                <td className="px-4 py-3">{c.instagramId || "—"}</td>
                <td className="px-4 py-3">{c.city || "—"}</td>
                <td className="px-4 py-3">
                  <Badge>{(c.orderHistory || []).length}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-ink-soft">
                  {[
                    c.preferences?.favoriteColor,
                    c.preferences?.favoriteCategory,
                    c.preferences?.gender,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

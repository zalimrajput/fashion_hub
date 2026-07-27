import { useEffect, useState } from "react";
import api from "../api/client";
import {
  PageHeader,
  Card,
  Table,
  Loading,
  EmptyState,
  Badge,
  Select,
} from "../components/ui";

const formatPKR = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

const statusTone = (status) => {
  if (status === "Delivered") return "success";
  if (status === "Cancelled") return "danger";
  if (status === "Pending") return "warning";
  return "neutral";
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/orders");
      setOrders(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/api/orders/${id}`, { status });
    load();
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle="Track and update order status" />
      <Card>
        {loading ? (
          <Loading />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders yet" />
        ) : (
          <Table
            headers={[
              "Order",
              "Customer",
              "Total",
              "Payment",
              "Status",
              "Tracking",
              "Update",
            ]}
          >
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{o.orderId}</p>
                  <p className="text-xs text-ink-soft">
                    {(o.products || []).length} item(s)
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p>{o.customer?.name || "—"}</p>
                  <p className="text-xs text-ink-soft">
                    {o.city}, {o.province}
                  </p>
                </td>
                <td className="px-4 py-3">{formatPKR(o.grandTotal)}</td>
                <td className="px-4 py-3">
                  <Badge
                    tone={o.paymentStatus === "Paid" ? "success" : "warning"}
                  >
                    {o.paymentStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(o.status)}>{o.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs">
                  {o.trackingNumber || "—"}
                </td>
                <td className="px-4 py-3 min-w-40">
                  <div className="flex gap-2 items-center">
                    <Select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="!py-1.5"
                    >
                      {[
                        "Pending",
                        "Confirmed",
                        "Processing",
                        "Shipped",
                        "Delivered",
                        "Cancelled",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

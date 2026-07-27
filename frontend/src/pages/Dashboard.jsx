import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Users,
  ShoppingBag,
  MessagesSquare,
  Banknote,
} from "lucide-react";
import api from "../api/client";
import { PageHeader, Card, Badge, Loading } from "../components/ui";

const formatPKR = (n) =>
  `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

const MOCK_STATS = {
  totalProducts: 24,
  totalCustomers: 128,
  totalOrders: 56,
  totalConversations: 41,
  pendingOrders: 7,
  openConversations: 12,
  revenue: 284500,
  recentOrders: [
    {
      _id: "1",
      orderId: "ORD-1008",
      grandTotal: 5499,
      status: "Pending",
      customer: { name: "Ayesha Khan" },
    },
    {
      _id: "2",
      orderId: "ORD-1007",
      grandTotal: 4999,
      status: "Confirmed",
      customer: { name: "Hassan Ali" },
    },
    {
      _id: "3",
      orderId: "ORD-1006",
      grandTotal: 3200,
      status: "Shipped",
      customer: { name: "Sara Ahmed" },
    },
  ],
  recentConversations: [
    {
      _id: "c1",
      platform: "WhatsApp",
      lastMessage: "Do you have black dresses for Eid?",
      customer: { name: "Ayesha Khan" },
    },
    {
      _id: "c2",
      platform: "Instagram",
      lastMessage: "Delivery charges to Lahore?",
      customer: { name: "Bilal Raza" },
    },
    {
      _id: "c3",
      platform: "WhatsApp",
      lastMessage: "Track my order ORD-1006",
      customer: { name: "Sara Ahmed" },
    },
  ],
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    api
      .get("/api/dashboard")
      .then((res) => setStats(res.data.data))
      .catch(() => {
        setStats(MOCK_STATS);
        setPreview(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const cards = [
    { label: "Products", value: stats.totalProducts, icon: Package },
    { label: "Customers", value: stats.totalCustomers, icon: Users },
    { label: "Orders", value: stats.totalOrders, icon: ShoppingBag },
    {
      label: "Conversations",
      value: stats.totalConversations,
      icon: MessagesSquare,
    },
    { label: "Revenue", value: formatPKR(stats.revenue), icon: Banknote },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={
          preview
            ? "Preview mode — sample data (backend offline)"
            : "Overview of FashionHub sales and AI conversations"
        }
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-ink-soft">{label}</p>
              <Icon size={18} className="text-accent" />
            </div>
            <p className="font-display text-2xl">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Recent orders</h2>
            <Badge tone="warning">{stats.pendingOrders} pending</Badge>
          </div>
          <div className="space-y-3">
            {(stats.recentOrders || []).map((order) => (
              <Link
                key={order._id}
                to="/orders"
                className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 hover:bg-paper-2"
              >
                <div>
                  <p className="font-medium text-sm">{order.orderId}</p>
                  <p className="text-xs text-ink-soft">
                    {order.customer?.name || "Customer"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatPKR(order.grandTotal)}</p>
                  <Badge>{order.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Open conversations</h2>
            <Badge tone="success">{stats.openConversations} open</Badge>
          </div>
          <div className="space-y-3">
            {(stats.recentConversations || []).map((c) => (
              <Link
                key={c._id}
                to="/conversations"
                className="block rounded-xl border border-line px-3 py-2.5 hover:bg-paper-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-sm">
                    {c.customer?.name || "Customer"}
                  </p>
                  <Badge>{c.platform}</Badge>
                </div>
                <p className="text-xs text-ink-soft mt-1 line-clamp-1">
                  {c.lastMessage || "No messages"}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api, { assetUrl } from "../api/client";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Table,
  Loading,
  EmptyState,
} from "../components/ui";

const formatPKR = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/products");
      setProducts(data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/api/products/${id}`);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage catalog for AI recommendations"
        actions={
          <Link to="/products/new">
            <Button>
              <Plus size={16} /> Add product
            </Button>
          </Link>
        }
      />

      <Card>
        {loading ? (
          <Loading />
        ) : error ? (
          <p className="p-6 text-danger text-sm">{error}</p>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Add your first dress, shirt, or accessory."
          />
        ) : (
          <Table
            headers={[
              "Product",
              "Category",
              "Price",
              "Stock",
              "Flags",
              "Status",
              "Actions",
            ]}
          >
            {products.map((p) => (
              <tr key={p._id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-paper-2 overflow-hidden shrink-0">
                      {p.images?.[0] ? (
                        <img
                          src={assetUrl(p.images[0])}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium">{p.productName}</p>
                      <p className="text-xs text-ink-soft">
                        {(p.colors || []).join(", ") || "—"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">
                  {formatPKR(p.price)}
                  {p.discount > 0 && (
                    <span className="text-xs text-accent ml-1">
                      -{p.discount}%
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.isTrending && <Badge tone="success">Trending</Badge>}
                    {p.isBestSeller && <Badge tone="warning">Best</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={p.status ? "success" : "danger"}>
                    {p.status ? "Active" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link to={`/products/${p._id}/edit`}>
                      <Button variant="secondary" className="!px-2.5 !py-2">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      className="!px-2.5 !py-2"
                      onClick={() => remove(p._id)}
                    >
                      <Trash2 size={14} />
                    </Button>
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

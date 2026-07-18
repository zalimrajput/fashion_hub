import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import {
  PageHeader,
  Card,
  Button,
  Input,
  TextArea,
  Select,
} from "../components/ui";

const empty = {
  productName: "",
  category: "",
  subCategory: "",
  description: "",
  price: "",
  discount: "0",
  sizes: "S, M, L, XL",
  colors: "",
  stock: "0",
  gender: "Unisex",
  season: "All Season",
  isTrending: false,
  isBestSeller: false,
  status: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/api/products/${id}`).then(({ data }) => {
      const p = data.data;
      setForm({
        productName: p.productName || "",
        category: p.category || "",
        subCategory: p.subCategory || "",
        description: p.description || "",
        price: String(p.price ?? ""),
        discount: String(p.discount ?? 0),
        sizes: (p.sizes || []).join(", "),
        colors: (p.colors || []).join(", "),
        stock: String(p.stock ?? 0),
        gender: p.gender || "Unisex",
        season: p.season || "All Season",
        isTrending: Boolean(p.isTrending),
        isBestSeller: Boolean(p.isBestSeller),
        status: p.status !== false,
      });
    });
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value);
      });
      images.forEach((file) => fd.append("images", file));

      if (isEdit) {
        await api.put(`/api/products/${id}`, fd);
      } else {
        await api.post("/api/products", fd);
      }
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit product" : "Add product"}
        subtitle="Products feed the AI recommendation engine"
      />

      <Card className="p-6 max-w-3xl">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Product name"
              name="productName"
              value={form.productName}
              onChange={onChange}
              required
            />
            <Input
              label="Category"
              name="category"
              value={form.category}
              onChange={onChange}
              placeholder="Dresses, Shirts, Shoes..."
              required
            />
            <Input
              label="Sub category"
              name="subCategory"
              value={form.subCategory}
              onChange={onChange}
            />
            <Input
              label="Price (Rs)"
              type="number"
              name="price"
              value={form.price}
              onChange={onChange}
              required
            />
            <Input
              label="Discount %"
              type="number"
              name="discount"
              value={form.discount}
              onChange={onChange}
            />
            <Input
              label="Stock"
              type="number"
              name="stock"
              value={form.stock}
              onChange={onChange}
            />
            <Input
              label="Sizes (comma separated)"
              name="sizes"
              value={form.sizes}
              onChange={onChange}
            />
            <Input
              label="Colors (comma separated)"
              name="colors"
              value={form.colors}
              onChange={onChange}
              placeholder="Black, Red, Beige"
            />
            <Select
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={onChange}
            >
              {["Men", "Women", "Unisex", "Boys", "Girls"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Select>
            <Select
              label="Season"
              name="season"
              value={form.season}
              onChange={onChange}
            >
              {["Summer", "Winter", "All Season"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </div>

          <TextArea
            label="Description"
            name="description"
            value={form.description}
            onChange={onChange}
            required
          />

          <Input
            label="Images"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files || []))}
          />

          <div className="flex flex-wrap gap-4 text-sm">
            {[
              ["isTrending", "Trending"],
              ["isBestSeller", "Best seller"],
              ["status", "Active"],
            ].map(([name, label]) => (
              <label key={name} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name={name}
                  checked={form[name]}
                  onChange={onChange}
                />
                {label}
              </label>
            ))}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save product"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/products")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

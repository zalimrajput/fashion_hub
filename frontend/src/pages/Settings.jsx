import { useEffect, useState } from "react";
import api from "../api/client";
import {
  PageHeader,
  Card,
  Button,
  Input,
  TextArea,
  Loading,
} from "../components/ui";

const empty = {
  storeName: "FashionHub",
  supportEmail: "",
  supportPhone: "",
  whatsappNumber: "",
  instagramUsername: "",
  currency: "PKR",
  deliveryTime: "3-5 Working Days",
  returnPolicy: "Returns accepted within 7 days.",
  exchangePolicy: "Exchange available within 7 days.",
  businessHours: "Monday - Saturday (9:00 AM - 8:00 PM)",
  isStoreOpen: true,
};

export default function SettingsPage() {
  const [form, setForm] = useState(empty);
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get("/api/settings")
      .then(({ data }) => {
        if (data.data) {
          setForm({ ...empty, ...data.data });
          setId(data.data._id);
        }
      })
      .finally(() => setLoading(false));
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
    setMessage("");
    try {
      if (id) {
        await api.put(`/api/settings/${id}`, form);
        setMessage("Settings updated");
      } else {
        const { data } = await api.post("/api/settings", form);
        setId(data.data._id);
        setMessage("Settings created");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Store contact, delivery, and policy defaults"
      />
      <Card className="p-6 max-w-3xl">
        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Store name"
            name="storeName"
            value={form.storeName || ""}
            onChange={onChange}
          />
          <Input
            label="Currency"
            name="currency"
            value={form.currency || ""}
            onChange={onChange}
          />
          <Input
            label="Support email"
            name="supportEmail"
            value={form.supportEmail || ""}
            onChange={onChange}
          />
          <Input
            label="Support phone"
            name="supportPhone"
            value={form.supportPhone || ""}
            onChange={onChange}
          />
          <Input
            label="WhatsApp number"
            name="whatsappNumber"
            value={form.whatsappNumber || ""}
            onChange={onChange}
          />
          <Input
            label="Instagram username"
            name="instagramUsername"
            value={form.instagramUsername || ""}
            onChange={onChange}
          />
          <Input
            label="Delivery time"
            name="deliveryTime"
            value={form.deliveryTime || ""}
            onChange={onChange}
          />
          <Input
            label="Same city delivery (Rs)"
            type="number"
            name="sameCityCharge"
            value={form.sameCityCharge ?? 150}
            onChange={onChange}
          />
          <Input
            label="Same province delivery (Rs)"
            type="number"
            name="sameProvinceCharge"
            value={form.sameProvinceCharge ?? 250}
            onChange={onChange}
          />
          <Input
            label="Other province delivery (Rs)"
            type="number"
            name="otherProvinceCharge"
            value={form.otherProvinceCharge ?? 350}
            onChange={onChange}
          />
          <Input
            label="Free delivery above (Rs)"
            type="number"
            name="freeDeliveryAbove"
            value={form.freeDeliveryAbove ?? 10000}
            onChange={onChange}
          />
          <label className="inline-flex items-center gap-2 text-sm self-end pb-2">
            <input
              type="checkbox"
              name="isStoreOpen"
              checked={Boolean(form.isStoreOpen)}
              onChange={onChange}
            />
            Store open
          </label>
          <label className="inline-flex items-center gap-2 text-sm self-end pb-2">
            <input
              type="checkbox"
              name="sameDayDelivery"
              checked={Boolean(form.sameDayDelivery)}
              onChange={onChange}
            />
            Same day delivery
          </label>
          <div className="sm:col-span-2">
            <TextArea
              label="Return policy"
              name="returnPolicy"
              value={form.returnPolicy || ""}
              onChange={onChange}
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label="Exchange policy"
              name="exchangePolicy"
              value={form.exchangePolicy || ""}
              onChange={onChange}
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label="Business hours"
              name="businessHours"
              value={form.businessHours || ""}
              onChange={onChange}
            />
          </div>
          {message && <p className="sm:col-span-2 text-sm text-accent">{message}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Card } from "../components/ui";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber,
          role: "Admin",
        });
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-sidebar text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, #0f766e55, transparent 40%), radial-gradient(circle at 80% 70%, #b4530944, transparent 35%)",
          }}
        />
        <div className="relative">
          <p className="font-display text-4xl">FashionHub</p>
          <p className="text-white/60 mt-2 text-sm tracking-wide uppercase">
            AI Sales Assistant
          </p>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-3xl leading-snug">
            Manage products, orders, and AI conversations in one place.
          </h2>
          <p className="text-white/60 mt-4 text-sm leading-relaxed">
            Reply to WhatsApp customers, train sales responses, and keep your
            catalog ready for Eid season and everyday bestsellers.
          </p>
        </div>
        <p className="relative text-xs text-white/40">© FashionHub Admin</p>
      </div>

      <div className="flex items-center justify-center p-6 bg-paper">
        <Card className="w-full max-w-md p-8 shadow-sm">
          <h1 className="font-display text-3xl mb-1">
            {mode === "login" ? "Welcome back" : "Create admin"}
          </h1>
          <p className="text-sm text-ink-soft mb-6">
            {mode === "login"
              ? "Sign in to the sales console"
              : "Register the first admin account"}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <Input
                  label="Full name"
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  required
                />
                <Input
                  label="Phone"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={onChange}
                />
              </>
            )}
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
            />

            {error && (
              <p className="text-sm text-danger bg-red-50 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Register"}
            </Button>
          </form>

          <p className="text-sm text-ink-soft mt-5 text-center">
            {mode === "login" ? (
              <>
                Need an account?{" "}
                <button
                  className="text-accent font-medium"
                  onClick={() => setMode("register")}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  className="text-accent font-medium"
                  onClick={() => setMode("login")}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
          <p className="text-center mt-3">
            <Link to="/" className="text-xs text-ink-soft">
              FashionHub Admin
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

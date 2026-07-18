export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-3xl text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-ink-soft mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-line rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const styles = {
    primary: "bg-accent text-white hover:bg-teal-800",
    secondary: "bg-paper-2 text-ink hover:bg-line border border-line",
    danger: "bg-danger text-white hover:bg-red-800",
    ghost: "bg-transparent text-ink-soft hover:bg-paper-2",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, className = "", ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-ink-soft">{label}</span>}
      <input
        className={`w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
        {...props}
      />
    </label>
  );
}

export function TextArea({ label, className = "", ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-ink-soft">{label}</span>}
      <textarea
        className={`w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-24 ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, className = "", ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-ink-soft">{label}</span>}
      <select
        className={`w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-paper-2 text-ink-soft",
    success: "bg-accent-soft text-accent",
    warning: "bg-amber-100 text-warn",
    danger: "bg-red-100 text-danger",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="text-center py-16 px-4">
      <p className="font-display text-xl text-ink">{title}</p>
      {description && <p className="text-sm text-ink-soft mt-2">{description}</p>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-20 text-ink-soft text-sm">
      Loading...
    </div>
  );
}

export function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-ink-soft">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

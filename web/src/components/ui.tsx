import { useEffect, useId, useState, type ReactNode } from "react";

interface NumberFieldProps {
  label: ReactNode;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
  prefix?: string;
  suffix?: string;
  hint?: ReactNode;
  className?: string;
}

/** Number input that lets people type freely and commits a clamped value. */
export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 1e9,
  step = 1,
  integer = false,
  prefix,
  suffix,
  hint,
  className = "",
}: NumberFieldProps) {
  const id = useId();
  const [text, setText] = useState(String(value));
  useEffect(() => {
    if (Number(text) !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (raw: string) => {
    const n = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(n)) return;
    const clamped = Math.min(max, Math.max(min, integer ? Math.round(n) : n));
    onChange(clamped);
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm text-muted">
        {label}
      </label>
      <div className="mt-1 flex items-center rounded-md border border-line bg-field focus-within:border-nimbus">
        {prefix && <span className="pl-3 text-muted">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode={integer ? "numeric" : "decimal"}
          className="num w-full min-w-0 bg-transparent px-3 py-2 text-ink outline-none"
          value={text}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            setText(e.target.value);
            commit(e.target.value);
          }}
          onBlur={() => setText(String(value))}
        />
        {suffix && <span className="pr-3 text-muted">{suffix}</span>}
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--nimbus)]"
      />
      <div>
        <label htmlFor={id} className="text-sm text-ink">
          {label}
        </label>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}

export function TierSwatch({ tier }: { tier: "cumulus" | "nimbus" | "stratus" }) {
  const bg = { cumulus: "bg-cumulus", nimbus: "bg-nimbus", stratus: "bg-stratus" }[tier];
  return <span aria-hidden className={`inline-block h-2.5 w-2.5 shrink-0 rounded-sm ${bg}`} />;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-md border px-3 py-2 text-sm ${
        tone === "error" ? "border-loss/50 text-loss" : "border-line text-muted"
      }`}
    >
      {children}
    </p>
  );
}

export function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {aside && <div className="text-sm text-muted">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

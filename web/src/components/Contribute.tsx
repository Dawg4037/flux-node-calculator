import { useRef, useState } from "react";

/** FLUX address for contributions toward development and hosting costs. */
export const CONTRIBUTION_ADDRESS = "t1ddHc7A9gqC7D9YBVczPW2tJLH9uFGfnXt";

export function Contribute() {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRIBUTION_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: select the address so it can be copied by hand.
      const el = codeRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <p className="text-ink">Help keep this calculator running</p>
      <p className="mt-1">
        Contributions in FLUX go toward development and hosting costs. Thank you for supporting it.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code ref={codeRef} className="num rounded border border-line bg-field px-2 py-1 text-sm break-all text-ink">
          {CONTRIBUTION_ADDRESS}
        </code>
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-md border border-ink px-3 py-1 text-sm font-medium text-ink"
        >
          {copied ? "Copied" : "Copy address"}
        </button>
        <span aria-live="polite" className="sr-only">
          {copied ? "Address copied to clipboard" : ""}
        </span>
      </div>
    </div>
  );
}

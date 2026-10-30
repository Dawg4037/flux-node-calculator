import { useEffect, useRef, useState } from "react";
import { AMAZON_STATEMENT, affiliatesActive } from "../affiliates.ts";
import { useT } from "../i18n/index.tsx";

/** Footer link that opens the privacy notice. */
export function PrivacyButton() {
  const t = useT().privacy;
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button type="button" className="underline" onClick={() => setOpen(true)}>
        {t.button}
      </button>
      <dialog
        ref={ref}
        aria-labelledby="privacy-title"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        className="m-auto max-h-[90vh] w-[min(40rem,calc(100vw-2rem))] rounded-lg border border-line bg-paper p-0 text-ink backdrop:bg-black/50"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-paper px-5 py-4">
          <h2 id="privacy-title" className="text-xl font-semibold tracking-tight">
            {t.title}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-line px-3 py-1 text-sm"
            autoFocus
          >
            {t.close}
          </button>
        </div>
        {open && (
          <div className="max-w-prose space-y-3 px-5 py-5 text-sm">
            <p>{t.intro}</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t.storage}</li>
              <li>{t.analytics}</li>
              <li>{t.lookup}</li>
              <li>{t.logs}</li>
              {affiliatesActive() && (
                <li>
                  {t.affiliate} <span lang="en">{AMAZON_STATEMENT}</span>
                </li>
              )}
            </ul>
            <p className="text-muted">{t.contact}</p>
          </div>
        )}
      </dialog>
    </>
  );
}

"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveSettings } from "@/app/admin/(panel)/settings/actions";
import type { SiteSettings } from "@/lib/settings";

export default function SettingsForm({ values }: { values: SiteSettings }) {
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await saveSettings(data);
      if (result.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-[720px] gap-6">
      {error && (
        <p role="alert" className="rounded-card border border-line border-l-4 border-l-oman bg-panel p-4 text-body-lg">
          {error}
        </p>
      )}

      <div className="grid gap-1.5">
        <label htmlFor="whatsapp" className="text-body-lg font-semibold">WhatsApp number</label>
        <input
          id="whatsapp"
          name="whatsapp"
          defaultValue={values.whatsapp}
          inputMode="numeric"
          autoComplete="off"
          required
          aria-describedby="whatsapp-help"
          className="field"
        />
        <p id="whatsapp-help" className="text-body text-muted">
          Digits only, with the country code and no plus sign. Kenya example: 254712345678.
          Every Order button on the site opens a chat with this number.
        </p>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="heroIntro" className="text-body-lg font-semibold">Hero intro text</label>
        <textarea
          id="heroIntro"
          name="heroIntro"
          defaultValue={values.heroIntro}
          rows={4}
          maxLength={300}
          required
          className="field !min-h-28 py-2"
        />
        <p className="text-body text-muted">The paragraph under the main headline. Up to 300 characters.</p>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="footerBlurb" className="text-body-lg font-semibold">Footer text</label>
        <textarea
          id="footerBlurb"
          name="footerBlurb"
          defaultValue={values.footerBlurb}
          rows={3}
          maxLength={200}
          required
          className="field !min-h-24 py-2"
        />
        <p className="text-body text-muted">A short description of the business. Up to 200 characters.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving" : "Save settings"}
        </button>
        <p role="status" className="text-body-lg font-semibold">
          {saved && "Saved. The website updates within a few seconds."}
        </p>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { saveProduct } from "@/app/admin/(panel)/products/actions";
import { KINDS } from "@/lib/kinds";
import type { ProductFormValues } from "@/lib/form-state";
import FileField from "./FileField";

type FieldProps = {
  label: string;
  name: string;
  defaultValue: string | number;
  help?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  step?: string;
};

function Field({ label, name, defaultValue, help, type = "text", required, maxLength, step }: FieldProps) {
  const id = `f-${name}`;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-body-lg font-semibold">{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        step={step}
        aria-describedby={help ? `${id}-help` : undefined}
        className="field"
      />
      {help && <p id={`${id}-help`} className="text-body text-muted">{help}</p>}
    </div>
  );
}

export default function ProductForm({ id, values }: { id: string | null; values: ProductFormValues }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const on = (e: Event) => setUploading(Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener("arwas:upload", on);
    return () => window.removeEventListener("arwas:upload", on);
  }, []);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const result = await saveProduct(id, data);
      if (result?.error) {
        setError(result.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  const specs = [0, 1, 2, 3].map((i) => values.specs[i] ?? { label: "", value: "" });

  return (
    <form onSubmit={onSubmit} className="grid max-w-[760px] gap-6">
      {error && (
        <p role="alert" className="rounded-card border border-line border-l-4 border-l-oman bg-panel p-4 text-body-lg">
          {error}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" name="name" defaultValue={values.name} required maxLength={80} />
        <Field
          label="Slug"
          name="slug"
          defaultValue={values.slug}
          maxLength={60}
          help="Leave empty to create it from the name."
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="kind" className="text-body-lg font-semibold">Product type</label>
        <select id="kind" name="kind" defaultValue={values.kind} className="field" aria-describedby="kind-help">
          {KINDS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <p id="kind-help" className="text-body text-muted">
          Sets the placeholder 3D shape and the shop filter. A 3D model file replaces the shape.
        </p>
      </div>

      <Field label="Tagline" name="tagline" defaultValue={values.tagline} required maxLength={120} />

      <div className="grid gap-1.5">
        <label htmlFor="description" className="text-body-lg font-semibold">Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue={values.description}
          required
          maxLength={600}
          rows={5}
          className="field !min-h-32 py-2"
        />
      </div>

      <fieldset className="grid gap-3 border-0 p-0">
        <legend className="mb-1 text-body-lg font-semibold">Details (up to 4 rows)</legend>
        {specs.map((s, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-2">
            <input
              name={`specLabel${i}`}
              defaultValue={s.label}
              maxLength={40}
              placeholder="Label, for example Fit"
              aria-label={`Detail ${i + 1} label`}
              className="field"
            />
            <input
              name={`specValue${i}`}
              defaultValue={s.value}
              maxLength={80}
              placeholder="Value, for example Relaxed, unisex"
              aria-label={`Detail ${i + 1} value`}
              className="field"
            />
          </div>
        ))}
      </fieldset>

      <Field
        label="Price"
        name="price"
        defaultValue={values.price}
        maxLength={40}
        help='Shown as written, for example "From KES 2,500". Leave empty to show "Request a quote".'
      />

      <FileField
        name="image"
        label="Photo"
        accept="image/png,image/jpeg,image/webp"
        folder="products"
        defaultValue={values.image}
        help="PNG, JPG or WebP. Shown on the shop card."
      />

      <FileField
        name="model"
        label="3D model"
        accept=".glb"
        folder="models"
        defaultValue={values.model}
        help="A .glb file. Leave empty to use the placeholder shape."
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="3D scale" name="scale" type="number" step="0.1" defaultValue={values.scale} help="Use 1 as the default." />
        <Field label="3D vertical offset" name="offsetY" type="number" step="0.1" defaultValue={values.offsetY} help="Moves the model up or down." />
        <Field label="Sort order" name="sortOrder" type="number" step="1" defaultValue={values.sortOrder} help="Lower numbers come first." />
      </div>

      <label className="flex min-h-11 items-center gap-3 text-body-lg">
        <input type="checkbox" name="published" defaultChecked={values.published} className="h-5 w-5" />
        Show this product on the website
      </label>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending || uploading} className="btn btn-primary">
          {pending ? "Saving" : uploading ? "Uploading photo" : "Save product"}
        </button>
        <Link href="/admin/products" className="btn btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}

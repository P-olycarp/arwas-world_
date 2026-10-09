"use client";

export default function DeleteButton({
  action,
  label,
}: {
  action: () => Promise<void>;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Delete ${label}? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <button type="submit" className="btn btn-secondary">Delete product</button>
    </form>
  );
}

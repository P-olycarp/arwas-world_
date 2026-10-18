"use client";

export default function DeleteOrderButton({
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
        if (!window.confirm(`Delete order ${label}? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <button type="submit" className="btn btn-subtle !px-3">Delete</button>
    </form>
  );
}
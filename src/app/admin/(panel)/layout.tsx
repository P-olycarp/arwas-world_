import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex min-h-14 max-w-[1100px] flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
          <nav aria-label="Admin" className="flex items-center gap-1">
            <span className="mr-3 font-semibold">Arwas World admin</span>
            <Link href="/admin/products" className="btn btn-subtle !px-3">Products</Link>
            <Link href="/" target="_blank" rel="noopener noreferrer" className="btn btn-subtle !px-3">
              View site
            </Link>
          </nav>
          <form action={logout} className="flex items-center gap-3">
            <span className="hidden text-body text-muted sm:inline">{session.email}</span>
            <button type="submit" className="btn btn-secondary !px-4">Sign out</button>
          </form>
        </div>
      </header>
      <main id="main" className="admin mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  );
}

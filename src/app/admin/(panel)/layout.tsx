import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between gap-3 px-4 sm:px-6">
          <span className="font-semibold">Arwas World admin</span>
          <form action={logout} className="flex items-center gap-3">
            <span className="hidden max-w-[16rem] truncate text-body text-muted md:inline">{session.email}</span>
            <button type="submit" className="btn btn-secondary !px-3">
              <LogOut size={18} aria-hidden />
              <span className="hidden sm:inline">Sign out</span>
              <span className="sr-only sm:hidden">Sign out</span>
            </button>
          </form>
        </div>
        <AdminNav />
      </header>
      <main id="main" className="admin mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </>
  );
}
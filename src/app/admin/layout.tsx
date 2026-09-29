import Link from "next/link";

export const runtime = "nodejs";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "./login/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-slate-900">
              TDSF Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/admin/yarismalar"
                className="text-slate-700 hover:text-slate-900"
              >
                Yarışmalar
              </Link>
              <Link href="/" className="text-slate-500 hover:text-slate-700">
                Siteyi Gör
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-slate-500">
              {user.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs border border-slate-300 rounded px-2 py-1 hover:bg-slate-100"
              >
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

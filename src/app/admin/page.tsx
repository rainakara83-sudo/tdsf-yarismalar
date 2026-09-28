import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./login/actions";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Yönetim Paneli</h1>
            <p className="text-sm text-slate-600 mt-1">
              Hoş geldin, <span className="font-medium">{user.email}</span>
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm border border-slate-300 rounded px-3 py-1.5 hover:bg-white"
            >
              Çıkış Yap
            </button>
          </form>
        </div>

        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Yarışmalar
          </h2>
          <p className="text-sm text-slate-500">
            Yarışma ekleme/düzenleme bir sonraki adımda gelecek.
          </p>
        </section>

        <p className="text-center mt-6 text-sm">
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            ← Ana sayfaya dön
          </Link>
        </p>
      </div>
    </main>
  );
}

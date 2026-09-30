import Link from "next/link";

export const runtime = "nodejs";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: toplam } = await supabase
    .from("yarismalar")
    .select("*", { count: "exact", head: true });

  const { count: yayinda } = await supabase
    .from("yarismalar")
    .select("*", { count: "exact", head: true })
    .eq("durum", "yayinda");

  const { count: taslak } = await supabase
    .from("yarismalar")
    .select("*", { count: "exact", head: true })
    .eq("durum", "taslak");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Yönetim Paneli</h1>
        <p className="text-sm text-slate-600 mt-1">
          Hoş geldin, <span className="font-medium">{user?.email}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Toplam</p>
          <p className="text-2xl font-bold text-slate-900">{toplam ?? 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Yayında</p>
          <p className="text-2xl font-bold text-green-700">{yayinda ?? 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Taslak</p>
          <p className="text-2xl font-bold text-slate-700">{taslak ?? 0}</p>
        </div>
      </div>

      <Link
        href="/admin/yarismalar"
        className="block bg-red-600 text-white text-center py-3 rounded-lg font-medium hover:bg-red-700"
      >
        Yarışmaları Yönet →
      </Link>
    </div>
  );
}

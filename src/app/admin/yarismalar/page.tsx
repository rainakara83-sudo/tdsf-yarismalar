import Link from "next/link";

export const runtime = "nodejs";
import { createClient } from "@/lib/supabase/server";
import { yarismaSil, yarismaKopya } from "./actions";
import SilButonu from "./SilButonu";
import KopyaButonu from "./KopyaButonu";

type UlkeRelation = { ad: string; kod: string | null } | { ad: string; kod: string | null }[] | null;

type Yarisma = {
  id: string;
  ad: string;
  baslangic_tarihi: string | null;
  bitis_tarihi: string | null;
  sehir: string | null;
  durum: string | null;
  ulke: UlkeRelation;
};

const aylarTr = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function tarihStr(tarih: string | null): string {
  if (!tarih) return "—";
  const d = new Date(tarih + "T00:00:00Z");
  return `${d.getUTCDate()} ${aylarTr[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function tarihAraligi(y: Yarisma): string {
  const bas = tarihStr(y.baslangic_tarihi);
  const bit = tarihStr(y.bitis_tarihi);
  if (!y.baslangic_tarihi && !y.bitis_tarihi) return "—";
  if (!y.bitis_tarihi || y.baslangic_tarihi === y.bitis_tarihi) return bas;
  return `${bas} – ${bit}`;
}

function ilk<T>(liste: T | T[] | null | undefined): T | null {
  if (!liste) return null;
  return Array.isArray(liste) ? (liste[0] ?? null) : liste;
}

const durumRenk: Record<string, string> = {
  taslak: "bg-slate-100 text-slate-700 border-slate-200",
  yayinda: "bg-green-100 text-green-700 border-green-200",
  iptal: "bg-red-100 text-red-700 border-red-200",
};

const durumEtiket: Record<string, string> = {
  taslak: "Taslak",
  yayinda: "Yayında",
  iptal: "İptal",
};

export default async function AdminYarismalarPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("yarismalar")
    .select(
      "id, ad, baslangic_tarihi, bitis_tarihi, sehir, durum, ulke:ulkeler(ad, kod)"
    )
    .order("baslangic_tarihi", { ascending: false });

  const liste = (data ?? []) as unknown as Yarisma[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yarışmalar</h1>
          <p className="text-sm text-slate-500 mt-1">
            Toplam {liste.length} yarışma
          </p>
        </div>
        <Link
          href="/admin/yarismalar/yeni"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          + Yeni Yarışma
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error.message}
        </p>
      )}

      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Ad</th>
              <th className="text-left px-3 py-2 font-medium">Tarih</th>
              <th className="text-left px-3 py-2 font-medium">Konum</th>
              <th className="text-left px-3 py-2 font-medium">Durum</th>
              <th className="text-right px-3 py-2 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {liste.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-slate-500 py-8">
                  Henüz yarışma yok. "Yeni Yarışma" ile başla.
                </td>
              </tr>
            )}
            {liste.map((y) => {
              const ulke = ilk(y.ulke);
              const konum = [ulke?.ad, y.sehir].filter(Boolean).join(", ") || "—";
              const durum = y.durum ?? "taslak";
              return (
                <tr key={y.id} className="border-t border-slate-200">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">{y.ad}</div>
                    <Link
                      href={`/yarisma/${y.id}`}
                      className="text-xs text-slate-500 hover:underline"
                      target="_blank"
                    >
                      Detay sayfası ↗
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                    {tarihAraligi(y)}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{konum}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs border rounded-full px-2 py-0.5 ${
                        durumRenk[durum] ?? durumRenk.taslak
                      }`}
                    >
                      {durumEtiket[durum] ?? durum}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <div className="inline-flex gap-2">
                      <Link
                        href={`/admin/yarismalar/${y.id}/duzenle`}
                        className="text-xs border border-slate-300 rounded px-2 py-1 hover:bg-slate-100"
                      >
                        Düzenle
                      </Link>
                      <form action={yarismaKopya.bind(null, y.id)}>
                        <KopyaButonu id={y.id} ad={y.ad} />
                      </form>
                      <form action={yarismaSil.bind(null, y.id)}>
                        <SilButonu id={y.id} ad={y.ad} />
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

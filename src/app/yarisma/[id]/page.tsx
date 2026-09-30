import Link from "next/link";

export const runtime = "nodejs";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sekmeler from "@/components/Sekmeler";
import { bayrak } from "@/components/TakvimGun";

type UlkeRelation = { ad: string; kod: string | null } | { ad: string; kod: string | null }[] | null;
type DalRelation = { ad: string } | { ad: string }[] | null;
type YasRelation = { ad: string } | { ad: string }[] | null;

type Yarisma = {
  id: string;
  ad: string;
  baslangic_tarihi: string | null;
  bitis_tarihi: string | null;
  sehir: string | null;
  salon: string | null;
  organizator: string | null;
  organizasyon: string | null;
  kayit_son_tarihi: string | null;
  kayit_linki: string | null;
  program_linki: string | null;
  sonuc_linki: string | null;
  tr_katilim_var_mi: boolean | null;
  notlar: string | null;
  son_guncelleme: string | null;
  ulke: UlkeRelation;
  yarisma_dallar: { dal: DalRelation }[];
  yarisma_yas_gruplari: { yas_grubu: YasRelation }[];
};

const aylarTr = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function uzunTarih(tarih: string | null): string {
  if (!tarih) return "";
  const d = new Date(tarih + "T00:00:00Z");
  return `${d.getUTCDate()} ${aylarTr[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function gunFarki(tarih: string): number {
  const hedef = new Date(tarih + "T00:00:00Z");
  const bugun = new Date();
  bugun.setUTCHours(0, 0, 0, 0);
  const farkMs = hedef.getTime() - bugun.getTime();
  return Math.round(farkMs / (1000 * 60 * 60 * 24));
}

function iliskileri<T extends { ad: string }>(
  liste: T | T[] | null | undefined
): T[] {
  if (!liste) return [];
  return Array.isArray(liste) ? liste : [liste];
}

function ilk<T>(liste: T | T[] | null | undefined): T | null {
  if (!liste) return null;
  return Array.isArray(liste) ? (liste[0] ?? null) : liste;
}

export default async function YarismaDetay({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("yarismalar")
    .select(
      `id,
       ad,
       baslangic_tarihi,
       bitis_tarihi,
       sehir,
       salon,
       organizator,
       organizasyon,
       kayit_son_tarihi,
       kayit_linki,
       program_linki,
       sonuc_linki,
       tr_katilim_var_mi,
       notlar,
       son_guncelleme,
       ulke:ulkeler(ad, kod),
       yarisma_dallar(dal:dallar(ad)),
       yarisma_yas_gruplari(yas_grubu:yas_gruplari(ad))`
    )
    .eq("id", id)
    .eq("durum", "yayinda")
    .single();

  if (error || !data) {
    notFound();
  }

  const yarisma = data as unknown as Yarisma;
  const ulke = ilk(yarisma.ulke);
  const ulkeAdi = ulke?.ad ?? "";
  const ulkeKod = ulke?.kod ?? null;

  const bas = yarisma.baslangic_tarihi;
  const bit = yarisma.bitis_tarihi;
  const tarihAraligiStr =
    bas && bit && bas !== bit
      ? `${uzunTarih(bas)} – ${uzunTarih(bit)}`
      : uzunTarih(bas || bit);

  const dallar = yarisma.yarisma_dallar
    .flatMap((yd) => iliskileri(yd.dal).map((d) => d.ad))
    .filter(Boolean);
  const yasGruplari = yarisma.yarisma_yas_gruplari
    .flatMap((yg) => iliskileri(yg.yas_grubu).map((y) => y.ad))
    .filter(Boolean);

  let uyari: { tip: "kirmizi" | "sari" | "mavi"; mesaj: string } | null = null;
  if (yarisma.kayit_son_tarihi) {
    const gun = gunFarki(yarisma.kayit_son_tarihi);
    if (gun < 0) {
      uyari = {
        tip: "kirmizi",
        mesaj: "Kayıtlar kapandı",
      };
    } else if (gun === 0) {
      uyari = {
        tip: "kirmizi",
        mesaj: "Kayıt son günü — bugün!",
      };
    } else if (gun <= 7) {
      uyari = {
        tip: "sari",
        mesaj: `⚠️ Kayıt son günü yaklaşıyor! ${gun} gün kaldı`,
      };
    } else if (gun <= 30) {
      uyari = {
        tip: "mavi",
        mesaj: `ℹ️ Son günler, ${gun} gün içinde kayıt bitiyor`,
      };
    }
  }

  const uyariRenk =
    uyari?.tip === "kirmizi"
      ? "bg-red-100 text-red-800 border border-red-300"
      : uyari?.tip === "sari"
      ? "bg-amber-100 text-amber-800 border border-amber-300"
      : "bg-red-100 text-red-800 border border-red-300";

  return (
    <main className="min-h-screen bg-white text-slate-900 px-4 py-8 max-w-3xl mx-auto">
      <Sekmeler aktif="liste" />

      <Link
        href="/"
        className="inline-block text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        ← Geri
      </Link>

      {uyari && (
        <div className={`${uyariRenk} rounded-lg px-4 py-3 mb-6 text-sm font-medium`}>
          {uyari.mesaj}
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-3xl font-bold">{yarisma.ad}</h1>
        {tarihAraligiStr && (
          <p className="text-slate-600 mt-2">{tarihAraligiStr}</p>
        )}
        {ulkeAdi && (
          <p className="text-slate-600 text-lg mt-1">
            <span className="mr-1">{bayrak(ulkeKod)}</span>
            {ulkeAdi}
            {yarisma.sehir ? `, ${yarisma.sehir}` : ""}
          </p>
        )}
      </header>

      <section className="space-y-4 mb-6">
        {yarisma.salon && (
          <SatirBaslik baslik="Salon" deger={yarisma.salon} />
        )}
        {yarisma.organizator && (
          <SatirBaslik baslik="Organizatör" deger={yarisma.organizator} />
        )}
        {yarisma.organizasyon && (
          <SatirBaslik baslik="Organizasyon" deger={yarisma.organizasyon} />
        )}

        {dallar.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-slate-700 mb-2">Dallar</h2>
            <div className="flex flex-wrap gap-2">
              {dallar.map((d) => (
                <span
                  key={d}
                  className="inline-block bg-slate-100 text-slate-800 text-xs px-3 py-1 rounded-full"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {yasGruplari.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-slate-700 mb-2">Yaş grupları</h2>
            <div className="flex flex-wrap gap-2">
              {yasGruplari.map((yg) => (
                <span
                  key={yg}
                  className="inline-block bg-slate-100 text-slate-800 text-xs px-3 py-1 rounded-full"
                >
                  {yg}
                </span>
              ))}
            </div>
          </div>
        )}

        {yarisma.kayit_son_tarihi && (
          <SatirBaslik
            baslik="Kayıt son tarihi"
            deger={uzunTarih(yarisma.kayit_son_tarihi)}
          />
        )}

        {(yarisma.kayit_linki ||
          yarisma.program_linki ||
          yarisma.sonuc_linki) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {yarisma.kayit_linki && (
              <a
                href={yarisma.kayit_linki}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
              >
                Kayıt Ol
              </a>
            )}
            {yarisma.program_linki && (
              <a
                href={yarisma.program_linki}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-slate-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-800"
              >
                Program
              </a>
            )}
            {yarisma.sonuc_linki && (
              <a
                href={yarisma.sonuc_linki}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-slate-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-800"
              >
                Sonuçlar
              </a>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-slate-200">
          <p className="text-sm">
            <span className="font-medium text-slate-700">Türkiye katılımı:</span>{" "}
            {yarisma.tr_katilim_var_mi ? (
              <span className="text-green-700">✓ Evet</span>
            ) : (
              <span className="text-slate-500">✗ Hayır</span>
            )}
          </p>
        </div>

        {yarisma.notlar && (
          <div className="pt-2">
            <h2 className="text-sm font-medium text-slate-700 mb-1">Notlar</h2>
            <p className="text-sm text-slate-600 whitespace-pre-line">
              {yarisma.notlar}
            </p>
          </div>
        )}

        {yarisma.son_guncelleme && (
          <p className="text-xs text-slate-400 pt-4">
            Son güncelleme:{" "}
            {new Date(yarisma.son_guncelleme).toLocaleString("tr-TR", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        )}
      </section>
    </main>
  );
}

function SatirBaslik({ baslik, deger }: { baslik: string; deger: string }) {
  return (
    <p className="text-sm">
      <span className="font-medium text-slate-700">{baslik}:</span>{" "}
      <span className="text-slate-600">{deger}</span>
    </p>
  );
}

import { createClient } from "@/lib/supabase/server";

type Ulke = { ad: string };
type Dal = { dallar: { ad: string } | { ad: string }[] };
type YasGrubu = { yas_gruplari: { ad: string } | { ad: string }[] };

type Yarisma = {
  id: string;
  ad: string;
  baslangic_tarihi: string | null;
  bitis_tarihi: string | null;
  sehir: string | null;
  ulkeler: Ulke | Ulke[] | null;
  yarisma_dallar: Dal[];
  yarisma_yas_gruplari: YasGrubu[];
};

const aylarTr = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

function tarihStr(tarih: string | null): string {
  if (!tarih) return "";
  const d = new Date(tarih + "T00:00:00Z");
  const gun = d.getUTCDate();
  const ay = aylarTr[d.getUTCMonth()];
  const yil = d.getUTCFullYear();
  return `${gun} ${ay} ${yil}`;
}

function tarihAraligi(yarisma: Yarisma): string {
  const bas = tarihStr(yarisma.baslangic_tarihi);
  const bit = tarihStr(yarisma.bitis_tarihi);
  if (!bas && !bit) return "Tarih belirtilmedi";
  if (!bit || bas === bit) return bas;
  return `${bas} – ${bit}`;
}

function iliskileri<T extends { ad: string }>(
  liste: { ad: string } | { ad: string }[] | null | undefined
): string[] {
  if (!liste) return [];
  if (Array.isArray(liste)) return liste.map((x) => x.ad);
  return [liste.ad];
}

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("yarismalar")
    .select(`
      id,
      ad,
      baslangic_tarihi,
      bitis_tarihi,
      sehir,
      ulkeler ( ad ),
      yarisma_dallar ( dallar ( ad ) ),
      yarisma_yas_gruplari ( yas_gruplari ( ad ) )
    `)
    .eq("durum", "yayinda")
    .order("baslangic_tarihi", { ascending: true });

  const yarismalar = (data ?? []) as unknown as Yarisma[];

  const bugun = new Date();
  bugun.setUTCHours(0, 0, 0, 0);
  const bugunStr = bugun.toISOString().slice(0, 10);

  const yaklasanlar = yarismalar.filter(
    (y) => y.baslangic_tarihi && y.baslangic_tarihi >= bugunStr
  );
  const gecmisler = yarismalar.filter(
    (y) => y.baslangic_tarihi && y.baslangic_tarihi < bugunStr
  );

  return (
    <main className="min-h-screen bg-white text-slate-900 px-4 py-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Yaklaşan Dans Yarışmaları</h1>
        <p className="text-slate-600 mt-2">
          Türkiye Dans Sporları Federasyonu
        </p>
      </header>

      {error && (
        <p className="text-red-600 text-sm mb-4">
          Veri yüklenirken bir sorun oluştu.
        </p>
      )}

      {yarismalar.length === 0 ? (
        <section className="space-y-4 text-slate-700">
          <p>Henüz yarışma yok.</p>
        </section>
      ) : (
        <>
          {yaklasanlar.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-slate-800">Yaklaşan</h2>
              <ul className="space-y-3">
                {yaklasanlar.map((y) => (
                  <YarismaKarti key={y.id} yarisma={y} />
                ))}
              </ul>
            </section>
          )}
          {gecmisler.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-500">Geçmiş</h2>
              <ul className="space-y-3">
                {gecmisler.map((y) => (
                  <YarismaKarti key={y.id} yarisma={y} soluk />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function YarismaKarti({ yarisma, soluk = false }: { yarisma: Yarisma; soluk?: boolean }) {
  const ulke = iliskileri(
    Array.isArray(yarisma.ulkeler) ? yarisma.ulkeler[0] : yarisma.ulkeler
  ).join(", ");
  const dallar = yarisma.yarisma_dallar
    .flatMap((yd) =>
      iliskileri(Array.isArray(yd.dallar) ? yd.dallar[0] : yd.dallar)
    )
    .filter(Boolean);
  const yasGruplari = yarisma.yarisma_yas_gruplari
    .flatMap((yg) =>
      iliskileri(
        Array.isArray(yg.yas_gruplari) ? yg.yas_gruplari[0] : yg.yas_gruplari
      )
    )
    .filter(Boolean);

  const konum = [ulke, yarisma.sehir].filter(Boolean).join(", ");

  return (
    <li
      className={`border border-slate-200 rounded-lg p-4 ${
        soluk ? "opacity-60" : ""
      }`}
    >
      <h3 className="font-semibold text-lg">{yarisma.ad}</h3>
      <p className="text-sm text-slate-600 mt-1">{tarihAraligi(yarisma)}</p>
      {konum && <p className="text-sm text-slate-600">{konum}</p>}
      {dallar.length > 0 && (
        <p className="text-sm text-slate-700 mt-2">
          <span className="font-medium">Dallar:</span> {dallar.join(", ")}
        </p>
      )}
      {yasGruplari.length > 0 && (
        <p className="text-sm text-slate-700">
          <span className="font-medium">Yaş grupları:</span>{" "}
          {yasGruplari.join(", ")}
        </p>
      )}
    </li>
  );
}

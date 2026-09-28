import { createClient } from "@/lib/supabase/server";
import FiltersBar, { type FilterOption } from "@/components/FiltersBar";
import Sekmeler from "@/components/Sekmeler";
import Link from "next/link";

type UlkeRelation = { ad: string; kod: string | null } | { ad: string; kod: string | null }[] | null;
type DalRelation = { id: string; ad: string } | { id: string; ad: string }[] | null;
type YasRelation = { id: string; ad: string } | { id: string; ad: string }[] | null;

type Yarisma = {
  id: string;
  ad: string;
  baslangic_tarihi: string | null;
  bitis_tarihi: string | null;
  sehir: string | null;
  tr_katilim_var_mi: boolean | null;
  ulke: UlkeRelation;
  yarisma_dallar: { dal: DalRelation }[];
  yarisma_yas_gruplari: { yas_grubu: YasRelation }[];
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

function tarihAraligi(y: Yarisma): string {
  const bas = tarihStr(y.baslangic_tarihi);
  const bit = tarihStr(y.bitis_tarihi);
  if (!bas && !bit) return "Tarih belirtilmedi";
  if (!bit || bas === bit) return bas;
  return `${bas} – ${bit}`;
}

function ilk<T>(liste: T | T[] | null | undefined): T | null {
  if (!liste) return null;
  return Array.isArray(liste) ? (liste[0] ?? null) : liste;
}

function iliskileri<T>(liste: T | T[] | null | undefined): T[] {
  if (!liste) return [];
  return Array.isArray(liste) ? liste : [liste];
}

type SearchParams = {
  ulke?: string;
  dal?: string;
  yas?: string;
  tr?: string;
  baslangic?: string;
  bitis?: string;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const ulkeFilter = sp.ulke ?? "";
  const dalIds = (sp.dal ?? "").split(",").filter(Boolean);
  const yasIds = (sp.yas ?? "").split(",").filter(Boolean);
  const trFilter = sp.tr === "1";
  const baslangicFilter = sp.baslangic ?? "";
  const bitisFilter = sp.bitis ?? "";

  const aktifFiltreSayisi =
    (ulkeFilter ? 1 : 0) +
    (dalIds.length > 0 ? 1 : 0) +
    (yasIds.length > 0 ? 1 : 0) +
    (trFilter ? 1 : 0) +
    (baslangicFilter ? 1 : 0) +
    (bitisFilter ? 1 : 0);

  const supabase = await createClient();

  const { data: ulkelerData } = await supabase
    .from("ulkeler")
    .select("id, ad")
    .order("sira", { ascending: true })
    .order("ad", { ascending: true });
  const ulkeler: FilterOption[] = ulkelerData ?? [];

  const { data: dallarData } = await supabase
    .from("dallar")
    .select("id, ad")
    .order("sira", { ascending: true })
    .order("ad", { ascending: true });
  const dallar: FilterOption[] = dallarData ?? [];

  const { data: yasData } = await supabase
    .from("yas_gruplari")
    .select("id, ad")
    .order("sira", { ascending: true })
    .order("ad", { ascending: true });
  const yasGruplari: FilterOption[] = yasData ?? [];

  let sorgu = supabase
    .from("yarismalar")
    .select(
      `id,
       ad,
       baslangic_tarihi,
       bitis_tarihi,
       sehir,
       tr_katilim_var_mi,
       ulke:ulkeler(ad, kod),
       yarisma_dallar(dal:dallar(id, ad)),
       yarisma_yas_gruplari(yas_grubu:yas_gruplari(id, ad))`
    )
    .eq("durum", "yayinda")
    .order("baslangic_tarihi", { ascending: true });

  if (ulkeFilter) {
    sorgu = sorgu.eq("ulke_id", ulkeFilter);
  }
  if (trFilter) {
    sorgu = sorgu.eq("tr_katilim_var_mi", true);
  }
  if (baslangicFilter) {
    sorgu = sorgu.gte("baslangic_tarihi", baslangicFilter);
  }
  if (bitisFilter) {
    sorgu = sorgu.lte("baslangic_tarihi", bitisFilter);
  }

  const { data, error } = await sorgu;
  const tumu = (data ?? []) as unknown as Yarisma[];

  const filtreli = tumu.filter((y) => {
    if (dalIds.length > 0) {
      const yDallar = y.yarisma_dallar.flatMap((yd) =>
        iliskileri(yd.dal).map((d) => d.id)
      );
      const kesisim = dalIds.some((id) => yDallar.includes(id));
      if (!kesisim) return false;
    }
    if (yasIds.length > 0) {
      const yYas = y.yarisma_yas_gruplari.flatMap((yg) =>
        iliskileri(yg.yas_grubu).map((y) => y.id)
      );
      const kesisim = yasIds.some((id) => yYas.includes(id));
      if (!kesisim) return false;
    }
    return true;
  });

  const bugun = new Date();
  bugun.setUTCHours(0, 0, 0, 0);
  const bugunStr = bugun.toISOString().slice(0, 10);
  const yaklasanlar = filtreli.filter(
    (y) => y.baslangic_tarihi && y.baslangic_tarihi >= bugunStr
  );
  const gecmisler = filtreli.filter(
    (y) => y.baslangic_tarihi && y.baslangic_tarihi < bugunStr
  );

  const ulkeAdlari = new Map(ulkeler.map((u) => [u.id, u.ad]));
  const dalAdlari = new Map(dallar.map((d) => [d.id, d.ad]));
  const yasAdlari = new Map(yasGruplari.map((y) => [y.id, y.ad]));

  return (
    <main className="min-h-screen bg-white text-slate-900 px-4 py-8 max-w-3xl mx-auto">
      <Sekmeler aktif="liste" />
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Yaklaşan Dans Yarışmaları</h1>
        <p className="text-slate-600 mt-2">
          Türkiye Dans Sporları Federasyonu
        </p>
        <p className="text-sm text-slate-500 mt-2">
          {filtreli.length} yarışma bulundu
        </p>
      </header>

      <FiltersBar
        ulkeler={ulkeler}
        dallar={dallar}
        yasGruplari={yasGruplari}
      />

      {aktifFiltreSayisi > 0 && (
        <AktifFiltreEtiketleri
          ulkeFilter={ulkeFilter}
          dalIds={dalIds}
          yasIds={yasIds}
          trFilter={trFilter}
          baslangicFilter={baslangicFilter}
          bitisFilter={bitisFilter}
          ulkeAdlari={ulkeAdlari}
          dalAdlari={dalAdlari}
          yasAdlari={yasAdlari}
        />
      )}

      {error && (
        <p className="text-red-600 text-sm mb-4">
          Veri yüklenirken bir sorun oluştu.
        </p>
      )}

      {filtreli.length === 0 ? (
        <section className="space-y-4 text-slate-700">
          <p>Filtrelere uyan yarışma yok.</p>
        </section>
      ) : (
        <>
          {yaklasanlar.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-slate-800">
                Yaklaşan
              </h2>
              <ul className="space-y-3">
                {yaklasanlar.map((y) => (
                  <YarismaKarti key={y.id} yarisma={y} />
                ))}
              </ul>
            </section>
          )}
          {gecmisler.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-500">
                Geçmiş
              </h2>
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

function AktifFiltreEtiketleri({
  ulkeFilter,
  dalIds,
  yasIds,
  trFilter,
  baslangicFilter,
  bitisFilter,
  ulkeAdlari,
  dalAdlari,
  yasAdlari,
}: {
  ulkeFilter: string;
  dalIds: string[];
  yasIds: string[];
  trFilter: boolean;
  baslangicFilter: string;
  bitisFilter: string;
  ulkeAdlari: Map<string, string>;
  dalAdlari: Map<string, string>;
  yasAdlari: Map<string, string>;
}) {
  const etiketler: string[] = [];
  if (ulkeFilter && ulkeAdlari.has(ulkeFilter))
    etiketler.push(`Ülke: ${ulkeAdlari.get(ulkeFilter)}`);
  for (const id of dalIds)
    if (dalAdlari.has(id)) etiketler.push(`Dal: ${dalAdlari.get(id)}`);
  for (const id of yasIds)
    if (yasAdlari.has(id)) etiketler.push(`Yaş: ${yasAdlari.get(id)}`);
  if (trFilter) etiketler.push("TR katılımı var");
  if (baslangicFilter) etiketler.push(`Başlangıç ≥ ${baslangicFilter}`);
  if (bitisFilter) etiketler.push(`Bitiş ≤ ${bitisFilter}`);

  if (etiketler.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {etiketler.map((e) => (
        <span
          key={e}
          className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-1"
        >
          {e}
        </span>
      ))}
    </div>
  );
}

function YarismaKarti({ yarisma, soluk = false }: { yarisma: Yarisma; soluk?: boolean }) {
  const ulke = ilk(yarisma.ulke);
  const ulkeAdi = ulke?.ad ?? "";
  const dallar = yarisma.yarisma_dallar
    .flatMap((yd) => iliskileri(yd.dal).map((d) => d.ad))
    .filter(Boolean);
  const yasGruplari = yarisma.yarisma_yas_gruplari
    .flatMap((yg) => iliskileri(yg.yas_grubu).map((y) => y.ad))
    .filter(Boolean);

  const konum = [ulkeAdi, yarisma.sehir].filter(Boolean).join(", ");

  return (
    <li>
      <Link
        href={`/yarisma/${yarisma.id}`}
        className={`block border border-slate-200 rounded-lg p-4 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer ${
          soluk ? "opacity-60" : ""
        }`}
      >
        <h3 className="font-semibold text-lg">{yarisma.ad}</h3>
        <p className="text-sm text-slate-600 mt-1">{tarihAraligi(yarisma)}</p>
        {konum && <p className="text-sm text-slate-600">{konum}</p>}
        {yarisma.tr_katilim_var_mi && (
          <p className="text-xs text-green-700 mt-1">🇹🇷 Türk katılımcı var</p>
        )}
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
      </Link>
    </li>
  );
}

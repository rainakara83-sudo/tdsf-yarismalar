import Link from "next/link";

export const runtime = "nodejs";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import YarismaForm from "../../YarismaForm";
import { yarismaGuncelle, yarismaSil, yarismaKopya } from "../../actions";
import SilButonu from "../../SilButonu";
import KopyaButonu from "./KopyaButonu";

type DalRelation = { dal_id: string } | { dal_id: string }[] | null;
type YasRelation = { yas_grubu_id: string } | { yas_grubu_id: string }[] | null;

function ids<T extends string>(liste: T | T[] | null | undefined): string[] {
  if (!liste) return [];
  return Array.isArray(liste) ? liste : [liste];
}

export default async function DuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: ulkeler },
    { data: dallar },
    { data: yasGruplari },
    { data: y, error },
  ] = await Promise.all([
    supabase.from("ulkeler").select("id, ad").order("ad"),
    supabase.from("dallar").select("id, ad").order("sira").order("ad"),
    supabase.from("yas_gruplari").select("id, ad").order("sira").order("ad"),
    supabase
      .from("yarismalar")
      .select("*, yarisma_dallar(dal_id), yarisma_yas_gruplari(yas_grubu_id)")
      .eq("id", id)
      .single(),
  ]);

  if (error || !y) notFound();

  const dalIds = (y.yarisma_dallar ?? []).flatMap((x: DalRelation) =>
    ids((x as { dal_id: string }).dal_id)
  );
  const yasIds = (y.yarisma_yas_gruplari ?? []).flatMap((x: YasRelation) =>
    ids((x as { yas_grubu_id: string }).yas_grubu_id)
  );

  const values = {
    ad: y.ad ?? "",
    baslangic_tarihi: y.baslangic_tarihi ?? "",
    bitis_tarihi: y.bitis_tarihi ?? "",
    ulke_id: y.ulke_id ?? "",
    sehir: y.sehir ?? "",
    salon: y.salon ?? "",
    organizator: y.organizator ?? "",
    organizasyon: y.organizasyon ?? "",
    kayit_son_tarihi: y.kayit_son_tarihi ?? "",
    kayit_linki: y.kayit_linki ?? "",
    program_linki: y.program_linki ?? "",
    sonuc_linki: y.sonuc_linki ?? "",
    tr_katilim_var_mi: !!y.tr_katilim_var_mi,
    notlar: y.notlar ?? "",
    durum: y.durum ?? "taslak",
    dalIds,
    yasIds,
  };

  const action = yarismaGuncelle.bind(null, id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Yarışmayı Düzenle</h1>
        <Link
          href="/admin/yarismalar"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Listeye dön
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6">
        <YarismaForm
          ulkeler={ulkeler ?? []}
          dallar={dallar ?? []}
          yasGruplari={yasGruplari ?? []}
          values={values}
          action={action}
          submitLabel="Güncelle"
          iptalHref="/admin/yarismalar"
          extra={
            <div className="ml-auto flex items-center gap-2">
              <form action={yarismaKopya.bind(null, id)}>
                <KopyaButonu id={id} ad={y.ad ?? ""} />
              </form>
              <form action={yarismaSil.bind(null, id)}>
                <SilButonu id={id} ad={y.ad ?? ""} />
              </form>
            </div>
          }
        />
      </div>
    </div>
  );
}

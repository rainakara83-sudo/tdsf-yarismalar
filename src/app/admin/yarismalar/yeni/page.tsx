import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import YarismaForm from "../YarismaForm";
import { yarismaEkle } from "../actions";

export default async function YeniYarismaPage() {
  const supabase = await createClient();

  const [{ data: ulkeler }, { data: dallar }, { data: yasGruplari }] =
    await Promise.all([
      supabase.from("ulkeler").select("id, ad").order("ad"),
      supabase.from("dallar").select("id, ad").order("sira").order("ad"),
      supabase.from("yas_gruplari").select("id, ad").order("sira").order("ad"),
    ]);

  const empty = {
    ad: "",
    baslangic_tarihi: "",
    bitis_tarihi: "",
    ulke_id: "",
    sehir: "",
    salon: "",
    organizator: "",
    organizasyon: "",
    kayit_son_tarihi: "",
    kayit_linki: "",
    program_linki: "",
    sonuc_linki: "",
    tr_katilim_var_mi: false,
    notlar: "",
    durum: "taslak",
    dalIds: [],
    yasIds: [],
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Yeni Yarışma</h1>
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
          values={empty}
          action={yarismaEkle}
          submitLabel="Kaydet"
          iptalHref="/admin/yarismalar"
        />
      </div>
    </div>
  );
}

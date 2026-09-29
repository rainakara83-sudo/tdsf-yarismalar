"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function authAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

function toStr(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

function toBool(v: FormDataEntryValue | null): boolean {
  return v?.toString() === "on";
}

export async function yarismaEkle(formData: FormData): Promise<void> {
  const supabase = await authAdmin();
  const dallarIds = formData.getAll("dal").map(String).filter(Boolean);
  const yasIds = formData.getAll("yas").map(String).filter(Boolean);

  const { data: y, error: oerr } = await supabase
    .from("yarismalar")
    .insert({
      ad: toStr(formData.get("ad")) || "",
      baslangic_tarihi: toStr(formData.get("baslangic_tarihi")),
      bitis_tarihi: toStr(formData.get("bitis_tarihi")),
      ulke_id: toStr(formData.get("ulke_id")),
      sehir: toStr(formData.get("sehir")),
      salon: toStr(formData.get("salon")),
      organizator: toStr(formData.get("organizator")),
      organizasyon: toStr(formData.get("organizasyon")),
      kayit_son_tarihi: toStr(formData.get("kayit_son_tarihi")),
      kayit_linki: toStr(formData.get("kayit_linki")),
      program_linki: toStr(formData.get("program_linki")),
      sonuc_linki: toStr(formData.get("sonuc_linki")),
      tr_katilim_var_mi: toBool(formData.get("tr_katilim_var_mi")),
      notlar: toStr(formData.get("notlar")),
      durum: toStr(formData.get("durum")) || "taslak",
    })
    .select()
    .single();

  if (oerr) throw new Error(oerr.message);

  if (dallarIds.length && y) {
    await supabase
      .from("yarisma_dallar")
      .insert(dallarIds.map((dal_id) => ({ yarisma_id: y.id, dal_id })));
  }
  if (yasIds.length && y) {
    await supabase
      .from("yarisma_yas_gruplari")
      .insert(yasIds.map((yas_grubu_id) => ({ yarisma_id: y.id, yas_grubu_id })));
  }

  revalidatePath("/");
  revalidatePath("/takvim");
  revalidatePath("/admin/yarismalar");
  redirect("/admin/yarismalar");
}

export async function yarismaGuncelle(
  id: string,
  formData: FormData
): Promise<void> {
  const supabase = await authAdmin();
  const dallarIds = formData.getAll("dal").map(String).filter(Boolean);
  const yasIds = formData.getAll("yas").map(String).filter(Boolean);

  const { error: uerr } = await supabase
    .from("yarismalar")
    .update({
      ad: toStr(formData.get("ad")) || "",
      baslangic_tarihi: toStr(formData.get("baslangic_tarihi")),
      bitis_tarihi: toStr(formData.get("bitis_tarihi")),
      ulke_id: toStr(formData.get("ulke_id")),
      sehir: toStr(formData.get("sehir")),
      salon: toStr(formData.get("salon")),
      organizator: toStr(formData.get("organizator")),
      organizasyon: toStr(formData.get("organizasyon")),
      kayit_son_tarihi: toStr(formData.get("kayit_son_tarihi")),
      kayit_linki: toStr(formData.get("kayit_linki")),
      program_linki: toStr(formData.get("program_linki")),
      sonuc_linki: toStr(formData.get("sonuc_linki")),
      tr_katilim_var_mi: toBool(formData.get("tr_katilim_var_mi")),
      notlar: toStr(formData.get("notlar")),
      durum: toStr(formData.get("durum")) || "taslak",
    })
    .eq("id", id);

  if (uerr) throw new Error(uerr.message);

  await supabase.from("yarisma_dallar").delete().eq("yarisma_id", id);
  await supabase.from("yarisma_yas_gruplari").delete().eq("yarisma_id", id);

  if (dallarIds.length) {
    await supabase
      .from("yarisma_dallar")
      .insert(dallarIds.map((dal_id) => ({ yarisma_id: id, dal_id })));
  }
  if (yasIds.length) {
    await supabase
      .from("yarisma_yas_gruplari")
      .insert(yasIds.map((yas_grubu_id) => ({ yarisma_id: id, yas_grubu_id })));
  }

  revalidatePath("/");
  revalidatePath("/takvim");
  revalidatePath("/admin/yarismalar");
  revalidatePath(`/yarisma/${id}`);
  redirect("/admin/yarismalar");
}

export async function yarismaSil(id: string): Promise<void> {
  const supabase = await authAdmin();
  await supabase.from("yarisma_dallar").delete().eq("yarisma_id", id);
  await supabase.from("yarisma_yas_gruplari").delete().eq("yarisma_id", id);
  await supabase.from("yarismalar").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/takvim");
  revalidatePath("/admin/yarismalar");
  redirect("/admin/yarismalar");
}

export async function yarismaKopya(id: string): Promise<void> {
  const supabase = await authAdmin();

  const { data: y, error: e1 } = await supabase
    .from("yarismalar")
    .select(
      "*, yarisma_dallar(dal_id), yarisma_yas_gruplari(yas_grubu_id)"
    )
    .eq("id", id)
    .single();

  if (e1 || !y) throw new Error(e1?.message ?? "Yarışma bulunamadı");

  const { data: ny, error: e2 } = await supabase
    .from("yarismalar")
    .insert({
      ad: `${y.ad} (Kopya)`,
      baslangic_tarihi: y.baslangic_tarihi,
      bitis_tarihi: y.bitis_tarihi,
      ulke_id: y.ulke_id,
      sehir: y.sehir,
      salon: y.salon,
      organizator: y.organizator,
      organizasyon: y.organizasyon,
      kayit_son_tarihi: null,
      kayit_linki: null,
      program_linki: null,
      sonuc_linki: null,
      tr_katilim_var_mi: y.tr_katilim_var_mi,
      notlar: y.notlar,
      durum: "taslak",
    })
    .select()
    .single();

  if (e2 || !ny) throw new Error(e2?.message ?? "Kopya oluşturulamadı");

  if (y.yarisma_dallar?.length) {
    await supabase
      .from("yarisma_dallar")
      .insert(
        y.yarisma_dallar.map((d: { dal_id: string }) => ({
          yarisma_id: ny.id,
          dal_id: d.dal_id,
        }))
      );
  }
  if (y.yarisma_yas_gruplari?.length) {
    await supabase
      .from("yarisma_yas_gruplari")
      .insert(
        y.yarisma_yas_gruplari.map((yg: { yas_grubu_id: string }) => ({
          yarisma_id: ny.id,
          yas_grubu_id: yg.yas_grubu_id,
        }))
      );
  }

  revalidatePath("/admin/yarismalar");
  redirect(`/admin/yarismalar/${ny.id}/duzenle`);
}

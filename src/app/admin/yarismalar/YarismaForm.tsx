import Link from "next/link";

type FilterOption = { id: string; ad: string };

export type YarismaFormValues = {
  ad: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  ulke_id: string;
  sehir: string;
  salon: string;
  organizator: string;
  organizasyon: string;
  kayit_son_tarihi: string;
  kayit_linki: string;
  program_linki: string;
  sonuc_linki: string;
  tr_katilim_var_mi: boolean;
  notlar: string;
  durum: string;
  dalIds: string[];
  yasIds: string[];
};

export default function YarismaForm({
  ulkeler,
  dallar,
  yasGruplari,
  values,
  action,
  submitLabel,
  extra,
  iptalHref,
}: {
  ulkeler: FilterOption[];
  dallar: FilterOption[];
  yasGruplari: FilterOption[];
  values: YarismaFormValues;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  extra?: React.ReactNode;
  iptalHref: string;
}) {
  return (
    <form action={action} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-700">Temel</legend>
        <Alan label="Ad" required>
          <input
            type="text"
            name="ad"
            required
            defaultValue={values.ad}
            className={inputCls}
          />
        </Alan>
        <div className="grid grid-cols-2 gap-3">
          <Alan label="Başlangıç tarihi" required>
            <input
              type="date"
              name="baslangic_tarihi"
              required
              defaultValue={values.baslangic_tarihi}
              className={inputCls}
            />
          </Alan>
          <Alan label="Bitiş tarihi">
            <input
              type="date"
              name="bitis_tarihi"
              defaultValue={values.bitis_tarihi}
              className={inputCls}
            />
          </Alan>
        </div>
        <Alan label="Durum">
          <select name="durum" defaultValue={values.durum} className={inputCls}>
            <option value="taslak">Taslak</option>
            <option value="yayinda">Yayında</option>
            <option value="iptal">İptal</option>
          </select>
        </Alan>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-700">Konum</legend>
        <Alan label="Ülke">
          <select name="ulke_id" defaultValue={values.ulke_id} className={inputCls}>
            <option value="">— Seçiniz —</option>
            {ulkeler.map((u) => (
              <option key={u.id} value={u.id}>
                {u.ad}
              </option>
            ))}
          </select>
        </Alan>
        <div className="grid grid-cols-2 gap-3">
          <Alan label="Şehir">
            <input
              type="text"
              name="sehir"
              defaultValue={values.sehir}
              className={inputCls}
            />
          </Alan>
          <Alan label="Salon">
            <input
              type="text"
              name="salon"
              defaultValue={values.salon}
              className={inputCls}
            />
          </Alan>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-700">Organizasyon</legend>
        <div className="grid grid-cols-2 gap-3">
          <Alan label="Organizatör">
            <input
              type="text"
              name="organizator"
              defaultValue={values.organizator}
              className={inputCls}
            />
          </Alan>
          <Alan label="Organizasyon">
            <input
              type="text"
              name="organizasyon"
              defaultValue={values.organizasyon}
              className={inputCls}
            />
          </Alan>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-slate-700">Dallar</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-slate-200 rounded p-3">
          {dallar.map((d) => (
            <label key={d.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="dal"
                value={d.id}
                defaultChecked={values.dalIds.includes(d.id)}
                className="rounded"
              />
              {d.ad}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-slate-700">Yaş grupları</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-slate-200 rounded p-3">
          {yasGruplari.map((yg) => (
            <label key={yg.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="yas"
                value={yg.id}
                defaultChecked={values.yasIds.includes(yg.id)}
                className="rounded"
              />
              {yg.ad}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-700">Kayıt & Linkler</legend>
        <Alan label="Kayıt son tarihi">
          <input
            type="date"
            name="kayit_son_tarihi"
            defaultValue={values.kayit_son_tarihi}
            className={inputCls}
          />
        </Alan>
        <Alan label="Kayıt linki">
          <input
            type="url"
            name="kayit_linki"
            defaultValue={values.kayit_linki}
            placeholder="https://..."
            className={inputCls}
          />
        </Alan>
        <Alan label="Program linki">
          <input
            type="url"
            name="program_linki"
            defaultValue={values.program_linki}
            placeholder="https://..."
            className={inputCls}
          />
        </Alan>
        <Alan label="Sonuç linki">
          <input
            type="url"
            name="sonuc_linki"
            defaultValue={values.sonuc_linki}
            placeholder="https://..."
            className={inputCls}
          />
        </Alan>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-700">Diğer</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="tr_katilim_var_mi"
            defaultChecked={values.tr_katilim_var_mi}
            className="rounded"
          />
          Türk katılımcı var
        </label>
        <Alan label="Notlar">
          <textarea
            name="notlar"
            rows={3}
            defaultValue={values.notlar}
            className={inputCls}
          />
        </Alan>
      </fieldset>

      <div className="flex gap-2 pt-2 border-t border-slate-200">
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
        >
          {submitLabel}
        </button>
        <Link
          href={iptalHref}
          className="border border-slate-300 px-4 py-2 rounded text-sm hover:bg-slate-100"
        >
          İptal
        </Link>
        {extra}
      </div>
    </form>
  );
}

const inputCls =
  "w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";

function Alan({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
    </div>
  );
}

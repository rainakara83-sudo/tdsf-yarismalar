"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export type FilterOption = { id: string; ad: string };

export type FiltersBarInitial = {
  ulke?: string;
  dal: string[];
  yas: string[];
  tr?: boolean;
  baslangic?: string;
  bitis?: string;
};

export default function FiltersBar({
  ulkeler,
  dallar,
  yasGruplari,
}: {
  ulkeler: FilterOption[];
  dallar: FilterOption[];
  yasGruplari: FilterOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ulke, setUlke] = useState<string>(searchParams.get("ulke") ?? "");
  const [dallarSecili, setDallarSecili] = useState<string[]>(
    searchParams.get("dal")?.split(",").filter(Boolean) ?? []
  );
  const [yasSecili, setYasSecili] = useState<string[]>(
    searchParams.get("yas")?.split(",").filter(Boolean) ?? []
  );
  const [tr, setTr] = useState<boolean>(searchParams.get("tr") === "1");
  const [baslangic, setBaslangic] = useState<string>(
    searchParams.get("baslangic") ?? ""
  );
  const [bitis, setBitis] = useState<string>(searchParams.get("bitis") ?? "");

  useEffect(() => {
    setUlke(searchParams.get("ulke") ?? "");
    setDallarSecili(
      searchParams.get("dal")?.split(",").filter(Boolean) ?? []
    );
    setYasSecili(searchParams.get("yas")?.split(",").filter(Boolean) ?? []);
    setTr(searchParams.get("tr") === "1");
    setBaslangic(searchParams.get("baslangic") ?? "");
    setBitis(searchParams.get("bitis") ?? "");
  }, [searchParams]);

  function toggleListe(
    mevcut: string[],
    id: string,
    setter: (v: string[]) => void
  ) {
    setter(
      mevcut.includes(id) ? mevcut.filter((x) => x !== id) : [...mevcut, id]
    );
  }

  function uygula(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (ulke) params.set("ulke", ulke);
    if (dallarSecili.length > 0) params.set("dal", dallarSecili.join(","));
    if (yasSecili.length > 0) params.set("yas", yasSecili.join(","));
    if (tr) params.set("tr", "1");
    if (baslangic) params.set("baslangic", baslangic);
    if (bitis) params.set("bitis", bitis);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  function temizle() {
    router.push("/");
  }

  return (
    <form
      onSubmit={uygula}
      className="mb-6 border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Ülke
        </label>
        <select
          value={ulke}
          onChange={(e) => setUlke(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
        >
          <option value="">Tümü</option>
          {ulkeler.map((u) => (
            <option key={u.id} value={u.id}>
              {u.ad}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Dallar
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {dallar.map((d) => {
            const secili = dallarSecili.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleListe(dallarSecili, d.id, setDallarSecili)}
                className={`text-xs px-2 py-1.5 rounded border text-left transition ${
                  secili
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                }`}
              >
                {d.ad}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Yaş grupları
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {yasGruplari.map((yg) => {
            const secili = yasSecili.includes(yg.id);
            return (
              <button
                key={yg.id}
                type="button"
                onClick={() => toggleListe(yasSecili, yg.id, setYasSecili)}
                className={`text-xs px-2 py-1.5 rounded border text-left transition ${
                  secili
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                }`}
              >
                {yg.ad}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={tr}
            onChange={(e) => setTr(e.target.checked)}
            className="w-4 h-4"
          />
          Türkiye'den katılım var
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Başlangıç
          </label>
          <input
            type="date"
            value={baslangic}
            onChange={(e) => setBaslangic(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Bitiş
          </label>
          <input
            type="date"
            value={bitis}
            onChange={(e) => setBitis(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          Filtrele
        </button>
        <button
          type="button"
          onClick={temizle}
          className="text-sm text-slate-600 underline hover:text-slate-900"
        >
          Temizle
        </button>
      </div>
    </form>
  );
}

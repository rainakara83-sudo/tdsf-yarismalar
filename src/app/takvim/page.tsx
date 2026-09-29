import Link from "next/link";

export const runtime = "nodejs";
import { createClient } from "@/lib/supabase/server";
import TakvimGun, { type TakvimYarisma, bayrak } from "@/components/TakvimGun";
import Sekmeler from "@/components/Sekmeler";

type UlkeRelation = { ad: string; kod: string | null } | { ad: string; kod: string | null }[] | null;

const aylarTr = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const gunAdlari = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function ilk<T>(liste: T | T[] | null | undefined): T | null {
  if (!liste) return null;
  return Array.isArray(liste) ? (liste[0] ?? null) : liste;
}

function oncekiAy(yil: number, ay: number): { yil: number; ay: number } {
  if (ay === 1) return { yil: yil - 1, ay: 12 };
  return { yil, ay: ay - 1 };
}

function sonrakiAy(yil: number, ay: number): { yil: number; ay: number } {
  if (ay === 12) return { yil: yil + 1, ay: 1 };
  return { yil, ay: ay + 1 };
}

function ayGunSayisi(yil: number, ay: number): number {
  return new Date(yil, ay, 0).getDate();
}

function haftaningunu(yil: number, ay: number, gun: number): number {
  const d = new Date(yil, ay - 1, gun);
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

function ayYap(yil: number, ay: number) {
  const toplam = ayGunSayisi(yil, ay);
  const ilkGun = haftaningunu(yil, ay, 1);
  const onceki = oncekiAy(yil, ay);
  const oncekiToplam = ayGunSayisi(onceki.yil, onceki.ay);

  const hucreler: { yil: number; ay: number; gun: number; buAy: boolean }[] = [];

  for (let i = ilkGun - 1; i >= 0; i--) {
    hucreler.push({
      yil: onceki.yil,
      ay: onceki.ay,
      gun: oncekiToplam - i,
      buAy: false,
    });
  }
  for (let g = 1; g <= toplam; g++) {
    hucreler.push({ yil, ay, gun: g, buAy: true });
  }
  while (hucreler.length % 7 !== 0 || hucreler.length < 35) {
    const son = hucreler[hucreler.length - 1];
    const s = sonrakiAy(son.yil, son.ay);
    hucreler.push({ yil: s.yil, ay: s.ay, gun: 1, buAy: false });
    if (hucreler.length >= 42 && hucreler.length % 7 === 0) break;
    if (hucreler.length === 42) break;
    const sonraki = hucreler[hucreler.length - 1];
    const t = new Date(sonraki.yil, sonraki.ay, 0).getDate();
    if (t > sonraki.gun) {
      hucreler.push({ yil: sonraki.yil, ay: sonraki.ay, gun: sonraki.gun + 1, buAy: false });
    } else {
      break;
    }
  }
  while (hucreler.length < 42) {
    const son = hucreler[hucreler.length - 1];
    const t = new Date(son.yil, son.ay, 0).getDate();
    if (t > son.gun) {
      hucreler.push({ yil: son.yil, ay: son.ay, gun: son.gun + 1, buAy: false });
    } else {
      const s = sonrakiAy(son.yil, son.ay);
      hucreler.push({ yil: s.yil, ay: s.ay, gun: 1, buAy: false });
    }
  }

  return hucreler.slice(0, 42);
}

export default async function TakvimPage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string }>;
}) {
  const sp = await searchParams;
  const suAn = new Date();
  const varsayilanYil = suAn.getUTCFullYear();
  const varsayilanAy = suAn.getUTCMonth() + 1;

  let yil = varsayilanYil;
  let ay = varsayilanAy;
  if (sp.ay) {
    const m = sp.ay.match(/^(\d{4})-(\d{2})$/);
    if (m) {
      yil = parseInt(m[1], 10);
      ay = parseInt(m[2], 10);
      if (ay < 1 || ay > 12 || isNaN(yil)) {
        yil = varsayilanYil;
        ay = varsayilanAy;
      }
    }
  }

  const onceki = oncekiAy(yil, ay);
  const sonraki = sonrakiAy(yil, ay);

  const supabase = await createClient();
  const { data } = await supabase
    .from("yarismalar")
    .select(
      "id, ad, baslangic_tarihi, bitis_tarihi, ulke:ulkeler(ad, kod)"
    )
    .eq("durum", "yayinda")
    .order("baslangic_tarihi", { ascending: true });

  const bugun = new Date();
  bugun.setUTCHours(0, 0, 0, 0);
  const bugunStr = bugun.toISOString().slice(0, 10);

  const tumYarismalar: TakvimYarisma[] = (data ?? [])
    .filter((y) => y.baslangic_tarihi)
    .map((y) => {
      const u = ilk(y.ulke as UlkeRelation);
      const bas = y.baslangic_tarihi as string;
      const bit = (y.bitis_tarihi as string | null) || bas;
      const gecmis = bit < bugunStr;
      return {
        id: y.id,
        ad: y.ad,
        ulkeKod: u?.kod ?? null,
        ulkeAd: u?.ad ?? "",
        baslangic_tarihi: bas,
        bitis_tarihi: bit,
        gecmis,
      };
    });

  const hucreler = ayYap(yil, ay);

  function hucreYarismalari(h: { yil: number; ay: number; gun: number }) {
    const tarih = `${h.yil.toString().padStart(4, "0")}-${h.ay.toString().padStart(2, "0")}-${h.gun.toString().padStart(2, "0")}`;
    return tumYarismalar.filter(
      (y) => tarih >= y.baslangic_tarihi && tarih <= y.bitis_tarihi
    );
  }

  const ayEtiketi = `${aylarTr[ay - 1]} ${yil}`;
  const linkAyi = (y: number, a: number) =>
    `/takvim?ay=${y.toString().padStart(4, "0")}-${a.toString().padStart(2, "0")}`;

  return (
    <main className="min-h-screen bg-white text-slate-900 px-4 py-8 max-w-5xl mx-auto">
      <Sekmeler aktif="takvim" />

      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Takvim</h1>
        <p className="text-slate-600 mt-1">
          Türkiye Dans Sporları Federasyonu
        </p>
      </header>

      <div className="flex items-center justify-between mb-4">
        <Link
          href={linkAyi(onceki.yil, onceki.ay)}
          className="px-3 py-1.5 rounded border border-slate-300 text-sm hover:bg-slate-50"
        >
          ← Önceki
        </Link>
        <h2 className="text-lg sm:text-xl font-semibold">{ayEtiketi}</h2>
        <Link
          href={linkAyi(sonraki.yil, sonraki.ay)}
          className="px-3 py-1.5 rounded border border-slate-300 text-sm hover:bg-slate-50"
        >
          Sonraki →
        </Link>
      </div>

      {/* Masaüstü takvim */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-7 gap-0 mb-1">
          {gunAdlari.map((g) => (
            <div
              key={g}
              className="text-center text-xs font-medium text-slate-600 py-1 border border-slate-200 bg-slate-50"
            >
              {g}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {hucreler.map((h, i) => {
            const list = hucreYarismalari(h);
            return (
              <TakvimGun
                key={`${h.yil}-${h.ay}-${h.gun}-${i}`}
                yil={h.yil}
                ay={h.ay}
                gun={h.gun}
                buAy={h.buAy}
                yarismalar={list}
              />
            );
          })}
        </div>
      </div>

      {/* Mobil liste */}
      <div className="sm:hidden">
        {(() => {
          const ayBas =
            `${yil.toString().padStart(4, "0")}-${ay.toString().padStart(2, "0")}-01`;
          const aySon = new Date(yil, ay, 0);
          const aySonStr =
            `${yil.toString().padStart(4, "0")}-${ay.toString().padStart(2, "0")}-${aySon.getDate().toString().padStart(2, "0")}`;
          const liste = tumYarismalar.filter(
            (y) => !(y.bitis_tarihi < ayBas || y.baslangic_tarihi > aySonStr)
          );
          if (liste.length === 0) {
            return (
              <p className="text-sm text-slate-500">Bu ay yarışma yok.</p>
            );
          }
          return liste.map((y) => (
            <Link
              key={y.id}
              href={`/yarisma/${y.id}`}
              className={`block border border-slate-200 rounded p-3 mb-2 hover:bg-slate-50 cursor-pointer ${
                y.gecmis ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{bayrak(y.ulkeKod)}</span>
                <span>{y.ad}</span>
                <span className="ml-auto text-xs text-slate-500">
                  {y.baslangic_tarihi}
                </span>
              </div>
            </Link>
          ));
        })()}
      </div>
    </main>
  );
}

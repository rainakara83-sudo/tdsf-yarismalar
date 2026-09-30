import Link from "next/link";

export type TakvimYarisma = {
  id: string;
  ad: string;
  ulkeKod: string | null;
  ulkeAd: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  gecmis: boolean;
};

const bayraklar: Record<string, string> = {
  TR: "🇹🇷", DE: "🇩🇪", GB: "🇬🇧", IT: "🇮🇹", FR: "🇫🇷", ES: "🇪🇸",
  PL: "🇵🇱", AT: "🇦🇹", NL: "🇳🇱", BE: "🇧🇪", DK: "🇩🇰", SE: "🇸🇪",
  NO: "🇳🇴", FI: "🇫🇮", CZ: "🇨🇿", SK: "🇸🇰", HU: "🇭🇺", RO: "🇷🇴",
  BG: "🇧🇬", GR: "🇬🇷", HR: "🇭🇷", SI: "🇸🇮", CH: "🇨🇭", LU: "🇱🇺",
  PT: "🇵🇹", US: "🇺🇸", CA: "🇨🇦", JP: "🇯🇵", CN: "🇨🇳", KR: "🇰🇷",
  BR: "🇧🇷", AR: "🇦🇷", AU: "🇦🇺", RU: "🇷🇺",
};

export function bayrak(kod: string | null): string {
  if (!kod) return "";
  return bayraklar[kod] ?? kod;
}

export default function TakvimGun({
  yil,
  ay,
  gun,
  buAy,
  yarismalar,
}: {
  yil: number;
  ay: number;
  gun: number;
  buAy: boolean;
  yarismalar: TakvimYarisma[];
}) {
  const tarihStr =
    `${yil.toString().padStart(4, "0")}-` +
    `${ay.toString().padStart(2, "0")}-` +
    `${gun.toString().padStart(2, "0")}`;

  const bugun = new Date();
  bugun.setUTCHours(0, 0, 0, 0);
  const bugunStr = bugun.toISOString().slice(0, 10);
  const isToday = tarihStr === bugunStr;

  return (
    <div
      className={`min-h-[88px] min-w-0 border border-slate-200 p-1.5 text-xs ${
        buAy ? "bg-white" : "bg-slate-50 text-slate-400"
      }`}
    >
      <div className="flex justify-end">
        <span
          className={`inline-flex items-center justify-center text-xs ${
            isToday
              ? "bg-red-600 text-white rounded-full w-5 h-5 font-bold"
              : ""
          }`}
        >
          {gun}
        </span>
      </div>
      <div className="mt-1 space-y-1">
        {yarismalar.map((y) => (
          <Link
            key={y.id}
            href={`/yarisma/${y.id}`}
            className={`block px-1.5 py-0.5 rounded text-[10px] leading-tight truncate cursor-pointer hover:opacity-80 ${
              y.gecmis
                ? "bg-slate-100 text-slate-500"
                : "bg-red-100 text-red-800"
            }`}
            title={`${y.ad} (${y.ulkeAd})`}
          >
            <span className="mr-0.5">{bayrak(y.ulkeKod)}</span>
            {y.ad}
          </Link>
        ))}
      </div>
    </div>
  );
}

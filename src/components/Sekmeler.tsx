import Link from "next/link";

export default function Sekmeler({ aktif }: { aktif: "liste" | "takvim" }) {
  const cls = (a: "liste" | "takvim") =>
    `px-4 py-2 text-sm font-medium border-b-2 ${
      aktif === a
        ? "border-blue-600 text-blue-700"
        : "border-transparent text-slate-600 hover:text-slate-900"
    }`;
  return (
    <nav className="border-b border-slate-200 mb-6">
      <div className="flex gap-2">
        <Link href="/" className={cls("liste")}>
          Liste
        </Link>
        <Link href="/takvim" className={cls("takvim")}>
          Takvim
        </Link>
      </div>
    </nav>
  );
}

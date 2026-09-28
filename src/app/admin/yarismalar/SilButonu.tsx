"use client";

export default function SilButonu({ ad }: { id: string; ad: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(`"${ad}" silinsin mi? Bu işlem geri alınamaz.`)) {
          e.preventDefault();
        }
      }}
      className="text-xs text-red-700 border border-red-300 rounded px-2 py-1 hover:bg-red-50"
    >
      Sil
    </button>
  );
}

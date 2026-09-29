"use client";

export default function KopyaButonu({ ad }: { id: string; ad: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (
          !confirm(
            `"${ad}" kopyalansın mı? Yeni taslak yarışma oluşturulacak ve düzenleme sayfasına yönlendirileceksiniz.`
          )
        ) {
          e.preventDefault();
        }
      }}
      className="text-xs text-amber-700 border border-amber-300 rounded px-2 py-1 hover:bg-amber-50"
    >
      📋 Kopyala
    </button>
  );
}
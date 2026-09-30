export default function Footer() {
  return (
    <footer className="bg-white border-t-4 border-red-600 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-slate-700">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Adres</h3>
            <p className="leading-relaxed">
              Kızılırmak Mah. 1450 Sokak 22/A
              <br />
              Kat: 2 Daire: 4
              <br />
              06530 Çukurambar - Çankaya / Ankara
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Telefon</h3>
            <a
              href="tel:+903124181694"
              className="text-red-600 hover:text-red-700 hover:underline"
            >
              0312 418 16 94
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-2">E-posta</h3>
            <a
              href="mailto:bilgi@tdsf.org.tr"
              className="text-red-600 hover:text-red-700 hover:underline break-all"
            >
              bilgi@tdsf.org.tr
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          © 2026 Türkiye Dans Sporları Federasyonu
        </div>
      </div>
    </footer>
  );
}

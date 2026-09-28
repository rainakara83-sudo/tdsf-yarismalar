export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 px-4 py-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dans Yarışmaları</h1>
        <p className="text-slate-600 mt-2">
          Türkiye Dans Sporları Federasyonu
        </p>
      </header>
      <section className="space-y-4 text-slate-700">
        <p>
          Bu site dünyadaki dans yarışmalarını tek listede toplar.
        </p>
        <p className="text-sm text-slate-500">
          Şu an iskelet aşamasındayız. Yarışma listesi yakında.
        </p>
      </section>
    </main>
  );
}

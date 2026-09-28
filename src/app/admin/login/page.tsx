import Link from "next/link";
import LoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">TDSF</h1>
          <p className="text-sm text-slate-600 mt-1">
            Türkiye Dans Sporları Federasyonu
          </p>
          <h2 className="text-xl font-semibold text-slate-800 mt-6">
            Yönetici Girişi
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="text-center mt-6 text-sm">
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            ← Ana sayfaya dön
          </Link>
        </p>
      </div>
    </main>
  );
}

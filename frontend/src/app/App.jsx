// src/app/App.jsx
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from '@/layout/Navbar.jsx';
import Footer from '@/layout/Footer.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B0F10] text-gray-200">
      {/* top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" aria-hidden />
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <Footer />
      <ScrollRestoration />
    </div>
  );
}

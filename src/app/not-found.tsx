'use client';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-24 text-white flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-8">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
          <span className="text-5xl font-black text-zinc-600">404</span>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight">Page Not Found</h1>
          <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
            The gadget you are looking for does not exist in our inventory, 
            or the link may have moved. Let us get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] interactive-bounce shadow-lg"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-6 py-3.5 text-sm font-bold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] interactive-bounce"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </main>
  );
}

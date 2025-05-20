import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white py-24">
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
          alt="Nelson Tech Community"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-6">Nelson Tech</h1>
          <p className="text-xl text-slate-300 mb-8">
            Connecting and empowering the Kootenay region's thriving tech community through collaboration, innovation, and knowledge sharing.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/directory"
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Join the Community
            </Link>
            <Link
              href="/events"
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Upcoming Events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Catalog } from '@/db/schema/catalogs';

export function CatalogsCarousel() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Buscar catálogos
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const response = await fetch('/api/catalogs');
        const json = (await response.json()) as { success?: boolean; data?: Catalog[] };
        if (json.success && json.data) {
          setCatalogs(json.data);
        }
      } catch (error) {
        console.error('Error fetching catalogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  // Rotação automática a cada 10 segundos
  useEffect(() => {
    if (catalogs.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % catalogs.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [catalogs.length]);

  if (loading || catalogs.length === 0) {
    return null;
  }

  const current = catalogs[currentIndex];

  return (
    <div className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden">
      <div className="relative w-full h-96">
        <Image
          src={current.imageUrl}
          alt={current.title || 'Catálogo'}
          fill
          className="object-cover"
          priority
        />
        {current.title && (
          <div className="absolute inset-0 bg-black/40 flex items-end p-6">
            <div className="text-white">
              <h3 className="text-2xl font-bold">{current.title}</h3>
              {current.description && (
                <p className="text-sm mt-2 opacity-90">{current.description}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Indicadores */}
      {catalogs.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {catalogs.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to catalog ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

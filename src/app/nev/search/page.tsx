'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface SearchResult {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  powertrain: string;
  bodyType: string | null;
  imageUrl: string | null;
  brand: {
    name: string;
    slug: string;
  };
  variants: {
    priceBaht: number | null;
  }[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    fetch(`/api/nev/search?${params}`)
      .then(r => r.json())
      .then(data => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error searching:', error);
        setLoading(false);
      });
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/nev/search?q=${encodeURIComponent(query)}`;
  };

  const getStartingPrice = (model: SearchResult) => {
    const prices = model.variants.map(v => v.priceBaht).filter((p): p is number => p !== null);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/nev" className="text-blue-600 hover:underline mb-4 inline-block">
            ← กลับหน้าแรก
          </Link>
          
          <h1 className="text-3xl font-bold mb-4">ค้นหารถ NEV</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาแบรนด์ รุ่นรถ..."
                className="flex-1 px-4 py-3 border rounded-lg"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ค้นหา
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/nev/search?powertrain=BEV"
              className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 text-sm"
            >
              🔋 BEV
            </Link>
            <Link
              href="/nev/search?powertrain=PHEV"
              className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 text-sm"
            >
              ⚡ PHEV
            </Link>
            <Link
              href="/nev/search?powertrain=HEV"
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm"
            >
              🔄 HEV
            </Link>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl mb-2">🔄</div>
            <p className="text-gray-600">กำลังค้นหา...</p>
          </div>
        ) : results.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600 mb-2">ไม่พบผลลัพธ์</p>
            <p className="text-sm text-gray-500">ลองค้นหาด้วยคำอื่น</p>
          </Card>
        ) : (
          <>
            <div className="mb-6 text-gray-600">
              พบ {results.length} รุ่น
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((model) => {
                const startingPrice = getStartingPrice(model);
                
                return (
                  <Link key={model.id} href={`/nev/models/${model.slug}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                        {model.imageUrl ? (
                          <img
                            src={model.imageUrl}
                            alt={model.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl">🚗</span>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="text-sm text-gray-500 mb-1">{model.brand.name}</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {model.name}
                        </h3>
                        {model.nameTh && (
                          <p className="text-sm text-gray-600 mb-3">{model.nameTh}</p>
                        )}

                        <div className="flex gap-2 text-xs mb-4">
                          <span className="px-2 py-1 bg-gray-100 rounded">{model.powertrain}</span>
                          {model.bodyType && (
                            <span className="px-2 py-1 bg-gray-100 rounded">{model.bodyType}</span>
                          )}
                        </div>

                        {startingPrice && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="text-sm text-gray-500">ราคาเริ่มต้น</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {startingPrice.toLocaleString()} ฿
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

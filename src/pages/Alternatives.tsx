import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Button, Card, SectionHeader, EmptyState } from '../components/ui';
import { ProductPicker } from '../components/food';
import { productService } from '../services/api';
import type { Product } from '../types';

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Real, computed deltas from actual nutrition numbers — never invented marketing copy. */
const buildDeltas = (current: Product, alt: Product): string[] => {
  const deltas: string[] = [];
  const c = current.nutrition;
  const a = alt.nutrition;

  if (c.sugar != null && a.sugar != null && a.sugar < c.sugar) {
    deltas.push(`${round1(c.sugar - a.sugar)}g less sugar`);
  }
  if (c.protein != null && a.protein != null && a.protein > c.protein) {
    deltas.push(`${round1(a.protein - c.protein)}g more protein`);
  }
  if (c.calories != null && a.calories != null && a.calories < c.calories) {
    deltas.push(`${round1(c.calories - a.calories)} fewer calories`);
  }
  if (c.sodium != null && a.sodium != null && a.sodium < c.sodium) {
    deltas.push(`${round1(c.sodium - a.sodium)}mg less sodium`);
  }
  if (current.allergens.length > alt.allergens.length) {
    deltas.push(`${current.allergens.length - alt.allergens.length} fewer flagged allergens`);
  }
  return deltas;
};

const Alternatives: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [current, setCurrent] = useState<Product | null>(null);
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFor = async (product: Product) => {
    setCurrent(product);
    setLoading(true);
    setError(null);
    const categorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
    const res = await productService.browseCategory(categorySlug);
    setLoading(false);
    if (res.success && res.data) {
      const better = res.data.items
        .filter((p) => p.barcode !== product.barcode && p.score && product.score && p.score.overall > product.score.overall)
        .sort((a, b) => (b.score?.overall || 0) - (a.score?.overall || 0))
        .slice(0, 5);
      setAlternatives(better);
    } else {
      setError(res.error || 'Could not load alternatives right now.');
    }
  };

  useEffect(() => {
    const barcode = searchParams.get('product');
    if (!barcode) return;
    productService.getProduct(barcode).then((res) => {
      if (res.success && res.data) loadFor(res.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader
          title="Find Better Alternatives"
          description="Real products from the same category, ranked by an actually higher FoodLens Score."
        />

        {!current && (
          <Card className="mb-8">
            <p className="text-sm font-medium text-gray-700 mb-2">Search for a product to find alternatives to</p>
            <ProductPicker onSelect={loadFor} placeholder="e.g. store-brand yogurt…" />
          </Card>
        )}

        {current && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">You're Looking At</h3>
            <Card className="border-2 border-gray-300">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {current.imageUrl ? (
                    <img src={current.imageUrl} alt={current.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-400">No image</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{current.name}</h4>
                  <p className="text-gray-600">{current.brand}</p>
                  {current.score && <p className="text-sm text-gray-600 mt-1">Score: {current.score.overall}/100</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setCurrent(null); setAlternatives([]); }}>
                  Change
                </Button>
              </div>
            </Card>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Looking for real alternatives…
          </div>
        )}

        {!loading && error && (
          <Card className="text-center py-10">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {!loading && current && !error && alternatives.length === 0 && (
          <EmptyState
            title="No better-scoring alternatives found"
            description="Nothing in this category currently scores higher in the live database — this product may already be a strong choice."
          />
        )}

        {!loading && alternatives.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Better Alternatives</h3>
            <div className="space-y-6">
              {alternatives.map((alt) => {
                const deltas = current ? buildDeltas(current, alt) : [];
                return (
                  <Link key={alt.barcode} to={`/product/${alt.barcode}`}>
                    <Card hover className="cursor-pointer">
                      <div className="flex items-start gap-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {alt.imageUrl ? (
                            <img src={alt.imageUrl} alt={alt.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-xs text-gray-400">No image</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">{alt.name}</h4>
                              <p className="text-gray-600">{alt.brand}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-2xl font-bold text-emerald-600">{alt.score?.overall}</p>
                              <p className="text-xs text-gray-600">Score</p>
                            </div>
                          </div>
                          {deltas.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-700 font-medium mb-1">Compared to your product:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {deltas.map((d) => <li key={d}>• {d}</li>)}
                              </ul>
                            </div>
                          )}
                          <Button size="sm" variant="outline" icon={<ArrowRight className="w-4 h-4" />}>
                            View Product
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Alternatives;

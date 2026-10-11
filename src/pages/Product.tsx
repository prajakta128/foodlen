import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ExternalLink, Loader2, Heart, GitCompare, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, SectionHeader, ErrorMessage, Button } from '../components/ui';
import { NutritionCard, ScoreRing, FoodCard } from '../components/food';
import { productService } from '../services/api';
import { savedItemsService, scanHistoryService } from '../services/localData';
import { checkClaims } from '../utils/claimIntelligence';
import type { Product as ProductType } from '../types';

type Tab = 'overview' | 'nutrition' | 'ingredients' | 'claims';

const scoreSubBar = (label: string, pct: number) => (
  <div className="flex-1" key={label}>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <div className="bg-gray-100 rounded-full h-1.5">
      <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  </div>
);

const Product: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [alternatives, setAlternatives] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setTab('overview');
    productService.getProduct(id).then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setProduct(res.data);
        setIsSaved(savedItemsService.isSaved(res.data.barcode));
        scanHistoryService.log({
          barcode: res.data.barcode,
          name: res.data.name,
          brand: res.data.brand,
          category: res.data.category,
          imageUrl: res.data.imageUrl,
          score: res.data.score?.overall,
        });
        if (res.data.category) {
          productService.browseCategory(res.data.category.toLowerCase().replace(/\s+/g, '-')).then((altRes) => {
            if (altRes.success && altRes.data) {
              setAlternatives(altRes.data.items.filter((p) => p.barcode !== id).slice(0, 4));
            }
          });
        }
      } else {
        setError(res.error || 'Product not found.');
      }
    });
  }, [id]);

  const handleToggleSave = () => {
    if (!product) return;
    const nowSaved = savedItemsService.toggle({
      barcode: product.barcode,
      name: product.name,
      brand: product.brand,
      category: product.category,
      imageUrl: product.imageUrl,
      score: product.score?.overall,
    });
    setIsSaved(nowSaved);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32 text-gray-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin" /> Fetching real product data…
        </div>
      </AppLayout>
    );
  }

  if (error || !product) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <ErrorMessage
            title="Product not found"
            message={error || "We couldn't find this product in the database."}
          />
        </div>
      </AppLayout>
    );
  }

  const n = product.nutrition;
  const nova = (product as any).novaGroup as number | undefined;
  const ecoscore = (product as any).ecoscoreGrade as string | undefined;
  const claims = checkClaims(product);
  const verdictOrder = { attention: 0, consistent: 1, unverifiable: 2 } as const;
  const sortedClaims = [...claims].sort((a, b) => verdictOrder[a.verdict] - verdictOrder[b.verdict]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'claims', label: 'Claims' },
  ];

  return (
    <AppLayout>
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="relative rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 aspect-square flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-4" />
                ) : (
                  <p className="text-sm text-gray-400 font-medium">No image available</p>
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-3">
                <Badge>{product.category}</Badge>
                <button
                  onClick={handleToggleSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                    isSaved
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-emerald-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight mb-1">{product.name}</h1>
              <p className="text-lg text-gray-500 mb-5">{product.brand}</p>

              {product.score && (
                <div className="flex items-center gap-5 bg-gray-50 rounded-2xl p-5 mt-auto">
                  <ScoreRing score={product.score.overall} size={84} strokeWidth={7} label="/ 100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-display font-semibold text-gray-900">FoodLens Score</p>
                      {(product as any).nutriscoreGrade && (
                        <span className="text-xs font-semibold bg-white border border-gray-200 rounded-full px-2.5 py-0.5">
                          Nutri-Score {(product as any).nutriscoreGrade}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {scoreSubBar('Nutrition', product.score.nutritionScore)}
                      {scoreSubBar('Transparency', product.score.transparencyScore)}
                      {scoreSubBar('Allergen clarity', product.score.allergenScore)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto sticky top-16 bg-[#f9f7f4]/95 backdrop-blur z-10 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-8 mb-12">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={`/compare?a=${product.barcode}`} className="flex-1">
                <Button variant="outline" fullWidth icon={<GitCompare className="w-4 h-4" />}>
                  Compare with another product
                </Button>
              </Link>
              <Link to={`/alternatives?product=${product.barcode}`} className="flex-1">
                <Button variant="outline" fullWidth icon={<Sparkles className="w-4 h-4" />}>
                  Find better alternatives
                </Button>
              </Link>
            </div>
            <Card>
              <h3 className="font-display font-semibold text-gray-900 mb-3 text-lg">Why this score</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.score?.recommendation === 'excellent' && 'Well balanced nutrition, clear ingredient labeling, and no undisclosed allergens.'}
                {product.score?.recommendation === 'good' && 'Reasonably balanced, with a few things worth keeping an eye on below.'}
                {product.score?.recommendation === 'fair' && 'Some nutritional or transparency concerns — check the tabs above for details.'}
                {product.score?.recommendation === 'needs-attention' && 'Higher in less-desirable nutrients, or limited label transparency — worth a closer look.'}
                {!product.score && 'Not enough data was reported for this product to compute a score yet.'}
              </p>
            </Card>
            {alternatives.length > 0 && (
              <div>
                <SectionHeader title="Similar products" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {alternatives.map((alt) => (
                    <Link key={alt.barcode} to={`/product/${alt.barcode}`}>
                      <FoodCard name={alt.name} brand={alt.brand} category={alt.category} imageUrl={alt.imageUrl} score={alt.score?.overall} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'nutrition' && (
          <div className="mb-12">
            <NutritionCard nutrition={n} servingSize={`per ${product.servingSize}${product.servingUnit}`} />
          </div>
        )}

        {tab === 'ingredients' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <SectionHeader title="Ingredients" />
              <Card>
                {product.ingredients.length > 0 ? (
                  <ol className="space-y-2">
                    {product.ingredients.map((ingredient, idx) => (
                      <li key={ingredient.id} className="text-gray-700 flex gap-2">
                        <span className="text-gray-400 tabular-nums">{idx + 1}.</span> {ingredient.name}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-600">No ingredient data reported for this product yet.</p>
                )}
              </Card>
            </div>
            <div>
              <SectionHeader title="Allergens" />
              <Card>
                {product.allergens.length > 0 ? (
                  <div className="space-y-3">
                    {product.allergens.map((allergen) => (
                      <div key={allergen.id} className="flex items-center gap-3 bg-amber-50 rounded-lg px-3 py-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900">Contains: {allergen.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No major allergens reported.</p>
                )}
              </Card>
            </div>
          </div>
        )}

        {tab === 'claims' && (
          <div className="space-y-6 mb-12">
            {claims.length > 0 && (
              <div>
                <SectionHeader title="Claim Intelligence" description="Every label claim, checked against this product's own reported nutrition data." />
                {claims.some((c) => c.verdict === 'attention') && (
                  <div className="flex items-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-3 mb-4 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {claims.filter((c) => c.verdict === 'attention').length === 1
                      ? '1 claim on this pack doesn\'t match its own reported data.'
                      : `${claims.filter((c) => c.verdict === 'attention').length} claims on this pack don't match their own reported data.`}
                  </div>
                )}
                <div className="space-y-3">
                    {sortedClaims.map((c) => (
                    <Card
                      key={c.claim}
                      className={
                        c.verdict === 'attention'
                          ? 'border-l-4 border-l-gray-900 border-y border-r border-amber-200 bg-amber-50/60'
                          : ''
                      }
                    >
                      <div className="flex items-start gap-3">
                        {c.verdict === 'consistent' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
                        {c.verdict === 'attention' && <AlertTriangle className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />}
                        {c.verdict === 'unverifiable' && <HelpCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            "{c.claim}"
                            {c.verdict === 'attention' && <span className="ml-2 text-xs font-bold text-white bg-gray-900 rounded-full px-2 py-0.5">⚠ Claim doesn't match data</span>}
                            {c.verdict === 'consistent' && <span className="ml-2 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">Consistent</span>}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{c.explanation}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Card>
              <h3 className="font-display font-semibold text-gray-900 mb-4 text-lg">Classifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Nutri-Score</p>
                  <p className="text-2xl font-display font-semibold text-gray-900">{(product as any).nutriscoreGrade || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">NOVA group</p>
                  <p className="text-2xl font-display font-semibold text-gray-900">{nova ? `Group ${nova}` : '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Eco-Score</p>
                  <p className="text-2xl font-display font-semibold text-gray-900">{ecoscore || '—'}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-3 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Source:</span> {(product as any).dataSource || 'Open Food Facts'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Barcode:</span> {product.barcode}
                </p>
                {(product as any).sourceUrl && (
                  <a
                    href={(product as any).sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium"
                  >
                    View raw entry <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Product;

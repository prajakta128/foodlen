import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Barcode, Search as SearchIcon, Loader2, Sparkles, ScanLine,
  ShieldCheck, Database, Tags, GitCompare, Store,
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Button, Card, SectionHeader } from '../components/ui';
import { FoodCard } from '../components/food';
import { productService, authService } from '../services/api';
import type { Product } from '../types';

const understandItems = [
  { icon: <ScanLine className="w-6 h-6" />, title: 'Nutrition', description: 'Calories, macros, and micronutrients.' },
  { icon: <Tags className="w-6 h-6" />, title: 'Ingredients', description: "What's actually inside, in plain language." },
  { icon: <ShieldCheck className="w-6 h-6" />, title: 'Allergens', description: 'Clear flags so nothing surprises you.' },
  { icon: <Database className="w-6 h-6" />, title: 'Label claims', description: 'Checked against the real numbers.' },
  { icon: <GitCompare className="w-6 h-6" />, title: 'Alternatives', description: 'Genuinely better-scoring options.' },
  { icon: <Store className="w-6 h-6" />, title: 'Restaurants', description: 'Transparency on menus near you.' },
];

/** Single-screen gate: sign in or create an account. Nothing else on this page — that's the point. */
const AuthGate: React.FC = () => (
  <section className="min-h-[calc(100vh-64px)] flex items-center bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-5 gap-10 items-center w-full">
      <div className="lg:col-span-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-5">
          <Sparkles className="w-3.5 h-3.5" /> Real product data, not guesses
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-gray-900 leading-[1.1] mb-5">
          Know what's behind <span className="text-emerald-600">every bite.</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Scan any barcode and get real nutrition, ingredients, and allergen data —
          sourced live, explained clearly. Sign in to get started.
        </p>

        <div className="space-y-3">
          <Link to="/signup" className="block">
            <Button size="lg" fullWidth>Create your free account</Button>
          </Link>
          <Link to="/login" className="block">
            <Button variant="outline" size="lg" fullWidth>Sign in</Button>
          </Link>
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-50 to-green-50 p-6 sm:p-10 overflow-hidden">
          <svg viewBox="0 0 480 320" className="w-full h-auto">
            <rect x="20" y="20" width="440" height="280" rx="18" fill="#ffffff" stroke="#d1fae5" strokeWidth="2" />
            <rect x="70" y="70" width="150" height="190" rx="10" fill="#f0fdf4" stroke="#86efac" strokeWidth="2" />
            <rect x="90" y="95" width="110" height="14" rx="3" fill="#16a34a" opacity="0.35" />
            <rect x="90" y="118" width="80" height="10" rx="3" fill="#16a34a" opacity="0.2" />
            <rect x="90" y="200" width="110" height="34" rx="4" fill="#111827" opacity="0.85" />
            {Array.from({ length: 14 }).map((_, i) => (
              <rect key={i} x={95 + i * 7.2} y={206} width={i % 3 === 0 ? 3 : 2} height="22" fill="#ffffff" />
            ))}
            <g stroke="#16a34a" strokeWidth="4" strokeLinecap="round" fill="none">
              <path d="M55 60V45a8 8 0 0 1 8-8h15" />
              <path d="M235 37h15a8 8 0 0 1 8 8v15" />
              <path d="M55 265v15a8 8 0 0 0 8 8h15" />
              <path d="M258 288h15a8 8 0 0 0 8-8v-15" />
            </g>
            <rect x="55" y="160" width="203" height="4" rx="2" fill="#22c55e">
              <animate attributeName="y" values="55;255;55" dur="3.2s" repeatCount="indefinite" />
            </rect>
            <g transform="translate(285,80)">
              <rect width="150" height="160" rx="14" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" />
              <circle cx="35" cy="38" r="22" fill="#dcfce7" />
              <text x="35" y="44" textAnchor="middle" fontSize="16" fontWeight="700" fill="#15803d">86</text>
              <rect x="68" y="26" width="66" height="10" rx="3" fill="#111827" opacity="0.7" />
              <rect x="68" y="42" width="50" height="8" rx="3" fill="#9ca3af" />
              <rect x="20" y="75" width="110" height="7" rx="3" fill="#e5e7eb" />
              <rect x="20" y="75" width="80" height="7" rx="3" fill="#22c55e" />
              <rect x="20" y="92" width="110" height="7" rx="3" fill="#e5e7eb" />
              <rect x="20" y="92" width="95" height="7" rx="3" fill="#22c55e" />
              <rect x="20" y="109" width="110" height="7" rx="3" fill="#e5e7eb" />
              <rect x="20" y="109" width="60" height="7" rx="3" fill="#f59e0b" />
              <rect x="20" y="130" width="110" height="20" rx="6" fill="#f0fdf4" stroke="#86efac" />
              <text x="75" y="144" textAnchor="middle" fontSize="9" fill="#15803d" fontWeight="600">Nutri-Score A</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  </section>
);

/** The real homepage — only ever seen once signed in. */
const Dashboard: React.FC = () => {
  const user = authService.getCachedUser();
  const [trending, setTrending] = useState<Product[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    productService.browseCategory('snacks').then((res) => {
      setLoadingTrending(false);
      if (res.success && res.data) setTrending(res.data.items.slice(0, 6));
    });
  }, []);

  return (
    <>
      <section className="bg-gradient-to-b from-emerald-50 to-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-emerald-700 font-medium mb-1">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900 mb-6">
            What are you eating today?
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Link to="/scan">
              <Card hover className="cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Barcode className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Scan a barcode</p>
                    <p className="text-sm text-gray-500">Live camera or manual entry</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link to="/search">
              <Card hover className="cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <SearchIcon className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Search by name</p>
                    <p className="text-sm text-gray-500">Real global product data</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="What FoodLens shows you" alignment="center" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {understandItems.map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  {item.icon}
                </div>
                <p className="font-medium text-gray-900 text-sm mb-1">{item.title}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Try it now" description="Live results, fetched right now — not sample data." />
          {loadingTrending ? (
            <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading real products…
            </div>
          ) : trending.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {trending.map((product) => (
                  <Link key={product.barcode} to={`/product/${product.barcode}`}>
                    <FoodCard
                      name={product.name}
                      brand={product.brand}
                      category={product.category}
                      imageUrl={product.imageUrl}
                      score={product.score?.overall}
                    />
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link to="/search">
                  <Button variant="outline">Search for more</Button>
                </Link>
              </div>
            </>
          ) : (
            <Card className="text-center py-10">
              <p className="text-gray-600">
                Couldn't reach the live database right now — the backend may not be running.
              </p>
            </Card>
          )}
        </div>
      </section>
    </>
  );
};

const Home: React.FC = () => {
  const isAuthed = authService.isAuthenticated();

  return (
    <AppLayout>
      {isAuthed ? <Dashboard /> : <AuthGate />}
    </AppLayout>
  );
};

export default Home;

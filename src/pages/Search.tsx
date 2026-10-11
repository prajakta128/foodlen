import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, Loader2, Clock, X } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Button, Card, SectionHeader } from '../components/ui';
import { FoodCard } from '../components/food';
import { productService } from '../services/api';
import { recentSearchesService } from '../services/localData';
import type { Product } from '../types';

const CATEGORIES: { label: string; tag: string | null }[] = [
  { label: 'All', tag: null },
  { label: 'Dairy', tag: 'dairies' },
  { label: 'Snacks', tag: 'snacks' },
  { label: 'Bakery', tag: 'breads' },
  { label: 'Beverages', tag: 'beverages' },
  { label: 'Breakfast', tag: 'breakfasts' },
  { label: 'Frozen foods', tag: 'frozen-foods' },
];

const POPULAR_SEARCHES = ['Milk', 'Bread', 'Protein bar', 'Oats', 'Chicken', 'Yogurt'];

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(recentSearchesService.list());
  }, []);

  useEffect(() => {
    const term = searchQuery.trim();
    if (!term && !selectedCategory) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const res = term
        ? await productService.searchProducts(term)
        : await productService.browseCategory(selectedCategory as string);

      setLoading(false);
      if (res.success && res.data) {
        setProducts(res.data.items);
        if (term) {
          recentSearchesService.add(term);
          setRecentSearches(recentSearchesService.list());
        }
      } else {
        setError(res.error || 'Could not load products right now.');
        setProducts([]);
      }
    }, 450);

    return () => clearTimeout(handle);
  }, [searchQuery, selectedCategory]);

  const runSearch = (term: string) => {
    setSelectedCategory(null);
    setSearchQuery(term);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader
          title="Search products"
          description="Real results from Open Food Facts — search any brand or product name."
        />

        <div className="mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for products, brands, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {!hasSearched && (
          <div className="mb-8 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => runSearch(term)}
                    className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Recent Searches</h3>
                  <button
                    onClick={() => { recentSearchesService.clear(); setRecentSearches([]); }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => runSearch(term)}
                      className="flex items-center gap-2 w-full text-left px-2 py-2 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Category</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(cat.tag);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat.tag && !searchQuery
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {hasSearched && (
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <X className="w-4 h-4" /> Clear results
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Searching real product data…
          </div>
        )}

        {!loading && error && (
          <Card className="text-center py-12">
            <p className="text-red-600 font-medium mb-2">Something went wrong</p>
            <p className="text-gray-600">{error}</p>
          </Card>
        )}

        {!loading && !error && hasSearched && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.barcode}`}>
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
        )}

        {!loading && !error && hasSearched && products.length === 0 && (
          <Card className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              Try a different name, brand, or category — this searches live data, so very new products may not be indexed yet.
            </p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>
              Clear search
            </Button>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Search;


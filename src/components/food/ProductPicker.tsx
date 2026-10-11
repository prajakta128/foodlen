import React, { useEffect, useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { productService } from '../../services/api';
import type { Product } from '../../types';

interface ProductPickerProps {
  onSelect: (product: Product) => void;
  placeholder?: string;
}

/** Type-ahead product search backed by the real API — used wherever the user needs to pick a product. */
const ProductPicker: React.FC<ProductPickerProps> = ({ onSelect, placeholder = 'Search for a product…' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      const res = await productService.searchProducts(term);
      setLoading(false);
      if (res.success && res.data) setResults(res.data.items.slice(0, 6));
    }, 400);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching…
            </div>
          )}
          {!loading && results.length === 0 && (
            <p className="px-3 py-3 text-sm text-gray-500">No products found.</p>
          )}
          {!loading &&
            results.map((p) => (
              <button
                key={p.barcode}
                onClick={() => { onSelect(p); setOpen(false); setQuery(''); setResults([]); }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
              >
                <p className="font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-500 truncate">{p.brand}</p>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProductPicker;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Trash2 } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Button, SectionHeader, EmptyState } from '../components/ui';
import { FoodCard } from '../components/food';
import { savedItemsService, scanHistoryService } from '../services/localData';
import type { SavedProductEntry, ScanHistoryEntry } from '../services/localData';

const Saved: React.FC = () => {
  const [tab, setTab] = useState<'saved' | 'history'>('saved');
  const [saved, setSaved] = useState<SavedProductEntry[]>([]);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    setSaved(savedItemsService.list());
    setHistory(scanHistoryService.list());
  }, []);

  const handleRemove = (barcode: string) => {
    savedItemsService.remove(barcode);
    setSaved(savedItemsService.list());
  };

  const handleClearHistory = () => {
    scanHistoryService.clear();
    setHistory([]);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader title="Saved & History" description="Products you've saved and recently looked up — real, not sample data." />

        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setTab('saved')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              tab === 'saved' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Heart className="w-4 h-4 inline-block mr-2" />
            Saved Products ({saved.length})
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              tab === 'history' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 inline-block mr-2" />
            Scan History ({history.length})
          </button>
        </div>

        {tab === 'saved' && (
          saved.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {saved.map((item) => (
                <div key={item.barcode} className="relative group">
                  <Link to={`/product/${item.barcode}`}>
                    <FoodCard name={item.name} brand={item.brand} category={item.category} imageUrl={item.imageUrl} score={item.score} />
                  </Link>
                  <button
                    onClick={() => handleRemove(item.barcode)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove from saved"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Heart className="w-16 h-16" />}
              title="No saved products yet"
              description="Open a product and tap Save to keep it here."
              action={<Link to="/search"><Button>Browse Products</Button></Link>}
            />
          )
        )}

        {tab === 'history' && (
          history.length > 0 ? (
            <>
              <div className="flex justify-end mb-4">
                <Button variant="ghost" size="sm" onClick={handleClearHistory}>Clear history</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <Link key={item.barcode} to={`/product/${item.barcode}`}>
                    <FoodCard name={item.name} brand={item.brand} category={item.category} imageUrl={item.imageUrl} score={item.score} />
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Clock className="w-16 h-16" />}
              title="No scan history yet"
              description="Products you scan or view will show up here automatically."
              action={<Link to="/scan"><Button>Scan a product</Button></Link>}
            />
          )
        )}
      </div>
    </AppLayout>
  );
};

export default Saved;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, UtensilsCrossed, ShieldCheck, Loader2, Search as SearchIcon } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Card, SectionHeader, EmptyState } from '../components/ui';
import { restaurantService } from '../services/api';
import type { Restaurant } from '../types';

const VERIFICATION_LABEL: Record<string, string> = {
  verified: 'Verified',
  pending: 'Verification pending',
  rejected: 'Verification rejected',
};

const VERIFICATION_COLOR: Record<string, string> = {
  verified: 'bg-emerald-100 text-emerald-900',
  pending: 'bg-amber-100 text-amber-900',
  rejected: 'bg-red-100 text-red-900',
};

const Restaurants: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      const res = searchQuery.trim()
        ? await restaurantService.searchRestaurants(searchQuery.trim())
        : await restaurantService.getRestaurants();
      setLoading(false);
      if (res.success && res.data) {
        setRestaurants(res.data.items);
      } else {
        setError(res.error || 'Could not load restaurants right now.');
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader
          title="Restaurant Menu Transparency"
          description="Restaurants that have listed their real menu data — no ratings or reviews invented."
        />

        <div className="mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading restaurants…
          </div>
        )}

        {!loading && error && (
          <Card className="text-center py-12">
            <p className="text-red-600 font-medium mb-2">Something went wrong</p>
            <p className="text-gray-600">{error}</p>
          </Card>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <EmptyState
            icon={<UtensilsCrossed className="w-16 h-16" />}
            title={searchQuery ? 'No matching restaurants' : 'No restaurants listed yet'}
            description={
              searchQuery
                ? 'Try a different name or city.'
                : "No restaurant has been added to FoodLens yet — this section fills in as owners list their real menus, not from a seeded list."
            }
          />
        )}

        {!loading && !error && restaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} to={`/restaurants/${restaurant.id}`}>
                <Card hover className="cursor-pointer flex flex-col h-full">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg h-32 mb-4 flex items-center justify-center">
                    <UtensilsCrossed className="w-8 h-8 text-emerald-300" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{restaurant.name}</h3>
                    {restaurant.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p>
                    )}

                    <div className="mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          VERIFICATION_COLOR[restaurant.verification_status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {VERIFICATION_LABEL[restaurant.verification_status] || restaurant.verification_status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {restaurant.menu_item_count ?? 0} menu item{restaurant.menu_item_count === 1 ? '' : 's'} listed
                    </p>

                    {(restaurant.address || restaurant.city) && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{[restaurant.address, restaurant.city].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Restaurants;

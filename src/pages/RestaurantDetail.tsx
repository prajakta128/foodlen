import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, Loader2, UtensilsCrossed, AlertTriangle } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Card, SectionHeader, ErrorMessage, EmptyState } from '../components/ui';
import { restaurantService } from '../services/api';
import type { Restaurant, MenuItem } from '../types';

const VERIFICATION_LABEL: Record<string, string> = {
  verified: 'Verified restaurant',
  pending: 'Verification pending',
  rejected: 'Verification rejected',
};

const VERIFICATION_COLOR: Record<string, string> = {
  verified: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  pending: 'bg-amber-50 border-amber-200 text-amber-900',
  rejected: 'bg-red-50 border-red-200 text-red-900',
};

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    restaurantService.getRestaurant(id).then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setRestaurant(res.data);
        restaurantService.getMenuItems(id).then((menuRes) => {
          if (menuRes.success && menuRes.data) setMenuItems(menuRes.data);
        });
      } else {
        setError(res.error || 'Restaurant not found.');
      }
    });
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32 text-gray-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin" /> Loading restaurant…
        </div>
      </AppLayout>
    );
  }

  if (error || !restaurant) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <ErrorMessage title="Restaurant not found" message={error || "We couldn't find this restaurant."} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg h-64 flex items-center justify-center">
              <UtensilsCrossed className="w-10 h-10 text-emerald-300" />
            </div>
          </div>

          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
            {restaurant.description && <p className="text-gray-600 mb-4">{restaurant.description}</p>}

            <div className="space-y-3 mb-6">
              {(restaurant.address || restaurant.city) && (
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <span>{[restaurant.address, restaurant.city].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {restaurant.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <span>{restaurant.phone}</span>
                </div>
              )}
              {restaurant.email && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <span>{restaurant.email}</span>
                </div>
              )}
            </div>

            <Card className={`border ${VERIFICATION_COLOR[restaurant.verification_status] || 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">
                  {VERIFICATION_LABEL[restaurant.verification_status] || restaurant.verification_status} ·{' '}
                  {menuItems.length} menu item{menuItems.length === 1 ? '' : 's'} listed
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="mb-12">
          <SectionHeader title="Menu" />
          {menuItems.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed className="w-12 h-12" />}
              title="No menu items listed yet"
              description="This restaurant hasn't added any menu items."
            />
          ) : (
            <div className="space-y-4">
              {menuItems.filter((item) => item.is_active).map((item) => (
                <Card key={item.id} hover>
                  <div className="flex items-start justify-between mb-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                      {item.description && <p className="text-gray-600">{item.description}</p>}
                    </div>
                    <p className="font-semibold text-gray-900 flex-shrink-0">${item.price.toFixed(2)}</p>
                  </div>

                  {(item.ingredients || item.allergens || item.nutrition_json) && (
                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      {item.ingredients && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Ingredients:</span> {item.ingredients}
                        </p>
                      )}
                      {item.allergens && (
                        <p className="text-sm text-gray-700 flex items-start gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span><span className="font-medium">Allergens:</span> {item.allergens}</span>
                        </p>
                      )}
                      {item.nutrition_json && (
                        <div className="flex flex-wrap gap-6 pt-2">
                          {Object.entries(item.nutrition_json).map(([key, value]) => (
                            <div key={key}>
                              <p className="text-xs text-gray-600 capitalize">{key}</p>
                              <p className="font-semibold text-gray-900">{value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default RestaurantDetail;

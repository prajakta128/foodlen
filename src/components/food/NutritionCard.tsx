import React from 'react';
import Card from '../ui/Card';
import NutrientBar from './NutrientBar';
import type { Nutrition } from '../../types';

interface NutritionCardProps {
  nutrition: Nutrition;
  servingSize?: string;
  compact?: boolean;
}

// Standard published daily-value references (FDA 2,000-kcal diet), not per-product estimates.
const DV = {
  calories: 2000,
  protein: 50,
  carbohydrates: 275,
  fat: 78,
  saturatedFat: 20,
  fiber: 28,
  sugar: 50,
  sodium: 2300,
};

const NutritionCard: React.FC<NutritionCardProps> = ({ nutrition, servingSize = 'per serving', compact = false }) => {
  if (compact) {
    return (
      <Card>
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-gray-900">Nutrition {servingSize}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Calories</p>
              <p className="text-2xl font-display font-semibold text-gray-900 tabular-nums">{nutrition.calories ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Protein</p>
              <p className="text-2xl font-display font-semibold text-gray-900 tabular-nums">{nutrition.protein ?? '—'}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fat</p>
              <p className="text-2xl font-display font-semibold text-gray-900 tabular-nums">{nutrition.fat ?? '—'}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Carbs</p>
              <p className="text-2xl font-display font-semibold text-gray-900 tabular-nums">{nutrition.carbohydrates ?? '—'}g</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-display text-lg font-semibold text-gray-900">Nutrition Facts</h3>
        <span className="text-sm text-gray-500">{servingSize}</span>
      </div>
      <div className="flex items-center justify-between py-4 border-b-2 border-gray-900 mb-1">
        <span className="font-semibold text-gray-900">Calories</span>
        <span className="text-3xl font-display font-semibold text-gray-900 tabular-nums">{nutrition.calories ?? '—'}</span>
      </div>
      <div className="divide-y divide-gray-100">
        <NutrientBar label="Total Fat" value={nutrition.fat} unit="g" dailyValue={DV.fat} invert />
        <NutrientBar label="Saturated Fat" value={nutrition.saturatedFat} unit="g" dailyValue={DV.saturatedFat} invert />
        <NutrientBar label="Sodium" value={nutrition.sodium} unit="mg" dailyValue={DV.sodium} invert />
        <NutrientBar label="Total Carbohydrates" value={nutrition.carbohydrates} unit="g" dailyValue={DV.carbohydrates} />
        <NutrientBar label="Dietary Fiber" value={nutrition.fiber} unit="g" dailyValue={DV.fiber} />
        <NutrientBar label="Sugars" value={nutrition.sugar} unit="g" dailyValue={DV.sugar} invert />
        <NutrientBar label="Protein" value={nutrition.protein} unit="g" dailyValue={DV.protein} />
      </div>
      <p className="text-xs text-gray-400 mt-4">
        % Daily Value based on a standard 2,000 calorie diet. Bars show how this product's actual reported values compare — not an estimate.
      </p>
    </Card>
  );
};

export default NutritionCard;

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Button, Card, SectionHeader } from '../components/ui';
import { ProductPicker } from '../components/food';
import { productService } from '../services/api';
import type { Product } from '../types';

interface Row {
  label: string;
  unit: string;
  a?: number;
  b?: number;
  lowerIsBetter: boolean;
}

const buildRows = (a: Product, b: Product): Row[] => [
  { label: 'Calories', unit: 'kcal', a: a.nutrition.calories, b: b.nutrition.calories, lowerIsBetter: true },
  { label: 'Protein', unit: 'g', a: a.nutrition.protein, b: b.nutrition.protein, lowerIsBetter: false },
  { label: 'Carbohydrates', unit: 'g', a: a.nutrition.carbohydrates, b: b.nutrition.carbohydrates, lowerIsBetter: true },
  { label: 'Sugar', unit: 'g', a: a.nutrition.sugar, b: b.nutrition.sugar, lowerIsBetter: true },
  { label: 'Fat', unit: 'g', a: a.nutrition.fat, b: b.nutrition.fat, lowerIsBetter: true },
  { label: 'Saturated fat', unit: 'g', a: a.nutrition.saturatedFat, b: b.nutrition.saturatedFat, lowerIsBetter: true },
  { label: 'Fiber', unit: 'g', a: a.nutrition.fiber, b: b.nutrition.fiber, lowerIsBetter: false },
  { label: 'Sodium', unit: 'mg', a: a.nutrition.sodium, b: b.nutrition.sodium, lowerIsBetter: true },
];

const winnerOf = (row: Row): 'a' | 'b' | null => {
  if (row.a == null || row.b == null || row.a === row.b) return null;
  const aWins = row.lowerIsBetter ? row.a < row.b : row.a > row.b;
  return aWins ? 'a' : 'b';
};

const ProductSlot: React.FC<{
  label: string;
  product: Product | null;
  onSelect: (p: Product) => void;
  onClear: () => void;
}> = ({ label, product, onSelect, onClear }) => (
  <Card>
    <p className="text-sm text-gray-600 mb-2">{label}</p>
    {product ? (
      <div>
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.brand}</p>
          </div>
          <button onClick={onClear} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        {product.score && (
          <div className="bg-emerald-50 rounded p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{product.score.overall}</p>
            <p className="text-xs text-gray-600">FoodLens Score</p>
          </div>
        )}
      </div>
    ) : (
      <ProductPicker onSelect={onSelect} placeholder="Search a product…" />
    )}
  </Card>
);

const Compare: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [productA, setProductA] = useState<Product | null>(null);
  const [productB, setProductB] = useState<Product | null>(null);
  const [loadingPrefill, setLoadingPrefill] = useState(!!searchParams.get('a'));

  React.useEffect(() => {
    const aBarcode = searchParams.get('a');
    if (!aBarcode) return;
    productService.getProduct(aBarcode).then((res) => {
      setLoadingPrefill(false);
      if (res.success && res.data) setProductA(res.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = productA && productB ? buildRows(productA, productB) : [];
  const aWinCount = rows.filter((r) => winnerOf(r) === 'a').length;
  const bWinCount = rows.filter((r) => winnerOf(r) === 'b').length;
  const overallWinner =
    productA?.score && productB?.score
      ? productA.score.overall === productB.score.overall
        ? null
        : productA.score.overall > productB.score.overall ? productA : productB
      : null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader
          title="Compare Products"
          description="Pick two real products to see how their nutrition actually stacks up."
        />

        {loadingPrefill ? (
          <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading product…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-start">
              <ProductSlot label="Product A" product={productA} onSelect={setProductA} onClear={() => setProductA(null)} />
              <div className="hidden md:flex items-center justify-center pt-12">
                <p className="text-2xl font-bold text-gray-400">VS</p>
              </div>
              <ProductSlot label="Product B" product={productB} onSelect={setProductB} onClear={() => setProductB(null)} />
            </div>

            {productA && productB && (
              <>
                <div className="mb-12">
                  <SectionHeader title="Nutrition per serving" />
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Nutrient</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">{productA.name}</th>
                            <th className="text-center py-3 px-4"></th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">{productB.name}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => {
                            const winner = winnerOf(row);
                            return (
                              <tr key={row.label} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-4 px-4 font-medium text-gray-900">{row.label}</td>
                                <td className={`text-center py-4 px-4 font-medium ${winner === 'a' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                  {row.a != null ? `${row.a}${row.unit}` : '—'}
                                </td>
                                <td className="text-center py-4 px-4">
                                  {winner && (
                                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Better</span>
                                  )}
                                </td>
                                <td className={`text-center py-4 px-4 font-medium ${winner === 'b' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                  {row.b != null ? `${row.b}${row.unit}` : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>

                <div className="mb-12">
                  <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
                    <div className="text-center">
                      {overallWinner ? (
                        <>
                          <p className="text-gray-600 mb-2">Better overall FoodLens Score</p>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">{overallWinner.name}</h3>
                          <p className="text-gray-700 mb-6">
                            Wins {overallWinner === productA ? aWinCount : bWinCount} of {rows.length} nutrient categories,
                            with a FoodLens Score of {overallWinner.score?.overall}/100.
                          </p>
                          <Link to={`/product/${overallWinner.barcode}`}>
                            <Button>View {overallWinner === productA ? 'Product A' : 'Product B'}</Button>
                          </Link>
                        </>
                      ) : (
                        <p className="text-gray-700">These two products score about the same overall — check the table above for the nutrients that matter most to you.</p>
                      )}
                    </div>
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Compare;

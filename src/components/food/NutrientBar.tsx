import React from 'react';

interface NutrientBarProps {
  label: string;
  value: number | undefined;
  unit: string;
  dailyValue: number; // standard reference daily value for this nutrient (FDA/ICMR published figures)
  invert?: boolean; // true when lower is better (sugar, sodium, sat fat) - affects color only
}

const barColor = (pct: number, invert: boolean) => {
  if (invert) {
    if (pct <= 15) return '#16a34a';
    if (pct <= 30) return '#65a30d';
    if (pct <= 50) return '#d97706';
    return '#dc2626';
  }
  if (pct >= 20) return '#16a34a';
  if (pct >= 10) return '#65a30d';
  return '#9ca3af';
};

/** A single nutrient row with a real %-of-daily-value bar, not just a number. */
const NutrientBar: React.FC<NutrientBarProps> = ({ label, value, unit, dailyValue, invert = false }) => {
  if (value == null) {
    return (
      <div className="flex items-center justify-between py-2 text-sm text-gray-400">
        <span>{label}</span>
        <span>Not reported</span>
      </div>
    );
  }

  const pct = Math.min((value / dailyValue) * 100, 100);
  const color = barColor(pct, invert);

  return (
    <div className="py-2.5">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900 tabular-nums">
          {value}{unit} <span className="text-gray-400 font-normal">· {Math.round(pct)}% DV</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default NutrientBar;

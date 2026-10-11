import React from 'react';

interface ScoreRingProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

const colorFor = (score: number) => {
  if (score >= 80) return '#16a34a'; // verdant
  if (score >= 60) return '#65a30d';
  if (score >= 40) return '#d97706';
  return '#dc2626';
};

/** The one recurring visual signature: a food's score, drawn as a ring — never just a number. */
const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 64, strokeWidth = 6, label, className = '' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(score, 0), 100) / 100);
  const color = colorFor(score);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-semibold tabular-nums text-gray-900" style={{ fontSize: size * 0.32 }}>
          {Math.round(score)}
        </span>
        {label && <span className="text-gray-500" style={{ fontSize: size * 0.12 }}>{label}</span>}
      </div>
    </div>
  );
};

export default ScoreRing;

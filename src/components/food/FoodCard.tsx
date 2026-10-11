import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ScoreRing from './ScoreRing';

interface FoodCardProps {
  name: string;
  brand: string;
  imageUrl?: string;
  score?: number;
  category: string;
  onClick?: () => void;
  showScore?: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({
  name,
  brand,
  imageUrl,
  score,
  category,
  onClick,
  showScore = true,
}) => {
  return (
    <Card hover className="cursor-pointer !p-0 overflow-hidden" onClick={onClick}>
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-emerald-50 to-green-50 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <p className="text-sm font-medium">No image</p>
          </div>
        )}
        {showScore && score !== undefined && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full shadow-md">
            <ScoreRing score={score} size={48} strokeWidth={4} />
          </div>
        )}
      </div>

      <div className="p-4">
        <Badge className="mb-2">{category}</Badge>
        <h3 className="font-display font-semibold text-gray-900 text-lg leading-snug mb-1 line-clamp-2">{name}</h3>
        <p className="text-sm text-gray-500">{brand}</p>
      </div>
    </Card>
  );
};

export default FoodCard;

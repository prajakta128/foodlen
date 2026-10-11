import React from 'react';
import { ChevronRight } from 'lucide-react';
import Card from '../ui/Card';

interface ProductPreviewProps {
  name: string;
  brand: string;
  imageUrl?: string;
  onClick?: () => void;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({
  name,
  brand,
  imageUrl,
  onClick,
}) => {
  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-4">
        {/* Image */}
        <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-emerald-50 to-green-50 rounded-md flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-md" />
          ) : (
            <span className="text-xs text-gray-400">Image</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{name}</h4>
          <p className="text-sm text-gray-600">{brand}</p>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </Card>
  );
};

export default ProductPreview;

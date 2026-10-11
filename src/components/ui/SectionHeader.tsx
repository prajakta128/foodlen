import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  alignment?: 'left' | 'center';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  description,
  alignment = 'left',
}) => {
  const alignClass = alignment === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={`mb-8 ${alignClass}`}>
      {subtitle && <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide mb-2">{subtitle}</p>}
      <h2 className="font-display text-3xl font-semibold text-gray-900 mb-2">{title}</h2>
      {description && <p className="text-lg text-gray-600 max-w-2xl">{description}</p>}
    </div>
  );
};

export default SectionHeader;

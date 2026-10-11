import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = false, className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl p-6 bg-white';

    const variantStyles = {
      default: 'border border-gray-200/70 shadow-[0_1px_2px_rgba(16,24,16,0.04)]',
      elevated: 'shadow-[0_4px_16px_rgba(16,24,16,0.08)]',
      outlined: 'border-2 border-gray-300',
    };

    const hoverStyle = hover ? 'hover:shadow-[0_8px_24px_rgba(16,24,16,0.10)] hover:-translate-y-0.5 transition-all duration-200' : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${hoverStyle} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;

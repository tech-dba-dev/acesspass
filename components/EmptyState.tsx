import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'filter';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'search':
        return 'bg-primary-50/50 border-primary-100';
      case 'filter':
        return 'bg-amber-50/50 border-amber-100';
      default:
        return 'bg-gray-50/50 border-gray-100';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'search':
        return 'text-primary-400';
      case 'filter':
        return 'text-amber-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className={`rounded-2xl border-2 border-dashed p-12 text-center ${getVariantStyles()}`}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
          variant === 'search' ? 'bg-primary-100/50' :
          variant === 'filter' ? 'bg-amber-100/50' :
          'bg-gray-100'
        }`}>
          <Icon className={`w-10 h-10 ${getIconStyles()}`} />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-sm text-gray-500">
            {description}
          </p>
        </div>

        {action && (
          <button
            onClick={action.onClick}
            className="mt-4 px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:bg-gradient-primary-hover font-medium shadow-sm hover:shadow transition-all"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

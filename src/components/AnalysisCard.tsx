import React from 'react';
import './AnalysisCard.css';

export type AnalysisType = 'error' | 'security' | 'refactoring';

export interface AnalysisCardProps {
  type: AnalysisType;
  title: string;
  description: string;
  codeLine?: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ 
  type, 
  title, 
  description, 
  codeLine 
}) => {
  const getTypeConfig = (type: AnalysisType) => {
    switch (type) {
      case 'error':
        return {
          className: 'analysis-card--error',
          icon: '❌',
          label: 'Hata'
        };
      case 'security':
        return {
          className: 'analysis-card--security',
          icon: '🔒',
          label: 'Güvenlik'
        };
      case 'refactoring':
        return {
          className: 'analysis-card--refactoring',
          icon: '🔧',
          label: 'Refactoring'
        };
      default:
        return {
          className: 'analysis-card--default',
          icon: '📝',
          label: 'Öneri'
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <div className={`analysis-card ${config.className}`}>
      <div className="analysis-card__header">
        <span className="analysis-card__icon">{config.icon}</span>
        <span className="analysis-card__type">{config.label}</span>
      </div>
      <div className="analysis-card__content">
        <h3 className="analysis-card__title">{title}</h3>
        <p className="analysis-card__description">{description}</p>
        {codeLine && (
          <div className="analysis-card__code">
            <code>{codeLine}</code>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisCard;

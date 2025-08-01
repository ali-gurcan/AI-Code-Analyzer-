import React from 'react';
import AnalysisCard from './AnalysisCard';
import type { AnalysisType } from './AnalysisCard';
import type { AnalysisResult } from '../classes/GeminiClient';
import './AnalysisResults.css';

interface AnalysisResultsProps {
  results: AnalysisResult;
  isLoading?: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
  results, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="analysis-results">
        <div className="analysis-results__loading">
          <div className="spinner"></div>
          <p>Kod analiz ediliyor...</p>
        </div>
      </div>
    );
  }

  const totalIssues = results.errors.length + 
                     results.securityVulnerabilities.length + 
                     results.refactoringSuggestions.length;

  if (totalIssues === 0) {
    return (
      <div className="analysis-results">
        <div className="analysis-results__empty">
          <span className="analysis-results__empty-icon">✅</span>
          <p>Harika! Kodunuzda herhangi bir sorun bulunamadı.</p>
        </div>
      </div>
    );
  }

  const renderAnalysisSection = (
    items: string[], 
    type: AnalysisType, 
    title: string
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="analysis-results__section">
        <h2 className="analysis-results__section-title">
          {title} ({items.length})
        </h2>
        {items.map((item, index) => (
          <AnalysisCard
            key={`${type}-${index}`}
            type={type}
            title={`${title} ${index + 1}`}
            description={item}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="analysis-results">
      <div className="analysis-results__summary">
        <h2>Analiz Sonuçları</h2>
        <p>
          Toplam {totalIssues} sorun bulundu: {' '}
          {results.errors.length > 0 && `${results.errors.length} hata`}
          {results.errors.length > 0 && (results.securityVulnerabilities.length > 0 || results.refactoringSuggestions.length > 0) && ', '}
          {results.securityVulnerabilities.length > 0 && `${results.securityVulnerabilities.length} güvenlik açığı`}
          {results.securityVulnerabilities.length > 0 && results.refactoringSuggestions.length > 0 && ', '}
          {results.refactoringSuggestions.length > 0 && `${results.refactoringSuggestions.length} refactoring önerisi`}
        </p>
      </div>

      {renderAnalysisSection(results.errors, 'error', 'Hatalar')}
      {renderAnalysisSection(results.securityVulnerabilities, 'security', 'Güvenlik Açıkları')}
      {renderAnalysisSection(results.refactoringSuggestions, 'refactoring', 'Refactoring Önerileri')}
    </div>
  );
};

export default AnalysisResults;

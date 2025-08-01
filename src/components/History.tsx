import React, { useState, useEffect } from 'react';
import { LocalStorageManager } from '../classes/LocalStorageManager';
import AnalysisResults from './AnalysisResults';
import type { SavedAnalysis } from '../classes/LocalStorageManager';
import './History.css';

const History: React.FC = () => {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const storageManager = new LocalStorageManager();

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = () => {
    try {
      const savedAnalyses = storageManager.getAnalyses();
      setAnalyses(savedAnalyses);
    } catch (error) {
      console.error('Error loading analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnalysis = (id: string) => {
    try {
      storageManager.deleteAnalysis(id);
      setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
      
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Tüm analiz geçmişini silmek istediğinizden emin misiniz?')) {
      try {
        storageManager.clearAnalyses();
        setAnalyses([]);
        setSelectedAnalysis(null);
      } catch (error) {
        console.error('Error clearing analyses:', error);
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalIssues = (analysis: SavedAnalysis) => {
    return analysis.result.errors.length + 
           analysis.result.securityVulnerabilities.length + 
           analysis.result.refactoringSuggestions.length;
  };

  if (isLoading) {
    return (
      <div className="history">
        <div className="history__loading">
          <div className="spinner"></div>
          <p>Analiz geçmişi yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="history">
        <div className="history__header">
          <h1>Analiz Geçmişi</h1>
        </div>
        <div className="history__empty">
          <span className="history__empty-icon">📝</span>
          <p>Henüz hiç kod analizi yapmadınız.</p>
          <p className="history__empty-subtitle">
            Ana sayfada kod analizi yaptığınızda sonuçlar burada görünecektir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="history__header">
        <h1>Analiz Geçmişi ({analyses.length})</h1>
        <button
          onClick={handleClearAll}
          className="history__clear-button"
        >
          Tümünü Sil
        </button>
      </div>

      <div className="history__content">
        <div className="history__list">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className={`history__item ${
                selectedAnalysis?.id === analysis.id ? 'history__item--selected' : ''
              }`}
              onClick={() => setSelectedAnalysis(analysis)}
            >
              <div className="history__item-header">
                <span className="history__item-date">
                  {formatDate(analysis.timestamp)}
                </span>
                <div className="history__item-stats">
                  <span className="history__item-issues">
                    {getTotalIssues(analysis)} sorun
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAnalysis(analysis.id);
                    }}
                    className="history__item-delete"
                    title="Bu analizi sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="history__item-code">
                <code>{analysis.codeSnippet}...</code>
              </div>
              <div className="history__item-breakdown">
                {analysis.result.errors.length > 0 && (
                  <span className="history__item-count history__item-count--error">
                    {analysis.result.errors.length} hata
                  </span>
                )}
                {analysis.result.securityVulnerabilities.length > 0 && (
                  <span className="history__item-count history__item-count--security">
                    {analysis.result.securityVulnerabilities.length} güvenlik
                  </span>
                )}
                {analysis.result.refactoringSuggestions.length > 0 && (
                  <span className="history__item-count history__item-count--refactoring">
                    {analysis.result.refactoringSuggestions.length} refactoring
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="history__details">
          {selectedAnalysis ? (
            <>
              <div className="history__details-header">
                <h2>Analiz Detayları</h2>
                <span className="history__details-date">
                  {formatDate(selectedAnalysis.timestamp)}
                </span>
              </div>
              <AnalysisResults results={selectedAnalysis.result} />
            </>
          ) : (
            <div className="history__details-empty">
              <p>Detaylarını görmek için sol taraftan bir analiz seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;

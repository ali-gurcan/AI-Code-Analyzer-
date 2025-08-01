import React, { useState, useCallback, useMemo } from 'react';
import { GeminiClient } from '../classes/GeminiClient';
import { LocalStorageManager } from '../classes/LocalStorageManager';
import AnalysisResults from './AnalysisResults';
import type { AnalysisResult } from '../classes/GeminiClient';
import './CodeAnalyzer.css';

export interface CodeAnalyzerProps {
  apiKey?: string;
}

const CodeAnalyzer: React.FC<CodeAnalyzerProps> = ({ apiKey }) => {
  const [code, setCode] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentApiKey, setCurrentApiKey] = useState<string>(
    apiKey || import.meta.env.VITE_GEMINI_API_KEY || ''
  );

  const geminiClient = useMemo(() => {
    return currentApiKey ? new GeminiClient(currentApiKey) : null;
  }, [currentApiKey]);
  
  const storageManager = useMemo(() => new LocalStorageManager(), []);

  const handleAnalyzeCode = useCallback(async () => {
    if (!geminiClient) {
      setError('Lütfen geçerli bir API anahtarı girin.');
      return;
    }

    if (!code.trim()) {
      setError('Lütfen analiz edilecek kodu girin.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await geminiClient.analyzeCode(code);
      setAnalysisResult(result);
      
      // Save analysis to localStorage
      storageManager.saveAnalysis(code, result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu';
      setError(`Analiz sırasında hata oluştu: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [geminiClient, code, storageManager]);

  const handleClearCode = useCallback(() => {
    setCode('');
    setAnalysisResult(null);
    setError(null);
  }, []);

  const handleExampleCode = useCallback(() => {
    const exampleCode = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total.
}

// Kullanıcı girişi doğrulanmıyor
function login(username, password) {
  if (username == "admin" && password == 123456") {
    return true;
  }
  return false;
}`;
    
    setCode(exampleCode);
    setAnalysisResult(null);
    setError(null);
  }, []);

  return (
    <div className="code-analyzer">
      <div className="code-analyzer__header">
        <h1>Kod Analiz Aracı</h1>
        <p>Kodunuzu Gemini AI ile analiz edin ve iyileştirme önerileri alın.</p>
      </div>

      <div className="code-analyzer__api-key">
        <label htmlFor="api-key">Gemini API Anahtarı:</label>
        <input
          id="api-key"
          type="password"
          value={currentApiKey}
          onChange={(e) => setCurrentApiKey(e.target.value)}
          placeholder="API anahtarınızı buraya girin..."
          className="code-analyzer__api-key-input"
        />
        {!currentApiKey && (
          <p className="code-analyzer__api-key-help">
            API anahtarınızı{' '}
            <a 
              href="https://ai.google.dev/tutorials/setup" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Google AI Studio
            </a>
            'dan alabilirsiniz.
          </p>
        )}
      </div>

      <div className="code-analyzer__input">
        <div className="code-analyzer__input-header">
          <label htmlFor="code-input">Analiz edilecek kod:</label>
          <div className="code-analyzer__input-actions">
            <button
              type="button"
              onClick={handleExampleCode}
              className="code-analyzer__button code-analyzer__button--secondary"
            >
              Örnek Kod
            </button>
            <button
              type="button"
              onClick={handleClearCode}
              className="code-analyzer__button code-analyzer__button--secondary"
              disabled={!code.trim()}
            >
              Temizle
            </button>
          </div>
        </div>
        <textarea
          id="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Kodunuzu buraya yapıştırın..."
          className="code-analyzer__textarea"
          rows={15}
        />
      </div>

      <div className="code-analyzer__actions">
        <button
          onClick={handleAnalyzeCode}
          disabled={isLoading || !currentApiKey || !code.trim()}
          className="code-analyzer__button code-analyzer__button--primary"
        >
          {isLoading ? 'Analiz Ediliyor...' : 'Kodu Analiz Et'}
        </button>
      </div>

      {error && (
        <div className="code-analyzer__error">
          <span className="code-analyzer__error-icon">❌</span>
          <p>{error}</p>
        </div>
      )}

      {(analysisResult || isLoading) && (
        <AnalysisResults 
          results={analysisResult || { errors: [], securityVulnerabilities: [], refactoringSuggestions: [] }} 
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default CodeAnalyzer;

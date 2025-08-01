import type { AnalysisResult } from './GeminiClient';

export interface SavedAnalysis {
  id: string;
  timestamp: number;
  codeSnippet: string;
  result: AnalysisResult;
}

export class LocalStorageManager {
  private storageKey: string = 'code-analysis-history';

  saveAnalysis(codeSnippet: string, result: AnalysisResult): void {
    try {
      const existingAnalyses = this.getAnalyses();
      const newAnalysis: SavedAnalysis = {
        id: this.generateId(),
        timestamp: Date.now(),
        codeSnippet: codeSnippet.substring(0, 200), // Save first 200 chars as preview
        result
      };

      existingAnalyses.unshift(newAnalysis); // Add to beginning
      
      // Keep only last 50 analyses to prevent storage overflow
      const limitedAnalyses = existingAnalyses.slice(0, 50);
      
      localStorage.setItem(this.storageKey, JSON.stringify(limitedAnalyses));
    } catch (error) {
      console.error('Error saving analysis to localStorage:', error);
      throw new Error('Failed to save analysis');
    }
  }

  getAnalyses(): SavedAnalysis[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading analyses from localStorage:', error);
      return [];
    }
  }

  clearAnalyses(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing analyses from localStorage:', error);
      throw new Error('Failed to clear analyses');
    }
  }

  deleteAnalysis(id: string): void {
    try {
      const analyses = this.getAnalyses();
      const filteredAnalyses = analyses.filter(analysis => analysis.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredAnalyses));
    } catch (error) {
      console.error('Error deleting analysis from localStorage:', error);
      throw new Error('Failed to delete analysis');
    }
  }

  private generateId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

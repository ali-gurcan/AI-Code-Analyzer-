import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageManager } from '../classes/LocalStorageManager';
import type { AnalysisResult } from '../classes/GeminiClient';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('LocalStorageManager', () => {
  let storageManager: LocalStorageManager;

  const mockAnalysisResult: AnalysisResult = {
    errors: ['Test error'],
    securityVulnerabilities: ['Security issue'],
    refactoringSuggestions: ['Refactor suggestion']
  };

  beforeEach(() => {
    storageManager = new LocalStorageManager();
    vi.clearAllMocks();
  });

  describe('saveAnalysis', () => {
    it('should save analysis to localStorage', () => {
      const mockCode = 'function test() {}';
      localStorageMock.getItem.mockReturnValue('[]');

      storageManager.saveAnalysis(mockCode, mockAnalysisResult);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('code-analysis-history');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'code-analysis-history',
        expect.stringContaining(mockCode)
      );
    });

    it('should prepend new analysis to existing ones', () => {
      const mockCode = 'function test() {}';
      const existingAnalysis = [{
        id: 'existing-id',
        timestamp: Date.now() - 1000,
        codeSnippet: 'old code',
        result: mockAnalysisResult
      }];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingAnalysis));

      storageManager.saveAnalysis(mockCode, mockAnalysisResult);

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(2);
      expect(savedData[0].codeSnippet).toBe(mockCode);
      expect(savedData[1].id).toBe('existing-id');
    });

    it('should limit saved analyses to 50', () => {
      const mockCode = 'function test() {}';
      const existingAnalyses = Array.from({ length: 50 }, (_, i) => ({
        id: `analysis-${i}`,
        timestamp: Date.now() - i * 1000,
        codeSnippet: `code ${i}`,
        result: mockAnalysisResult
      }));

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingAnalyses));

      storageManager.saveAnalysis(mockCode, mockAnalysisResult);

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(50);
      expect(savedData[0].codeSnippet).toBe(mockCode);
    });

    it('should truncate code snippet to 200 characters', () => {
      const longCode = 'a'.repeat(300);
      localStorageMock.getItem.mockReturnValue('[]');

      storageManager.saveAnalysis(longCode, mockAnalysisResult);

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData[0].codeSnippet).toHaveLength(200);
    });

    it('should handle localStorage errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => storageManager.saveAnalysis('code', mockAnalysisResult))
        .toThrow('Failed to save analysis');
    });
  });

  describe('getAnalyses', () => {
    it('should return empty array when no analyses exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = storageManager.getAnalyses();

      expect(result).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('code-analysis-history');
    });

    it('should return parsed analyses from localStorage', () => {
      const mockAnalyses = [{
        id: 'test-id',
        timestamp: Date.now(),
        codeSnippet: 'test code',
        result: mockAnalysisResult
      }];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAnalyses));

      const result = storageManager.getAnalyses();

      expect(result).toEqual(mockAnalyses);
    });

    it('should handle localStorage read errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = storageManager.getAnalyses();

      expect(result).toEqual([]);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = storageManager.getAnalyses();

      expect(result).toEqual([]);
    });
  });

  describe('clearAnalyses', () => {
    it('should remove analyses from localStorage', () => {
      storageManager.clearAnalyses();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('code-analysis-history');
    });

    it('should handle localStorage errors', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => storageManager.clearAnalyses())
        .toThrow('Failed to clear analyses');
    });
  });

  describe('deleteAnalysis', () => {
    it('should remove specific analysis by id', () => {
      const mockAnalyses = [
        {
          id: 'analysis-1',
          timestamp: Date.now(),
          codeSnippet: 'code 1',
          result: mockAnalysisResult
        },
        {
          id: 'analysis-2',
          timestamp: Date.now(),
          codeSnippet: 'code 2',
          result: mockAnalysisResult
        }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAnalyses));

      storageManager.deleteAnalysis('analysis-1');

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('analysis-2');
    });

    it('should handle localStorage errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => storageManager.deleteAnalysis('test-id'))
        .toThrow('Failed to delete analysis');
    });
  });
});

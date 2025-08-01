import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocalStorageManager } from '../classes/LocalStorageManager';
import type { SavedAnalysis } from '../classes/LocalStorageManager';
import type { AnalysisResult } from '../classes/GeminiClient';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('LocalStorageManager - Comprehensive Tests', () => {
  let storageManager: LocalStorageManager;
  let consoleSpy: any;
  
  const sampleAnalysisResult: AnalysisResult = {
    errors: ['Sample error'],
    securityVulnerabilities: ['Sample vulnerability'],
    refactoringSuggestions: ['Sample suggestion']
  };

  beforeEach(() => {
    // Suppress console.error messages during testing
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    vi.clearAllMocks();
    storageManager = new LocalStorageManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    consoleSpy.mockRestore();
  });

  describe('Save Analysis Tests', () => {
    it('should save analysis to localStorage successfully', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      storageManager.saveAnalysis('test code', sampleAnalysisResult);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'code-analysis-history',
        expect.stringContaining('test code')
      );
    });

    it('should generate unique IDs for each analysis', () => {
      localStorageMock.getItem.mockReturnValue('[]');
      
      const savedData: string[] = [];
      localStorageMock.setItem.mockImplementation((_key, value) => {
        savedData.push(value);
      });

      storageManager.saveAnalysis('code1', sampleAnalysisResult);
      storageManager.saveAnalysis('code2', sampleAnalysisResult);

      expect(savedData).toHaveLength(2);
      
      const analysis1 = JSON.parse(savedData[0])[0];
      const analysis2 = JSON.parse(savedData[1])[0];
      
      expect(analysis1.id).not.toBe(analysis2.id);
    });

    it('should add timestamp to saved analysis', () => {
      localStorageMock.getItem.mockReturnValue('[]');
      const mockTimestamp = 1640995200000; // Mock timestamp
      vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
      
      storageManager.saveAnalysis('test code', sampleAnalysisResult);
      
      const savedDataCall = localStorageMock.setItem.mock.calls[0];
      const savedAnalysis = JSON.parse(savedDataCall[1])[0];
      
      expect(savedAnalysis.timestamp).toBe(mockTimestamp);
    });

    it('should truncate long code snippets to 200 characters', () => {
      const longCode = 'x'.repeat(300);
      localStorageMock.getItem.mockReturnValue('[]');
      
      storageManager.saveAnalysis(longCode, sampleAnalysisResult);
      
      const savedDataCall = localStorageMock.setItem.mock.calls[0];
      const savedAnalysis = JSON.parse(savedDataCall[1])[0];
      
      expect(savedAnalysis.codeSnippet).toHaveLength(200);
      expect(savedAnalysis.codeSnippet).toBe('x'.repeat(200));
    });

    it('should maintain analysis order (newest first)', () => {
      const existingAnalysis: SavedAnalysis = {
        id: 'existing-1',
        timestamp: 1640995200000,
        codeSnippet: 'existing code',
        result: sampleAnalysisResult
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify([existingAnalysis]));
      
      storageManager.saveAnalysis('new code', sampleAnalysisResult);
      
      const savedDataCall = localStorageMock.setItem.mock.calls[0];
      const allAnalyses = JSON.parse(savedDataCall[1]);
      
      expect(allAnalyses[0].codeSnippet).toBe('new code');
      expect(allAnalyses[1].codeSnippet).toBe('existing code');
    });

    it('should limit analyses to 50 entries', () => {
      // Create 51 existing analyses
      const existingAnalyses: SavedAnalysis[] = Array.from({ length: 51 }, (_, i) => ({
        id: `analysis-${i}`,
        timestamp: 1640995200000 + i,
        codeSnippet: `code ${i}`,
        result: sampleAnalysisResult
      }));
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingAnalyses));
      
      storageManager.saveAnalysis('new code', sampleAnalysisResult);
      
      const savedDataCall = localStorageMock.setItem.mock.calls[0];
      const allAnalyses = JSON.parse(savedDataCall[1]);
      
      expect(allAnalyses).toHaveLength(50);
      expect(allAnalyses[0].codeSnippet).toBe('new code');
      expect(allAnalyses[49].codeSnippet).toBe('code 48'); // Last kept entry (0-indexed)
    });

    it('should handle localStorage quota exceeded error', () => {
      localStorageMock.getItem.mockReturnValue('[]');
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      expect(() => {
        storageManager.saveAnalysis('test code', sampleAnalysisResult);
      }).toThrow('Failed to save analysis');
    });

    it('should handle localStorage access denied error', () => {
      localStorageMock.getItem.mockReturnValue('[]');
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });
      
      expect(() => {
        storageManager.saveAnalysis('test code', sampleAnalysisResult);
      }).toThrow('Failed to save analysis');
    });
  });

  describe('Get Analyses Tests', () => {
    it('should retrieve existing analyses from localStorage', () => {
      const existingAnalyses: SavedAnalysis[] = [
        {
          id: 'test-1',
          timestamp: 1640995200000,
          codeSnippet: 'test code 1',
          result: sampleAnalysisResult
        },
        {
          id: 'test-2',
          timestamp: 1640995300000,
          codeSnippet: 'test code 2',
          result: sampleAnalysisResult
        }
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingAnalyses));
      
      const result = storageManager.getAnalyses();
      
      expect(result).toEqual(existingAnalyses);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('code-analysis-history');
    });

    it('should return empty array when no analyses exist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = storageManager.getAnalyses();
      
      expect(result).toEqual([]);
    });

    it('should return empty array when localStorage contains empty string', () => {
      localStorageMock.getItem.mockReturnValue('');
      
      const result = storageManager.getAnalyses();
      
      expect(result).toEqual([]);
    });

    it('should handle corrupted JSON data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json {');
      
      const result = storageManager.getAnalyses();
      
      expect(result).toEqual([]);
    });

    it('should handle localStorage access denied error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });
      
      const result = storageManager.getAnalyses();
      
      expect(result).toEqual([]);
    });

    it('should handle localStorage disabled error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage is not available');
      });
      
      const result = storageManager.getAnalyses();
      
      expect(result).toEqual([]);
    });
  });

  describe('Clear Analyses Tests', () => {
    it('should clear all analyses from localStorage', () => {
      storageManager.clearAnalyses();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('code-analysis-history');
    });

    it('should handle localStorage clear error', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });
      
      expect(() => {
        storageManager.clearAnalyses();
      }).toThrow('Failed to clear analyses');
    });

    it('should handle localStorage access denied during clear', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Access denied');
      });
      
      expect(() => {
        storageManager.clearAnalyses();
      }).toThrow('Failed to clear analyses');
    });
  });

  describe('Edge Cases and Data Integrity', () => {
    it('should handle very large analysis results', () => {
      const largeAnalysisResult: AnalysisResult = {
        errors: Array.from({ length: 100 }, (_, i) => `Error ${i}: ${' '.repeat(100)}`),
        securityVulnerabilities: Array.from({ length: 50 }, (_, i) => `Vulnerability ${i}: ${' '.repeat(100)}`),
        refactoringSuggestions: Array.from({ length: 75 }, (_, i) => `Suggestion ${i}: ${' '.repeat(100)}`)
      };
      
      localStorageMock.getItem.mockReturnValue('[]');
      
      expect(() => {
        storageManager.saveAnalysis('test code', largeAnalysisResult);
      }).not.toThrow();
    });

    it('should handle analysis with empty strings', () => {
      const analysisWithEmptyStrings: AnalysisResult = {
        errors: ['', 'Valid error', ''],
        securityVulnerabilities: [''],
        refactoringSuggestions: ['Valid suggestion', '']
      };
      
      localStorageMock.getItem.mockReturnValue('[]');
      
      expect(() => {
        storageManager.saveAnalysis('', analysisWithEmptyStrings);
      }).not.toThrow();
    });

    it('should handle analysis with special characters', () => {
      const specialCharAnalysis: AnalysisResult = {
        errors: ['Error with émojis 🚨 and unicode ñáéíóú'],
        securityVulnerabilities: ['Vulnerability with "quotes" and \'apostrophes\''],
        refactoringSuggestions: ['Suggestion with <tags> and &entities;']
      };
      
      localStorageMock.getItem.mockReturnValue('[]');
      
      expect(() => {
        storageManager.saveAnalysis('console.log("test");', specialCharAnalysis);
      }).not.toThrow();
    });

    it('should handle concurrent access scenarios', () => {
      const initialAnalyses: SavedAnalysis[] = [
        {
          id: 'concurrent-1',
          timestamp: 1640995200000,
          codeSnippet: 'initial code',
          result: sampleAnalysisResult
        }
      ];
      
      // Simulate concurrent access where localStorage changes between getItem and setItem
      let callCount = 0;
      localStorageMock.getItem.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return JSON.stringify(initialAnalyses);
        }
        // Second call simulates another process modifying localStorage
        return JSON.stringify([...initialAnalyses, {
          id: 'concurrent-2',
          timestamp: 1640995300000,
          codeSnippet: 'concurrent code',
          result: sampleAnalysisResult
        }]);
      });
      
      expect(() => {
        storageManager.saveAnalysis('new code', sampleAnalysisResult);
      }).not.toThrow();
    });
  });

  describe('Performance and Memory Tests', () => {
    it('should handle rapid successive saves', () => {
      localStorageMock.getItem.mockReturnValue('[]');
      
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        storageManager.saveAnalysis(`code ${i}`, sampleAnalysisResult);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should cleanup old entries efficiently', () => {
      // Create exactly 50 existing analyses
      const existingAnalyses: SavedAnalysis[] = Array.from({ length: 50 }, (_, i) => ({
        id: `analysis-${i}`,
        timestamp: 1640995200000 + i,
        codeSnippet: `code ${i}`,
        result: sampleAnalysisResult
      }));
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingAnalyses));
      
      storageManager.saveAnalysis('new code', sampleAnalysisResult);
      
      const savedDataCall = localStorageMock.setItem.mock.calls[0];
      const allAnalyses = JSON.parse(savedDataCall[1]);
      
      expect(allAnalyses).toHaveLength(50);
      expect(allAnalyses[0].codeSnippet).toBe('new code');
      expect(allAnalyses[49].codeSnippet).toBe('code 48');
    });
  });
});

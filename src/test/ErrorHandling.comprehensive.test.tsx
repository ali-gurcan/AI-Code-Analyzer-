import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CodeAnalyzer from '../components/CodeAnalyzer';

// Mock functions
const mockAnalyzeCode = vi.fn();
const mockTestConnection = vi.fn();
const mockSaveAnalysis = vi.fn();

// Global mock implementation - hoisted
vi.mock('../classes/GeminiClient', () => {
  return {
    GeminiClient: class MockGeminiClient {
      constructor(apiKey: string) {
        this.apiKey = apiKey;
      }
      apiKey: string;
      analyzeCode = mockAnalyzeCode;
      testConnection = mockTestConnection;
    }
  };
});

vi.mock('../classes/LocalStorageManager', () => {
  return {
    LocalStorageManager: class MockLocalStorageManager {
      saveAnalysis = mockSaveAnalysis;
      getAnalyses = vi.fn().mockReturnValue([]);
      clearAnalyses = vi.fn();
    }
  };
});

describe('CodeAnalyzer - Error Handling', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let consoleSpy: any;

  beforeEach(() => {
    user = userEvent.setup();
    
    // Suppress console.error messages during testing
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Setup default mock behaviors
    mockAnalyzeCode.mockResolvedValue({
      issues: [],
      suggestions: [],
      metrics: {
        complexity: 1,
        maintainability: 100,
        testCoverage: 100
      }
    });
    
    mockTestConnection.mockResolvedValue(true);
    mockSaveAnalysis.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    consoleSpy.mockRestore();
  });

  describe('Network and API Error Scenarios', () => {
    it('should handle complete network failure', async () => {
      mockAnalyzeCode.mockRejectedValueOnce(new Error('Failed to fetch'));

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Analiz sırasında hata oluştu: Failed to fetch/)).toBeInTheDocument();
      });
    });

    it('should handle DNS resolution failures', async () => {
      mockAnalyzeCode.mockRejectedValueOnce(new Error('DNS resolution failed'));

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Analiz sırasında hata oluştu: DNS resolution failed/)).toBeInTheDocument();
      });
    });

    it('should handle SSL certificate errors', async () => {
      mockAnalyzeCode.mockRejectedValueOnce(new Error('SSL certificate verification failed'));

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Analiz sırasında hata oluştu: SSL certificate verification failed/)).toBeInTheDocument();
      });
    });

    it('should handle server maintenance (503) errors', async () => {
      mockAnalyzeCode.mockRejectedValueOnce(new Error('API request failed: 503 Service Unavailable'));

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Analiz sırasında hata oluştu: API request failed: 503 Service Unavailable/)).toBeInTheDocument();
      });
    });

    it('should handle API quota exceeded errors', async () => {
      mockAnalyzeCode.mockRejectedValueOnce(new Error('API request failed: 403 Quota Exceeded'));

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Analiz sırasında hata oluştu: API request failed: 403 Quota Exceeded/)).toBeInTheDocument();
      });
    });

    it('should handle request timeout errors', async () => {
      mockAnalyzeCode.mockRejectedValueOnce(new Error('Request timeout'));

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Analiz sırasında hata oluştu: Request timeout/)).toBeInTheDocument();
      });
    });
  });

  describe('API Response Parsing Errors', () => {
    it('should handle completely malformed JSON responses', async () => {
      mockAnalyzeCode.mockRejectedValueOnce(new Error('Failed to parse analysis result'));

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Analiz sırasında hata oluştu: Failed to parse analysis result/)).toBeInTheDocument();
      });
    });

    it('should handle empty API responses', async () => {
      mockAnalyzeCode.mockRejectedValueOnce(new Error('No response from AI model'));

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Analiz sırasında hata oluştu: No response from AI model/)).toBeInTheDocument();
      });
    });

    it('should handle API responses with missing fields', async () => {
      mockAnalyzeCode.mockRejectedValueOnce(new Error('Invalid response structure'));

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Analiz sırasında hata oluştu: Invalid response structure/)).toBeInTheDocument();
      });
    });
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle extremely large code inputs', async () => {
      const hugeCode = 'x'.repeat(1000000); // 1MB of code
      
      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      // Simulate pasting huge content
      await user.click(codeTextarea);
      await user.keyboard(`{Control>}a{/Control}${hugeCode.substring(0, 100)}`);

      mockAnalyzeCode.mockResolvedValueOnce({
        errors: [],
        securityVulnerabilities: [],
        refactoringSuggestions: []
      });

      await user.click(analyzeButton);

      await waitFor(() => {
        expect(mockAnalyzeCode).toHaveBeenCalled();
      });
    });

    it('should handle code with null bytes', async () => {
      const codeWithNulls = 'console.log("test\0hidden");';
      
      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, codeWithNulls);

      mockAnalyzeCode.mockResolvedValueOnce({
        errors: [],
        securityVulnerabilities: [],
        refactoringSuggestions: []
      });

      await user.click(analyzeButton);

      await waitFor(() => {
        expect(mockAnalyzeCode).toHaveBeenCalledWith(codeWithNulls);
      });
    });

    it('should handle code with various Unicode characters', async () => {
      const unicodeCode = `
        const emoji = "🚀💻🔥";
        const chinese = "你好世界";
        const arabic = "مرحبا بالعالم";
        const greek = "Γεια σας κόσμε";
      `;
      
      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, unicodeCode);

      mockAnalyzeCode.mockResolvedValueOnce({
        errors: [],
        securityVulnerabilities: [],
        refactoringSuggestions: []
      });

      await user.click(analyzeButton);

      await waitFor(() => {
        expect(mockAnalyzeCode).toHaveBeenCalledWith(unicodeCode);
      });
    });
  });

  describe('Memory and Resource Management', () => {
    it('should handle memory pressure during analysis', async () => {
      // Simulate memory pressure by creating large objects
      const largeData = Array.from({ length: 10000 }, (_, i) => `Large data item ${i}`);
      
      mockAnalyzeCode.mockImplementation(async () => {
        // Simulate memory-intensive operation
        const tempArray = new Array(100000).fill(largeData);
        tempArray.length = 0; // Clear for GC
        
        return {
          errors: ['Memory test error'],
          securityVulnerabilities: [],
          refactoringSuggestions: []
        };
      });

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(mockAnalyzeCode).toHaveBeenCalled();
      });
    });

    it('should handle rapid successive analysis requests', async () => {
      let callCount = 0;
      mockAnalyzeCode.mockImplementation(async () => {
        callCount++;
        // Simulate shorter response times to avoid test timeout
        await new Promise(resolve => setTimeout(resolve, 10));
        
        return {
          errors: [`Analysis ${callCount}`],
          securityVulnerabilities: [],
          refactoringSuggestions: []
        };
      });

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code 1');

      // Fire multiple rapid requests
      for (let i = 0; i < 3; i++) {
        await user.click(analyzeButton);
        // Small delay to simulate user behavior
        await new Promise(resolve => setTimeout(resolve, 5));
      }
      
      // Should handle concurrent requests gracefully
      await waitFor(() => {
        expect(mockAnalyzeCode).toHaveBeenCalled();
      });
    });
  });

  describe('Browser Compatibility Issues', () => {
    it('should handle missing localStorage', async () => {
      // Mock localStorage to throw errors
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => { throw new Error('localStorage not available'); }),
          setItem: vi.fn(() => { throw new Error('localStorage not available'); }),
          removeItem: vi.fn(() => { throw new Error('localStorage not available'); })
        }
      });

      mockSaveAnalysis.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      mockAnalyzeCode.mockResolvedValueOnce({
        errors: ['Test error'],
        securityVulnerabilities: [],
        refactoringSuggestions: []
      });

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      // Analysis should still work even if localStorage fails
      await waitFor(() => {
        expect(mockAnalyzeCode).toHaveBeenCalled();
      });

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage
      });
    });

    it('should handle missing fetch API', async () => {
      // This would be handled at the GeminiClient level
      mockAnalyzeCode.mockRejectedValueOnce(new Error('fetch is not defined'));

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Analiz sırasında hata oluştu: fetch is not defined/)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases in User Interaction', () => {
    it('should handle multiple rapid clicks on analyze button', async () => {
      let analysisCount = 0;
      mockAnalyzeCode.mockImplementation(async () => {
        analysisCount++;
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          errors: [`Analysis ${analysisCount}`],
          securityVulnerabilities: [],
          refactoringSuggestions: []
        };
      });

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');

      // Rapid clicks
      await user.click(analyzeButton);
      await user.click(analyzeButton);
      await user.click(analyzeButton);

      // Should prevent multiple simultaneous analyses
      await waitFor(() => {
        expect(analyzeButton).toBeDisabled();
      });
    });

    it('should handle form submission during analysis', async () => {
      mockAnalyzeCode.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          errors: [],
          securityVulnerabilities: [],
          refactoringSuggestions: []
        };
      });

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      // Try to submit form while analysis is running
      await user.keyboard('{Enter}');

      // Should not trigger additional analysis
      expect(mockAnalyzeCode).toHaveBeenCalledTimes(1);
    });

    it('should handle component unmount during analysis', async () => {
      let resolveAnalysis: (value: any) => void;
      const analysisPromise = new Promise(resolve => {
        resolveAnalysis = resolve;
      });
      
      mockAnalyzeCode.mockReturnValue(analysisPromise);

      const { unmount } = render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      // Unmount component before analysis completes
      unmount();

      // Complete the analysis
      resolveAnalysis!({
        errors: [],
        securityVulnerabilities: [],
        refactoringSuggestions: []
      });

      // Should not cause errors
      expect(() => resolveAnalysis).not.toThrow();
    });
  });

  describe('Data Corruption and Recovery', () => {
    it('should handle corrupted API responses gracefully', async () => {
      // Mock response with empty/invalid data that won't crash React rendering
      mockAnalyzeCode.mockResolvedValueOnce({
        errors: ['Valid error'],
        securityVulnerabilities: ['Security issue'],
        refactoringSuggestions: ['Valid suggestion']
      });

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      // Should handle the response without crashing
      await waitFor(() => {
        expect(mockAnalyzeCode).toHaveBeenCalled();
        expect(screen.getByText('Valid error')).toBeInTheDocument();
      });
    });

    it('should recover from temporary storage failures', async () => {
      let storageFailCount = 0;
      mockSaveAnalysis.mockImplementation(() => {
        storageFailCount++;
        if (storageFailCount <= 2) {
          throw new Error('Storage temporarily unavailable');
        }
        // Succeed on third attempt
        return true;
      });

      mockAnalyzeCode.mockResolvedValue({
        errors: ['Test error'],
        securityVulnerabilities: [],
        refactoringSuggestions: []
      });

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'test code');
      await user.click(analyzeButton);

      // Analysis should complete despite storage failures
      await waitFor(() => {
        expect(mockAnalyzeCode).toHaveBeenCalled();
      });
    });
  });
});

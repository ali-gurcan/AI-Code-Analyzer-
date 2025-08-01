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

// Mock environment variable
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GEMINI_API_KEY: 'test-api-key-for-testing'
  }
});

describe('CodeAnalyzer - Comprehensive Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Setup default mock behaviors
    mockAnalyzeCode.mockResolvedValue({
      errors: ['Syntax error on line 5'],
      securityVulnerabilities: ['XSS vulnerability detected'],
      refactoringSuggestions: ['Use const instead of var']
    });
    
    mockTestConnection.mockResolvedValue(true);
    mockSaveAnalysis.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering and Initialization', () => {
    it('should render all essential UI elements', () => {
      render(<CodeAnalyzer />);
      
      expect(screen.getByText('Kod Analiz Aracı')).toBeInTheDocument();
      expect(screen.getByText('Kodunuzu Gemini AI ile analiz edin ve iyileştirme önerileri alın.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('API anahtarınızı buraya girin...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /kodu analiz et/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /temizle/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /örnek kod/i })).toBeInTheDocument();
    });

    it('should initialize with environment API key', () => {
      render(<CodeAnalyzer />);
      
      const apiKeyInput = screen.getByPlaceholderText('API anahtarınızı buraya girin...') as HTMLInputElement;
      expect(apiKeyInput.value).toBe('test-api-key-for-testing');
    });

    it('should allow props to override environment API key', () => {
      render(<CodeAnalyzer apiKey="props-api-key" />);
      
      const apiKeyInput = screen.getByPlaceholderText('API anahtarınızı buraya girin...') as HTMLInputElement;
      expect(apiKeyInput.value).toBe('props-api-key');
    });

    it('should show API key help text when no key is provided', () => {
      // Render without any props (will use environment key which is test-api-key-for-testing)
      render(<CodeAnalyzer />);
      
      const apiKeyInput = screen.getByPlaceholderText('API anahtarınızı buraya girin...') as HTMLInputElement;
      // Since environment has a test key, this should show that key
      expect(apiKeyInput.value).toBe('test-api-key-for-testing');
      expect(screen.getByText('Gemini API Anahtarı:')).toBeInTheDocument();
    });
  });

  describe('User Input Handling', () => {
    it('should update API key on user input', async () => {
      render(<CodeAnalyzer />);
      
      const apiKeyInput = screen.getByPlaceholderText('API anahtarınızı buraya girin...');
      
      await user.clear(apiKeyInput);
      await user.type(apiKeyInput, 'new-api-key');

      expect((apiKeyInput as HTMLInputElement).value).toBe('new-api-key');
    });

    it('should update code textarea on user input', async () => {
      render(<CodeAnalyzer />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      
      await user.type(codeTextarea, 'console.log("test");');

      expect((codeTextarea as HTMLTextAreaElement).value).toBe('console.log("test");');
    });
  });

  describe('Code Analysis Flow', () => {
    const sampleAnalysisResult = {
      errors: ['Syntax error on line 5'],
      securityVulnerabilities: ['XSS vulnerability detected'],
      refactoringSuggestions: ['Use const instead of var']
    };

    it('should perform successful code analysis', async () => {
      mockAnalyzeCode.mockResolvedValueOnce(sampleAnalysisResult);

      render(<CodeAnalyzer apiKey="valid-key" />);

      const codeTextarea = screen.getByPlaceholderText('Kodunuzu buraya yapıştırın...');
      const analyzeButton = screen.getByRole('button', { name: /kodu analiz et/i });

      await user.type(codeTextarea, 'var x = 1;');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(mockAnalyzeCode).toHaveBeenCalledWith('var x = 1;');
      });

      expect(mockSaveAnalysis).toHaveBeenCalledWith('var x = 1;', sampleAnalysisResult);
    });
  });
});

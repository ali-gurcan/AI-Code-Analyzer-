import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeAnalyzer from '../components/CodeAnalyzer';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock console.error to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('CodeAnalyzer Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue('[]'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('localStorage', localStorageMock);
  });

  it('should perform full analysis workflow successfully', async () => {
    const user = userEvent.setup();

    // Mock successful API response
    const mockApiResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"errors": ["Variable x is not used"], "securityVulnerabilities": ["Potential XSS vulnerability"], "refactoringSuggestions": ["Use const instead of var"]}'
          }]
        }
      }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    });

    render(<CodeAnalyzer />);

    // Enter API key
    const apiKeyInput = screen.getByLabelText('Gemini API Anahtarı:');
    await user.type(apiKeyInput, 'test-api-key');

    // Enter code
    const codeTextarea = screen.getByLabelText('Analiz edilecek kod:');
    const testCode = 'var x = "hello"; console.log("world");';
    await user.type(codeTextarea, testCode);

    // Click analyze button
    const analyzeButton = screen.getByRole('button', { name: 'Kodu Analiz Et' });
    await user.click(analyzeButton);

    // Wait for loading state
    expect(screen.getByText('Analiz Ediliyor...')).toBeInTheDocument();

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Analiz Sonuçları')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check that results are displayed
    expect(screen.getByText('Toplam 3 sorun bulundu:')).toBeInTheDocument();
    expect(screen.getByText('Variable x is not used')).toBeInTheDocument();
    expect(screen.getByText('Potential XSS vulnerability')).toBeInTheDocument();
    expect(screen.getByText('Use const instead of var')).toBeInTheDocument();

    // Verify API was called correctly
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining(testCode)
      })
    );

    // Verify localStorage was called to save the analysis
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'code-analysis-history',
      expect.stringContaining('Variable x is not used')
    );
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock API error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    });

    render(<CodeAnalyzer />);

    // Enter API key and code
    const apiKeyInput = screen.getByLabelText('Gemini API Anahtarı:');
    await user.type(apiKeyInput, 'invalid-api-key');

    const codeTextarea = screen.getByLabelText('Analiz edilecek kod:');
    await user.type(codeTextarea, 'function test() {}');

    // Click analyze button
    const analyzeButton = screen.getByRole('button', { name: 'Kodu Analiz Et' });
    await user.click(analyzeButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Analiz sırasında hata oluştu/)).toBeInTheDocument();
    });

    expect(screen.getByText(/API request failed: 401 Unauthorized/)).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<CodeAnalyzer />);

    // Enter API key and code
    const apiKeyInput = screen.getByLabelText('Gemini API Anahtarı:');
    await user.type(apiKeyInput, 'test-api-key');

    const codeTextarea = screen.getByLabelText('Analiz edilecek kod:');
    await user.type(codeTextarea, 'function test() {}');

    // Click analyze button
    const analyzeButton = screen.getByRole('button', { name: 'Kodu Analiz Et' });
    await user.click(analyzeButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Analiz sırasında hata oluştu/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  it('should clear results when code is cleared', async () => {
    const user = userEvent.setup();

    // Mock successful API response first
    const mockApiResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '{"errors": ["Test error"], "securityVulnerabilities": [], "refactoringSuggestions": []}'
          }]
        }
      }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    });

    render(<CodeAnalyzer />);

    // Enter API key and code, then analyze
    const apiKeyInput = screen.getByLabelText('Gemini API Anahtarı:');
    await user.type(apiKeyInput, 'test-api-key');

    const codeTextarea = screen.getByLabelText('Analiz edilecek kod:');
    await user.type(codeTextarea, 'function test() {}');

    const analyzeButton = screen.getByRole('button', { name: 'Kodu Analiz Et' });
    await user.click(analyzeButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    // Clear the code
    const clearButton = screen.getByRole('button', { name: 'Temizle' });
    await user.click(clearButton);

    // Results should be gone
    expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    expect(screen.queryByText('Analiz Sonuçları')).not.toBeInTheDocument();
  });
});

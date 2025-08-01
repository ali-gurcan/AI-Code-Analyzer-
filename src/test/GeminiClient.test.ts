import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiClient } from '../classes/GeminiClient';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('GeminiClient', () => {
  let geminiClient: GeminiClient;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    geminiClient = new GeminiClient(mockApiKey);
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with provided API key', () => {
      expect(geminiClient).toBeInstanceOf(GeminiClient);
    });
  });

  describe('analyzeCode', () => {
    const mockCode = 'function test() { return "hello"; }';

    it('should return analysis result on successful API call', async () => {
      const mockApiResponse = {
        candidates: [{
          content: {
            parts: [{
              text: '{"errors": ["Unused variable"], "securityVulnerabilities": [], "refactoringSuggestions": ["Use const instead of var"]}'
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      });

      const result = await geminiClient.analyzeCode(mockCode);

      expect(result).toEqual({
        errors: ['Unused variable'],
        securityVulnerabilities: [],
        refactoringSuggestions: ['Use const instead of var']
      });
    });

    it('should handle API request with correct parameters', async () => {
      const mockApiResponse = {
        candidates: [{
          content: {
            parts: [{ text: '{"errors": [], "securityVulnerabilities": [], "refactoringSuggestions": []}' }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      });

      await geminiClient.analyzeCode(mockCode);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${mockApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: expect.stringContaining('Bu kodu analiz et')
              }]
            }]
          })
        }
      );
    });

    it('should throw error when API request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(geminiClient.analyzeCode(mockCode))
        .rejects
        .toThrow('API request failed: 401 Unauthorized');
    });

    it('should throw error when no candidates in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] })
      });

      await expect(geminiClient.analyzeCode(mockCode))
        .rejects
        .toThrow('No response from Gemini API');
    });

    it('should throw error when no valid JSON in response', async () => {
      const mockApiResponse = {
        candidates: [{
          content: {
            parts: [{ text: 'This is not JSON' }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      });

      await expect(geminiClient.analyzeCode(mockCode))
        .rejects
        .toThrow('No valid JSON found in API response');
    });

    it('should handle malformed JSON in response', async () => {
      const mockApiResponse = {
        candidates: [{
          content: {
            parts: [{ text: '{"errors": [}' }] // Invalid JSON
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      });

      await expect(geminiClient.analyzeCode(mockCode))
        .rejects
        .toThrow();
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(geminiClient.analyzeCode(mockCode))
        .rejects
        .toThrow('Network error');
    });

    it('should ensure response has expected structure with missing fields', async () => {
      const mockApiResponse = {
        candidates: [{
          content: {
            parts: [{ text: '{"errors": ["Some error"]}' }] // Missing other fields
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      });

      const result = await geminiClient.analyzeCode(mockCode);

      expect(result).toEqual({
        errors: ['Some error'],
        securityVulnerabilities: [],
        refactoringSuggestions: []
      });
    });
  });
});

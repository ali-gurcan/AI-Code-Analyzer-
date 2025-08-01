import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiClient } from '../classes/GeminiClient';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('GeminiClient - Comprehensive Tests', () => {
  let client: GeminiClient;
  const validApiKey = 'test-api-key-123';

  beforeEach(() => {
    vi.clearAllMocks();
    client = new GeminiClient(validApiKey);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should create instance with valid API key', () => {
      const testClient = new GeminiClient('valid-key');
      expect(testClient).toBeInstanceOf(GeminiClient);
    });

    it('should throw error for empty API key', () => {
      expect(() => new GeminiClient('')).toThrow('API key is required');
    });

    it('should throw error for null API key', () => {
      expect(() => new GeminiClient(null as any)).toThrow('API key is required');
    });

    it('should trim whitespace from API key', () => {
      const testClient = new GeminiClient('  test-key  ');
      expect(testClient).toBeInstanceOf(GeminiClient);
    });
  });

  describe('Code Analysis - Success Cases', () => {
    it('should analyze code and return valid results', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: ['Variable not defined'],
                securityVulnerabilities: ['SQL injection risk'],
                refactoringSuggestions: ['Use const instead of var']
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await client.analyzeCode('var x = 1;');
      
      expect(result).toEqual({
        errors: ['Variable not defined'],
        securityVulnerabilities: ['SQL injection risk'],
        refactoringSuggestions: ['Use const instead of var']
      });
    });

    it('should handle complex analysis results with objects', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [
                  { description: 'Syntax error on line 5', severity: 'high' },
                  'Simple error message'
                ],
                securityVulnerabilities: [
                  { description: 'XSS vulnerability', recommendation: 'Sanitize input' }
                ],
                refactoringSuggestions: [
                  { description: 'Extract method', codeSnippet: 'function extracted() {}' }
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await client.analyzeCode('function test() { return true; }');
      
      expect(result.errors).toContain('Syntax error on line 5');
      expect(result.errors).toContain('Simple error message');
      expect(result.securityVulnerabilities).toContain('XSS vulnerability');
      expect(result.refactoringSuggestions).toContain('Extract method');
    });

    it('should handle empty analysis results', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: []
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await client.analyzeCode('console.log("Hello World");');
      
      expect(result.errors).toEqual([]);
      expect(result.securityVulnerabilities).toEqual([]);
      expect(result.refactoringSuggestions).toEqual([]);
    });
  });

  describe('Error Handling - Input Validation', () => {
    it('should throw error for empty code', async () => {
      await expect(client.analyzeCode('')).rejects.toThrow('Code cannot be empty');
    });

    it('should throw error for whitespace-only code', async () => {
      await expect(client.analyzeCode('   \n\t  ')).rejects.toThrow('Code cannot be empty');
    });

    it('should throw error for null code', async () => {
      await expect(client.analyzeCode(null as any)).rejects.toThrow('Code cannot be empty');
    });
  });

  describe('API Error Handling', () => {
    it('should handle 401 Unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(client.analyzeCode('test code')).rejects.toThrow('API request failed: 401 Unauthorized');
    });

    it('should handle 429 Rate Limit error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      await expect(client.analyzeCode('test code')).rejects.toThrow('API request failed: 429 Too Many Requests');
    });

    it('should handle 500 Server Error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(client.analyzeCode('test code')).rejects.toThrow('API request failed: 500 Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(client.analyzeCode('test code')).rejects.toThrow('Network error during analysis');
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network request timeout'));

      await expect(client.analyzeCode('test code')).rejects.toThrow('Network error during analysis');
    });
  });

  describe('Response Parsing Errors', () => {
    it('should handle missing candidates in response', async () => {
      const mockResponse = { candidates: [] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await expect(client.analyzeCode('test code')).rejects.toThrow('No response from AI model');
    });

    it('should handle malformed JSON response', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: 'This is not valid JSON {invalid}'
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await expect(client.analyzeCode('test code')).rejects.toThrow();
    });

    it('should handle response without JSON structure', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: 'Plain text response without JSON'
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await expect(client.analyzeCode('test code')).rejects.toThrow('Failed to parse analysis result');
    });

    it('should handle invalid JSON syntax', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: '{"errors": [incomplete'
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await expect(client.analyzeCode('test code')).rejects.toThrow('Failed to parse analysis result');
    });
  });

  describe('Connection Testing', () => {
    it('should successfully test connection with valid API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: 'Connection successful' }]
            }
          }]
        })
      });

      const result = await client.testConnection();
      expect(result).toBe(true);
    });

    it('should fail connection test with invalid API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const result = await client.testConnection();
      expect(result).toBe(false);
    });

    it('should fail connection test on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('Security Analysis Specific Tests', () => {
    it('should detect SQL injection vulnerabilities', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'SQL injection vulnerability detected',
                  'User input not sanitized'
                ],
                refactoringSuggestions: ['Use parameterized queries']
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const sqlCode = `
        const query = "SELECT * FROM users WHERE id = " + userId;
        db.execute(query);
      `;

      const result = await client.analyzeCode(sqlCode);
      
      expect(result.securityVulnerabilities).toContain('SQL injection vulnerability detected');
      expect(result.securityVulnerabilities).toContain('User input not sanitized');
    });

    it('should detect XSS vulnerabilities', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: ['XSS vulnerability: unescaped user input'],
                refactoringSuggestions: ['Sanitize user input before rendering']
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const xssCode = `
        const userInput = req.body.message;
        res.send("<div>" + userInput + "</div>");
      `;

      const result = await client.analyzeCode(xssCode);
      
      expect(result.securityVulnerabilities).toContain('XSS vulnerability: unescaped user input');
    });
  });

  describe('Refactoring Analysis Tests', () => {
    it('should suggest modern JavaScript improvements', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Use const/let instead of var',
                  'Use arrow functions for better readability',
                  'Use template literals instead of string concatenation'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const oldJsCode = `
        var message = "Hello " + name + "!";
        function greet() {
          return message;
        }
      `;

      const result = await client.analyzeCode(oldJsCode);
      
      expect(result.refactoringSuggestions).toContain('Use const/let instead of var');
      expect(result.refactoringSuggestions).toContain('Use arrow functions for better readability');
      expect(result.refactoringSuggestions).toContain('Use template literals instead of string concatenation');
    });

    it('should suggest performance improvements', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Cache DOM queries to improve performance',
                  'Use efficient data structures',
                  'Avoid unnecessary re-renders'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const inefficientCode = `
        for (let i = 0; i < 1000; i++) {
          document.getElementById('list').innerHTML += '<li>Item ' + i + '</li>';
        }
      `;

      const result = await client.analyzeCode(inefficientCode);
      
      expect(result.refactoringSuggestions).toContain('Cache DOM queries to improve performance');
    });
  });
});

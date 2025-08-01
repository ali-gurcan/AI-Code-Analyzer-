export interface AnalysisResult {
  errors: string[];
  securityVulnerabilities: string[];
  refactoringSuggestions: string[];
}

export class GeminiClient {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey.trim();
  }

  async analyzeCode(codeContent: string): Promise<AnalysisResult> {
    if (!codeContent || codeContent.trim() === '') {
      throw new Error('Code cannot be empty');
    }

    try {
      const prompt = `Bu kodu analiz et ve varsa hata, güvenlik açığı ve refactoring önerilerini, her birini ayrı bir liste içinde bir JSON nesnesi olarak döndür. 

ÖNEMLI: Sadece string array formatında yanıt ver. Her öğe basit bir metin olmalı.

Format: 
{
  "errors": ["hata açıklaması 1", "hata açıklaması 2"],
  "securityVulnerabilities": ["güvenlik sorunu 1", "güvenlik sorunu 2"], 
  "refactoringSuggestions": ["iyileştirme önerisi 1", "iyileştirme önerisi 2"]
}

Kod:
${codeContent}`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from AI model');
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Try to extract JSON from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse analysis result');
      }

      const analysisResult = JSON.parse(jsonMatch[0]);
      
      // Helper function to extract text from different response formats
      const extractTexts = (items: any[]): string[] => {
        if (!Array.isArray(items)) return [];
        
        return items.map(item => {
          if (typeof item === 'string') {
            return item;
          } else if (typeof item === 'object' && item !== null) {
            // Handle object format: {description, codeSnippet, severity, recommendation}
            return item.description || item.recommendation || item.message || JSON.stringify(item);
          }
          return String(item);
        });
      };
      
      // Ensure the response has the expected structure
      return {
        errors: extractTexts(analysisResult.errors || []),
        securityVulnerabilities: extractTexts(analysisResult.securityVulnerabilities || []),
        refactoringSuggestions: extractTexts(analysisResult.refactoringSuggestions || [])
      };

    } catch (error) {
      console.error('Error analyzing code:', error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          throw new Error('Network error during analysis');
        }
        throw error;
      }
      throw new Error('Unknown error occurred during analysis');
    }
  }

  // Test API bağlantısı için yardımcı metod
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, {
        headers: {
          'X-goog-api-key': this.apiKey,
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

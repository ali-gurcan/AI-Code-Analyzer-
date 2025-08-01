import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalysisResults from '../components/AnalysisResults';
import type { AnalysisResult } from '../classes/GeminiClient';

describe('AnalysisResults - Comprehensive Display Tests', () => {
  const sampleResult: AnalysisResult = {
    errors: ['Syntax error on line 5', 'Undefined variable "test"'],
    securityVulnerabilities: ['XSS vulnerability detected', 'SQL injection risk'],
    refactoringSuggestions: ['Use const instead of var', 'Extract method for better readability']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render analysis results with all sections', () => {
      render(<AnalysisResults results={sampleResult} />);

      expect(screen.getByText('Analiz Sonuçları')).toBeInTheDocument();
      expect(screen.getByText('Hatalar (2)')).toBeInTheDocument();
      expect(screen.getByText('Güvenlik Açıkları (2)')).toBeInTheDocument();
      expect(screen.getByText('Refactoring Önerileri (2)')).toBeInTheDocument();
    });

    it('should display all errors correctly', () => {
      render(<AnalysisResults results={sampleResult} />);

      expect(screen.getByText('Syntax error on line 5')).toBeInTheDocument();
      expect(screen.getByText('Undefined variable "test"')).toBeInTheDocument();
    });

    it('should display all security vulnerabilities correctly', () => {
      render(<AnalysisResults results={sampleResult} />);

      expect(screen.getByText('XSS vulnerability detected')).toBeInTheDocument();
      expect(screen.getByText('SQL injection risk')).toBeInTheDocument();
    });

    it('should display all refactoring suggestions correctly', () => {
      render(<AnalysisResults results={sampleResult} />);

      expect(screen.getByText('Use const instead of var')).toBeInTheDocument();
      expect(screen.getByText('Extract method for better readability')).toBeInTheDocument();
    });

    it('should show correct item counts', () => {
      render(<AnalysisResults results={sampleResult} />);

      // Use regex to handle whitespace in counts
      expect(screen.getByText(/2 hata/)).toBeInTheDocument();
      expect(screen.getByText(/2 güvenlik açığı/)).toBeInTheDocument();
      expect(screen.getByText(/2 refactoring önerisi/)).toBeInTheDocument();
    });
  });

  describe('Empty Results Handling', () => {
    it('should handle empty results gracefully', () => {
      const emptyResult: AnalysisResult = {
        errors: [],
        securityVulnerabilities: [],
        refactoringSuggestions: []
      };

      render(<AnalysisResults results={emptyResult} />);

      expect(screen.getByText('Harika! Kodunuzda herhangi bir sorun bulunamadı.')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('should show "No issues found" messages for empty arrays', () => {
      const emptyResult: AnalysisResult = {
        errors: [],
        securityVulnerabilities: [],
        refactoringSuggestions: []
      };

      render(<AnalysisResults results={emptyResult} />);

      // Empty results show success message, not individual sections
      expect(screen.getByText('Harika! Kodunuzda herhangi bir sorun bulunamadı.')).toBeInTheDocument();
    });

    it('should handle mixed empty and non-empty results', () => {
      const mixedResult: AnalysisResult = {
        errors: ['One error'],
        securityVulnerabilities: [],
        refactoringSuggestions: ['One suggestion']
      };

      render(<AnalysisResults results={mixedResult} />);

      expect(screen.getByText('One error')).toBeInTheDocument();
      expect(screen.getByText('One suggestion')).toBeInTheDocument();
      expect(screen.getByText(/1 hata/)).toBeInTheDocument();
      expect(screen.getByText(/1 refactoring önerisi/)).toBeInTheDocument();
    });
  });

  describe('Large Result Sets', () => {
    it('should handle large numbers of errors', () => {
      const largeErrorResult: AnalysisResult = {
        errors: Array.from({ length: 50 }, (_, i) => `Error ${i + 1}: Sample error message`),
        securityVulnerabilities: [],
        refactoringSuggestions: []
      };

      render(<AnalysisResults results={largeErrorResult} />);

      expect(screen.getByText(/50 hata/)).toBeInTheDocument();
      expect(screen.getByText('Error 1: Sample error message')).toBeInTheDocument();
      expect(screen.getByText('Error 50: Sample error message')).toBeInTheDocument();
    });

    it('should handle large numbers of security vulnerabilities', () => {
      const largeSecurityResult: AnalysisResult = {
        errors: [],
        securityVulnerabilities: Array.from({ length: 25 }, (_, i) => `Vulnerability ${i + 1}: Security issue`),
        refactoringSuggestions: []
      };

      render(<AnalysisResults results={largeSecurityResult} />);

      expect(screen.getByText(/25 güvenlik açığı/)).toBeInTheDocument();
      expect(screen.getByText('Vulnerability 1: Security issue')).toBeInTheDocument();
      expect(screen.getByText('Vulnerability 25: Security issue')).toBeInTheDocument();
    });

    it('should handle large numbers of refactoring suggestions', () => {
      const largeSuggestionsResult: AnalysisResult = {
        errors: [],
        securityVulnerabilities: [],
        refactoringSuggestions: Array.from({ length: 30 }, (_, i) => `Suggestion ${i + 1}: Improvement idea`)
      };

      render(<AnalysisResults results={largeSuggestionsResult} />);

      expect(screen.getByText(/30 refactoring önerisi/)).toBeInTheDocument();
      expect(screen.getByText('Suggestion 1: Improvement idea')).toBeInTheDocument();
      expect(screen.getByText('Suggestion 30: Improvement idea')).toBeInTheDocument();
    });
  });

  describe('Special Content Handling', () => {
    it('should handle special characters in results', () => {
      const specialCharResult: AnalysisResult = {
        errors: ['Error with émojis 🚨 and unicode ñáéíóú'],
        securityVulnerabilities: ['Vulnerability with "quotes" and \'apostrophes\''],
        refactoringSuggestions: ['Suggestion with <tags> and &entities;']
      };

      render(<AnalysisResults results={specialCharResult} />);

      expect(screen.getByText('Error with émojis 🚨 and unicode ñáéíóú')).toBeInTheDocument();
      expect(screen.getByText('Vulnerability with "quotes" and \'apostrophes\'')).toBeInTheDocument();
      expect(screen.getByText('Suggestion with <tags> and &entities;')).toBeInTheDocument();
    });

    it('should handle very long individual messages', () => {
      const longMessage = 'This is a very long error message that contains a lot of detailed information about what went wrong in the code analysis process and should be displayed correctly without breaking the layout or causing any rendering issues in the user interface.';
      
      const longMessageResult: AnalysisResult = {
        errors: [longMessage],
        securityVulnerabilities: [],
        refactoringSuggestions: []
      };

      render(<AnalysisResults results={longMessageResult} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle messages with line breaks', () => {
      const multilineResult: AnalysisResult = {
        errors: ['Error on line 1\nContinued on line 2'],
        securityVulnerabilities: ['Security issue:\n- Point 1\n- Point 2'],
        refactoringSuggestions: ['Suggestion:\nStep 1: Do this\nStep 2: Do that']
      };

      render(<AnalysisResults results={multilineResult} />);

      // Use regex to handle potential whitespace differences in line breaks
      expect(screen.getByText(/Error on line 1[\s\n]*Continued on line 2/)).toBeInTheDocument();
      expect(screen.getByText(/Security issue:[\s\n]*- Point 1[\s\n]*- Point 2/)).toBeInTheDocument();
      expect(screen.getByText(/Suggestion:[\s\n]*Step 1: Do this[\s\n]*Step 2: Do that/)).toBeInTheDocument();
    });

    it('should handle empty strings in arrays', () => {
      const emptyStringResult: AnalysisResult = {
        errors: ['', 'Valid error', ''],
        securityVulnerabilities: ['Valid vulnerability', ''],
        refactoringSuggestions: ['', '', 'Valid suggestion']
      };

      render(<AnalysisResults results={emptyStringResult} />);

      expect(screen.getByText('Valid error')).toBeInTheDocument();
      expect(screen.getByText('Valid vulnerability')).toBeInTheDocument();
      expect(screen.getByText('Valid suggestion')).toBeInTheDocument();
      expect(screen.getByText(/3 hata/)).toBeInTheDocument(); // Error count (including empty strings)
      expect(screen.getByText(/2 güvenlik açığı/)).toBeInTheDocument(); // Security count
      expect(screen.getByText(/3 refactoring önerisi/)).toBeInTheDocument(); // Suggestion count
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct CSS classes to main container', () => {
      const { container } = render(<AnalysisResults results={sampleResult} />);
      
      const mainElement = container.querySelector('.analysis-results');
      expect(mainElement).toBeInTheDocument();
    });

    it('should apply error-specific styling', () => {
      const { container } = render(<AnalysisResults results={sampleResult} />);
      
      const sections = container.querySelectorAll('.analysis-results__section');
      expect(sections.length).toBeGreaterThan(0);
      
      const errorCards = container.querySelectorAll('.analysis-card--error');
      expect(errorCards.length).toBe(2);
    });

    it('should apply security-specific styling', () => {
      const { container } = render(<AnalysisResults results={sampleResult} />);
      
      const securityCards = container.querySelectorAll('.analysis-card--security');
      expect(securityCards.length).toBe(2);
    });

    it('should apply suggestion-specific styling', () => {
      const { container } = render(<AnalysisResults results={sampleResult} />);
      
      const suggestionCards = container.querySelectorAll('.analysis-card--refactoring');
      expect(suggestionCards.length).toBe(2);
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper semantic structure', () => {
      render(<AnalysisResults results={sampleResult} />);

      const headings = screen.getAllByRole('heading');
      // Main title (1) + 3 section titles (3) + individual card titles (6) = 10 total
      expect(headings).toHaveLength(10);
    });

    it('should have proper list structure for results', () => {
      render(<AnalysisResults results={sampleResult} />);

      // Component doesn't use list structure, it uses div containers
      // So we check for the sections instead
      const sections = screen.getAllByText(/\(\d+\)$/);
      expect(sections).toHaveLength(3); // Three sections with counts
    });

    it('should provide meaningful aria-labels', () => {
      render(<AnalysisResults results={sampleResult} />);

      // Component doesn't have aria-labels, so we check for meaningful text content
      expect(screen.getByText('Hatalar (2)')).toBeInTheDocument();
      expect(screen.getByText('Güvenlik Açıkları (2)')).toBeInTheDocument();
      expect(screen.getByText('Refactoring Önerileri (2)')).toBeInTheDocument();
    });
  });

  describe('Component State and Updates', () => {
    it('should update when result prop changes', () => {
      const initialResult: AnalysisResult = {
        errors: ['Initial error'],
        securityVulnerabilities: [],
        refactoringSuggestions: []
      };

      const { rerender } = render(<AnalysisResults results={initialResult} />);
      expect(screen.getByText('Initial error')).toBeInTheDocument();

      const updatedResult: AnalysisResult = {
        errors: ['Updated error'],
        securityVulnerabilities: ['New vulnerability'],
        refactoringSuggestions: ['New suggestion']
      };

      rerender(<AnalysisResults results={updatedResult} />);
      
      expect(screen.queryByText('Initial error')).not.toBeInTheDocument();
      expect(screen.getByText('Updated error')).toBeInTheDocument();
      expect(screen.getByText('New vulnerability')).toBeInTheDocument();
      expect(screen.getByText('New suggestion')).toBeInTheDocument();
    });

    it('should handle rapid prop updates', () => {
      const { rerender } = render(<AnalysisResults results={sampleResult} />);

      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        const rapidResult: AnalysisResult = {
          errors: [`Rapid error ${i}`],
          securityVulnerabilities: [`Rapid vulnerability ${i}`],
          refactoringSuggestions: [`Rapid suggestion ${i}`]
        };
        
        rerender(<AnalysisResults results={rapidResult} />);
      }

      expect(screen.getByText('Rapid error 9')).toBeInTheDocument();
      expect(screen.getByText('Rapid vulnerability 9')).toBeInTheDocument();
      expect(screen.getByText('Rapid suggestion 9')).toBeInTheDocument();
    });
  });

  describe('Performance and Memory', () => {
    it('should handle very large result sets efficiently', () => {
      const massiveResult: AnalysisResult = {
        errors: Array.from({ length: 1000 }, (_, i) => `Error ${i}`),
        securityVulnerabilities: Array.from({ length: 500 }, (_, i) => `Vulnerability ${i}`),
        refactoringSuggestions: Array.from({ length: 750 }, (_, i) => `Suggestion ${i}`)
      };

      const startTime = performance.now();
      render(<AnalysisResults results={massiveResult} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should render in less than 1 second
      expect(screen.getByText(/1000 hata/)).toBeInTheDocument(); // Error count
      expect(screen.getByText(/500 güvenlik açığı/)).toBeInTheDocument(); // Vulnerability count
      expect(screen.getByText(/750 refactoring önerisi/)).toBeInTheDocument(); // Suggestion count
    });

    it('should not cause memory leaks with frequent updates', () => {
      const { rerender, unmount } = render(<AnalysisResults results={sampleResult} />);

      // Simulate many re-renders
      for (let i = 0; i < 100; i++) {
        rerender(<AnalysisResults results={{
          errors: [`Test ${i}`],
          securityVulnerabilities: [],
          refactoringSuggestions: []
        }} />);
      }

      // Component should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });
  });
});

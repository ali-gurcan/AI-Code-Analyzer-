import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalysisCard from '../components/AnalysisCard';
import type { AnalysisCardProps } from '../components/AnalysisCard';

describe('AnalysisCard', () => {
  const defaultProps: AnalysisCardProps = {
    type: 'error',
    title: 'Test Error',
    description: 'This is a test error description'
  };

  it('should render basic card with title and description', () => {
    render(<AnalysisCard {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Test Error' })).toBeInTheDocument();
    expect(screen.getByText('This is a test error description')).toBeInTheDocument();
  });

  it('should display correct icon and label for error type', () => {
    render(<AnalysisCard {...defaultProps} type="error" />);

    expect(screen.getByText('❌')).toBeInTheDocument();
    expect(screen.getByText('Hata')).toBeInTheDocument();
  });

  it('should display correct icon and label for security type', () => {
    render(<AnalysisCard {...defaultProps} type="security" />);

    expect(screen.getByText('🔒')).toBeInTheDocument();
    expect(screen.getByText('Güvenlik')).toBeInTheDocument();
  });

  it('should display correct icon and label for refactoring type', () => {
    render(<AnalysisCard {...defaultProps} type="refactoring" />);

    expect(screen.getByText('🔧')).toBeInTheDocument();
    expect(screen.getByText('Refactoring')).toBeInTheDocument();
  });

  it('should apply correct CSS class for error type', () => {
    const { container } = render(<AnalysisCard {...defaultProps} type="error" />);
    
    expect(container.firstChild).toHaveClass('analysis-card--error');
  });

  it('should apply correct CSS class for security type', () => {
    const { container } = render(<AnalysisCard {...defaultProps} type="security" />);
    
    expect(container.firstChild).toHaveClass('analysis-card--security');
  });

  it('should apply correct CSS class for refactoring type', () => {
    const { container } = render(<AnalysisCard {...defaultProps} type="refactoring" />);
    
    expect(container.firstChild).toHaveClass('analysis-card--refactoring');
  });

  it('should render code line when provided', () => {
    const propsWithCode = {
      ...defaultProps,
      codeLine: 'const x = "test";'
    };

    render(<AnalysisCard {...propsWithCode} />);

    expect(screen.getByText('const x = "test";')).toBeInTheDocument();
  });

  it('should not render code section when codeLine is not provided', () => {
    render(<AnalysisCard {...defaultProps} />);

    expect(screen.queryByRole('code')).not.toBeInTheDocument();
  });

  it('should handle unknown type gracefully', () => {
    const propsWithUnknownType = {
      ...defaultProps,
      type: 'unknown' as any
    };

    render(<AnalysisCard {...propsWithUnknownType} />);

    expect(screen.getByText('📝')).toBeInTheDocument();
    expect(screen.getByText('Öneri')).toBeInTheDocument();
  });
});

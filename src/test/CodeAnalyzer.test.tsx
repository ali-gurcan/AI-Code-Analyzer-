import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeAnalyzer from '../components/CodeAnalyzer';

// Mock the GeminiClient
vi.mock('../classes/GeminiClient', () => ({
  GeminiClient: vi.fn().mockImplementation(() => ({
    analyzeCode: vi.fn()
  }))
}));

// Mock the LocalStorageManager
vi.mock('../classes/LocalStorageManager', () => ({
  LocalStorageManager: vi.fn().mockImplementation(() => ({
    saveAnalysis: vi.fn()
  }))
}));

describe('CodeAnalyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render main elements', () => {
    render(<CodeAnalyzer />);

    expect(screen.getByRole('heading', { name: 'Kod Analiz Aracı' })).toBeInTheDocument();
    expect(screen.getByLabelText('Gemini API Anahtarı:')).toBeInTheDocument();
    expect(screen.getByLabelText('Analiz edilecek kod:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kodu Analiz Et' })).toBeInTheDocument();
  });

  it('should show API key help text when no key is provided', () => {
    render(<CodeAnalyzer />);

    expect(screen.getByText(/API anahtarınızı.*Google AI Studio.*dan alabilirsiniz/)).toBeInTheDocument();
  });

  it('should not show API key help text when key is provided', () => {
    render(<CodeAnalyzer apiKey="test-key" />);

    expect(screen.queryByText(/API anahtarınızı.*Google AI Studio.*dan alabilirsiniz/)).not.toBeInTheDocument();
  });

  it('should update API key input', async () => {
    const user = userEvent.setup();
    render(<CodeAnalyzer />);

    const apiKeyInput = screen.getByLabelText('Gemini API Anahtarı:');
    await user.type(apiKeyInput, 'new-api-key');

    expect(apiKeyInput).toHaveValue('new-api-key');
  });

  it('should update code textarea', async () => {
    const user = userEvent.setup();
    render(<CodeAnalyzer />);

    const codeTextarea = screen.getByLabelText('Analiz edilecek kod:');
    await user.type(codeTextarea, 'function test() {}');

    expect(codeTextarea).toHaveValue('function test() {}');
  });

  it('should insert example code when example button is clicked', async () => {
    const user = userEvent.setup();
    render(<CodeAnalyzer />);

    const exampleButton = screen.getByRole('button', { name: 'Örnek Kod' });
    await user.click(exampleButton);

    const codeTextarea = screen.getByLabelText('Analiz edilecek kod:');
    expect(codeTextarea).toHaveValue(expect.stringContaining('function calculateTotal'));
  });

  it('should clear code when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<CodeAnalyzer />);

    const codeTextarea = screen.getByLabelText('Analiz edilecek kod:');
    await user.type(codeTextarea, 'some code');

    const clearButton = screen.getByRole('button', { name: 'Temizle' });
    await user.click(clearButton);

    expect(codeTextarea).toHaveValue('');
  });

  it('should disable analyze button when no API key', () => {
    render(<CodeAnalyzer />);

    const analyzeButton = screen.getByRole('button', { name: 'Kodu Analiz Et' });
    expect(analyzeButton).toBeDisabled();
  });

  it('should disable analyze button when no code', () => {
    render(<CodeAnalyzer apiKey="test-key" />);

    const analyzeButton = screen.getByRole('button', { name: 'Kodu Analiz Et' });
    expect(analyzeButton).toBeDisabled();
  });

  it('should enable analyze button when both API key and code are provided', async () => {
    const user = userEvent.setup();
    render(<CodeAnalyzer />);

    const apiKeyInput = screen.getByLabelText('Gemini API Anahtarı:');
    const codeTextarea = screen.getByLabelText('Analiz edilecek kod:');

    await user.type(apiKeyInput, 'test-key');
    await user.type(codeTextarea, 'function test() {}');

    const analyzeButton = screen.getByRole('button', { name: 'Kodu Analiz Et' });
    expect(analyzeButton).not.toBeDisabled();
  });

  it('should show error when analyze is attempted without API key', async () => {
    const user = userEvent.setup();
    render(<CodeAnalyzer />);

    const codeTextarea = screen.getByLabelText('Analiz edilecek kod:');
    await user.type(codeTextarea, 'function test() {}');

    // Force click the disabled button
    const analyzeButton = screen.getByRole('button', { name: 'Kodu Analiz Et' });
    fireEvent.click(analyzeButton);

    expect(screen.getByText('Lütfen geçerli bir API anahtarı girin.')).toBeInTheDocument();
  });

  it('should show error when analyze is attempted without code', async () => {
    const user = userEvent.setup();
    render(<CodeAnalyzer />);

    const apiKeyInput = screen.getByLabelText('Gemini API Anahtarı:');
    await user.type(apiKeyInput, 'test-key');

    // Force click the disabled button
    const analyzeButton = screen.getByRole('button', { name: 'Kodu Analiz Et' });
    fireEvent.click(analyzeButton);

    expect(screen.getByText('Lütfen analiz edilecek kodu girin.')).toBeInTheDocument();
  });

  it('should disable clear button when no code', () => {
    render(<CodeAnalyzer />);

    const clearButton = screen.getByRole('button', { name: 'Temizle' });
    expect(clearButton).toBeDisabled();
  });

  it('should enable clear button when code is present', async () => {
    const user = userEvent.setup();
    render(<CodeAnalyzer />);

    const codeTextarea = screen.getByLabelText('Analiz edilecek kod:');
    await user.type(codeTextarea, 'function test() {}');

    const clearButton = screen.getByRole('button', { name: 'Temizle' });
    expect(clearButton).not.toBeDisabled();
  });
});

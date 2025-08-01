# 📋 Modül Dokümantasyonu

## AI Kod Analiz Aracı - Modül Yapısı

### 🏗️ Genel Mimari

```
src/
├── classes/           # Core Business Logic
├── components/        # UI Components  
├── assets/           # Static Assets
└── test/             # Test Files
```

---

## 📚 Core Modules

### 1. GeminiClient Sınıfı

**Dosya:** `src/classes/GeminiClient.ts`

**Amaç:** Google Gemini AI API ile iletişim

#### Metodlar:

```typescript
class GeminiClient {
  constructor(apiKey: string)
  
  // API bağlantısını test eder
  async testConnection(): Promise<boolean>
  
  // Kod analizi yapar
  async analyzeCode(code: string): Promise<AnalysisResult>
  
  // API anahtarını doğrular
  private validateApiKey(): boolean
}
```

#### Kullanım:
```typescript
const client = new GeminiClient('your-api-key');
const result = await client.analyzeCode('console.log("test")');
```

#### Bağımlılıklar:
- `@google/generative-ai` - Gemini API client

---

### 2. LocalStorageManager Sınıfı

**Dosya:** `src/classes/LocalStorageManager.ts`

**Amaç:** Yerel veri saklama ve yönetimi

#### Metodlar:

```typescript
class LocalStorageManager {
  // Analizi kaydet
  saveAnalysis(code: string, result: AnalysisResult): string
  
  // Tüm analizleri getir
  getAnalyses(): Analysis[]
  
  // Belirli analizi getir
  getAnalysis(id: string): Analysis | null
  
  // Analizi sil
  deleteAnalysis(id: string): boolean
  
  // Tüm analizleri temizle
  clearAnalyses(): void
}
```

#### Veri Yapısı:
```typescript
interface Analysis {
  id: string;
  code: string;
  result: AnalysisResult;
  timestamp: number;
}
```

---

## 🎨 UI Components

### 1. CodeAnalyzer (Ana Bileşen)

**Dosya:** `src/components/CodeAnalyzer.tsx`

**Amaç:** Ana kod analiz arayüzü

#### Props:
```typescript
interface CodeAnalyzerProps {
  // Herhangi bir prop almaz
}
```

#### State:
```typescript
interface CodeAnalyzerState {
  code: string;
  apiKey: string;
  isAnalyzing: boolean;
  currentResult: AnalysisResult | null;
}
```

#### Özellikler:
- Kod girişi textarea
- API anahtarı girişi
- Analiz butonu
- Yükleme durumu
- Hata yönetimi

---

### 2. AnalysisResults

**Dosya:** `src/components/AnalysisResults.tsx`

**Amaç:** Analiz sonuçlarını görüntüler

#### Props:
```typescript
interface AnalysisResultsProps {
  result: AnalysisResult;
  onSave?: (id: string) => void;
}
```

#### Özellikler:
- Hatalar listesi
- Güvenlik uyarıları
- İyileştirme önerileri
- Kaydetme fonksiyonu

---

### 3. AnalysisCard

**Dosya:** `src/components/AnalysisCard.tsx`

**Amaç:** Tek bir analiz kartını gösterir

#### Props:
```typescript
interface AnalysisCardProps {
  analysis: Analysis;
  onDelete: (id: string) => void;
  onLoad: (analysis: Analysis) => void;
}
```

#### Özellikler:
- Analiz özeti
- Tarih bilgisi
- Silme butonu
- Yükleme butonu

---

### 4. History

**Dosya:** `src/components/History.tsx`

**Amaç:** Geçmiş analizleri listeler

#### Props:
```typescript
interface HistoryProps {
  onLoadAnalysis: (analysis: Analysis) => void;
}
```

#### Özellikler:
- Analiz listesi
- Arama fonksiyonu
- Toplu silme
- Sıralama

---

## 🔧 Utility Functions

### Veri Tipleri

```typescript
// Analiz sonucu
interface AnalysisResult {
  errors: CodeError[];
  warnings: CodeWarning[];
  suggestions: CodeSuggestion[];
  security: SecurityIssue[];
  summary: string;
}

// Kod hatası
interface CodeError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  type: string;
}

// Güvenlik sorunu
interface SecurityIssue {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}
```

---

## 🧪 Test Modülleri

### Test Yapısı
```
src/test/
├── GeminiClient.test.ts
├── LocalStorageManager.test.ts
├── CodeAnalyzer.test.tsx
├── AnalysisResults.test.tsx
├── AnalysisCard.test.tsx
└── History.test.tsx
```

### Test Kategorileri
- **Unit Tests:** Sınıf metodları
- **Integration Tests:** API etkileşimleri
- **Component Tests:** UI bileşenleri
- **E2E Tests:** Tam kullanıcı akışı

---

## 🔄 Veri Akışı

1. **Kod Girişi** → CodeAnalyzer
2. **API Çağrısı** → GeminiClient
3. **Sonuç İşleme** → AnalysisResults
4. **Veri Saklama** → LocalStorageManager
5. **Geçmiş Görüntüleme** → History

---

## 🚀 Build ve Deploy

### Geliştirme
```bash
npm run dev     # Development server
npm run build   # Production build
npm run preview # Build preview
```

### Docker
```bash
npm run docker:build    # Docker image
npm run docker:compose  # Container çalıştır
```

### Test
```bash
npm test              # Unit tests
npm run test:coverage # Coverage raporu
```

---

## 📦 Bağımlılıklar

### Production
- `react` - UI framework
- `@google/generative-ai` - Gemini API
- `typescript` - Type safety

### Development
- `vite` - Build tool
- `vitest` - Testing framework
- `@testing-library/react` - Component testing
- `eslint` - Code linting

---

## 🔧 Yapılandırma

### Environment Variables
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### TypeScript Config
- Strict mode enabled
- ES2022 target
- Module resolution: bundler

### Vite Config
- React plugin
- TypeScript support
- Hot reload
- Build optimization

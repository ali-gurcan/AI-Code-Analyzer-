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
  // Analizi kaydet (max 50 analiz, 200 char code preview)
  saveAnalysis(code: string, result: AnalysisResult): string
  
  // Tüm analizleri getir (timestamp'e göre sıralı)
  getAnalyses(): SavedAnalysis[]
  
  // Belirli analizi getir
  getAnalysis(id: string): SavedAnalysis | null
  
  // Analizi sil
  deleteAnalysis(id: string): boolean
  
  // Tüm analizleri temizle
  clearAnalyses(): void
  
  // Unique ID üret (private)
  private generateId(): string
}
```

#### Veri Yapısı:
```typescript
interface SavedAnalysis {
  id: string;                    // Unique identifier
  timestamp: number;             // Unix timestamp
  codeSnippet: string;          // İlk 200 karakter preview
  result: AnalysisResult;       // Tam analiz sonucu
}
```

#### Özellikler:
- **Otomatik Limit:** En son 50 analiz saklanır
- **Error Handling:** Try-catch ile güvenli operasyonlar
- **Preview Generation:** Kod preview için 200 karakter limit
- **Timestamp Sorting:** En yeni analizler önce gelir

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
  code: string;                    // Kullanıcı kod girişi
  apiKey: string;                  // Gemini API anahtarı
  isAnalyzing: boolean;           // Analiz durumu
  currentResult: AnalysisResult | null;  // Son analiz sonucu
  error: string | null;           // Hata mesajları
}
```

#### Özellikler:
- **API Key Management:** Environment ve props'tan API key yönetimi
- **Auto-save:** Başarılı analizler otomatik kaydedilir
- **Error Handling:** Kapsamlı hata yönetimi ve kullanıcı bildirimleri
- **Loading States:** Analiz sırasında loading durumu
- **Input Validation:** Kod ve API key doğrulaması
- **Memoization:** Performance için useMemo ve useCallback kullanımı

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
  // Props almaz - standalone component
}
```

#### State:
```typescript
interface HistoryState {
  analyses: SavedAnalysis[];          // Tüm analizler listesi
  selectedAnalysis: SavedAnalysis | null;  // Seçili analiz
  isLoading: boolean;                 // Yükleme durumu
}
```

#### Özellikler:
- **Analiz listesi** (sayı ile birlikte)
- **Detay görüntüleme** (sağ panel)
- **Tarih formatlaması** (Türkçe)
- **Sorun sayısı** hesaplama ve kategorilendirme
- **Tekil silme** (🗑️ buton)
- **Toplu silme** ("Tümünü Sil" buton)
- **Kod preview** (200 karakter)
- **Loading states** ve empty states
- **Interactive selection** (analiz seçimi)

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

### Ana Akış:
1. **Kod Girişi** → CodeAnalyzer (textarea)
2. **API Key Validation** → GeminiClient instantiation
3. **API Çağrısı** → GeminiClient.analyzeCode()
4. **Sonuç İşleme** → AnalysisResults component
5. **Otomatik Saklama** → LocalStorageManager.saveAnalysis()
6. **Geçmiş Görüntüleme** → History component

### History Akışı:
1. **Component Mount** → LocalStorageManager.getAnalyses()
2. **Analiz Seçimi** → setState(selectedAnalysis)
3. **Detay Görüntüleme** → AnalysisResults re-render
4. **Silme İşlemi** → LocalStorageManager.deleteAnalysis()
5. **State Güncelleme** → Re-render with updated list

### Tab Navigation:
1. **App Component** → Tab state management
2. **Tab Selection** → ActiveTab state change
3. **Component Switch** → Conditional rendering
4. **State Persistence** → Component states preserved

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
npm test                  # Unit tests (130 tests)
npm run test:watch        # Test watch mode
npm run test:ui           # Visual test UI
npm run test:coverage     # Coverage report
npm run test:full         # Detailed test summary
npm run test:overview     # Test overview report
```

### Docker
```bash
# Build commands
npm run docker:build         # Production image
npm run docker:build-dev     # Development image

# Run commands
npm run docker:run           # Production container
npm run docker:run-dev       # Development container

# Compose commands
npm run docker:compose       # Production stack
npm run docker:compose-dev   # Development stack
npm run docker:compose-test  # Test stack
npm run docker:stop          # Stop all containers
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

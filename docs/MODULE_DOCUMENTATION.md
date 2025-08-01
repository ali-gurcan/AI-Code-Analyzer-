# 📋 Modül Dokümantasyonu

## AI Kod Analiz Aracı

### 🏗️ Proje Yapısı
```
src/
├── classes/          # İş mantığı
├── components/       # React bileşenleri
└── test/            # Test dosyaları
```

---

## 📚 Ana Modüller

### GeminiClient
**Dosya:** `src/classes/GeminiClient.ts`
- Google Gemini AI API iletişimi
- Kod analizi ve sonuç işleme

### LocalStorageManager
**Dosya:** `src/classes/LocalStorageManager.ts`
- Analiz geçmişi saklama
- Tarayıcı depolama yönetimi

### CodeAnalyzer
**Dosya:** `src/components/CodeAnalyzer.tsx`
- Ana UI bileşeni
- Kod girişi ve analiz kontrolü

### AnalysisResults
**Dosya:** `src/components/AnalysisResults.tsx`
- Analiz sonuçlarını görüntüleme
- Hata, güvenlik, iyileştirme kategorileri

### History
**Dosya:** `src/components/History.tsx`
- Geçmiş analiz listesi
- Detay görüntüleme ve yönetim

---

## 🔧 API Referansı

### GeminiClient
```typescript
class GeminiClient {
  constructor(apiKey: string)
  async analyzeCode(code: string): Promise<AnalysisResult>

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

---

## 🚀 Projeyi Çalıştırma

### Geliştirme Ortamı
```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
# http://localhost:5173 adresinde açılır

# Testleri çalıştır
npm test

# Build al
npm run build
```

### Production Build
```bash
# Production build
npm run build

# Build'i önizle
npm run preview
```

---

## 🐳 Docker Kullanımı

### Hızlı Başlangıç
```bash
# Production ortamı için
npm run docker:compose

# Development ortamı için
npm run docker:compose-dev
```

### Manuel Docker Komutları

#### Production
```bash
# Image oluştur
docker build -f docker/Dockerfile -t ai-code-analyzer .

# Container çalıştır
docker run -p 3000:80 ai-code-analyzer
# http://localhost:3000 adresinde erişilebilir
```

#### Development
```bash
# Development image oluştur
docker build -f docker/Dockerfile.dev -t ai-code-analyzer-dev .

# Development container çalıştır
docker run -p 5173:5173 -v $(pwd):/app ai-code-analyzer-dev
# Hot reload ile geliştirme
```

### Docker Compose
```bash
# Production stack
docker-compose -f docker/docker-compose.yml up

# Development stack
docker-compose -f docker/docker-compose.yml --profile dev up

# Test ortamı
docker-compose -f docker/docker-compose.yml --profile test up

# Durdur
docker-compose -f docker/docker-compose.yml down
```

### NPM Scripts
```bash
npm run docker:build         # Production image build
npm run docker:build-dev     # Development image build
npm run docker:run           # Production container çalıştır
npm run docker:run-dev       # Development container çalıştır
npm run docker:compose       # Docker Compose production
npm run docker:compose-dev   # Docker Compose development
npm run docker:compose-test  # Docker Compose test
npm run docker:stop          # Docker Compose durdur
```

# 🔍 AI Kod Analiz AracıGemini AI ile desteklenen modern kod analiz uygulaması. Kodunuzdaki hataları, güvenlik açıklarını ve iyileştirme önerilerini tespit eder.## ✨ Özellikler- **🤖 AI Destekli Analiz**: Google Gemini 2.0 Flash API kullanarak akıllı kod analizi- **🎯 Kapsamlı Kontrol**: Hata tespiti, güvenlik analizi ve refactoring önerileri- **💾 Geçmiş Takibi**: Tüm analizler yerel depolamada saklanır- **🎨 Modern Arayüz**: React + TypeScript ile temiz ve kullanıcı dostu tasarım- **📱 Responsive**: Masaüstü ve mobil cihazlarda mükemmel görünüm- **🧪 Test Edildi**: Kapsamlı unit ve entegrasyon testleri## 🚀 Kurulum### Önkoşullar- Node.js 18+ - npm veya yarn- Gemini API anahtarı ([Google AI Studio](https://ai.google.dev/tutorials/setup)'dan alın)### Kurulum Adımları1. **Repository'yi klonlayın:**```bashgit clone https://github.com/ali-gurcan/AI-Code-Analyzer-.gitcd AI-Code-Analyzer-```2. **Bağımlılıkları yükleyin:**```bashnpm install```3. **Environment dosyasını oluşturun:**```bashcp .env.example .env```4. **API anahtarınızı .env dosyasına ekleyin:**```VITE_GEMINI_API_KEY=your_gemini_api_key_here```5. **Uygulamayı başlatın:**```bashnpm run dev```## 🎯 Kullanım1. **API Anahtarı**: Gemini API anahtarınızı girin (otomatik olarak .env'den yüklenir)2. **Kod Girişi**: Analiz etmek istediğiniz kodu metin alanına yapıştırın3. **Analiz**: "Kodu Analiz Et" butonuna tıklayın4. **Sonuçlar**: Hatalar, güvenlik açıkları ve iyileştirme önerilerini görüntüleyin5. **Geçmiş**: Önceki analizlerinizi "Geçmiş" sekmesinden görüntüleyin## 🏗️ Proje Yapısı```src/├── classes/           # OOP sınıfları│   ├── GeminiClient.ts       # Gemini API client│   └── LocalStorageManager.ts # Yerel depolama yöneticisi├── components/        # React bileşenleri│   ├── CodeAnalyzer.tsx      # Ana analiz bileşeni│   ├── AnalysisCard.tsx      # Tek analiz kartı│   ├── AnalysisResults.tsx   # Sonuç listesi│   └── History.tsx           # Geçmiş görüntüleyici└── test/             # Test dosyaları    ├── GeminiClient.test.ts
    ├── LocalStorageManager.test.ts
    └── *.test.tsx
```

## 🧪 Test

Testleri çalıştırmak için:

```bash
# Tüm testler
npm test

# Test coverage
npm run test:coverage

# Test UI
npm run test:ui
```

## 🔧 Geliştirme Scripts

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run preview      # Build önizleme
npm run lint         # ESLint kontrolü
npm test            # Testleri çalıştır
```

## 🎨 Teknolojiler

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **AI API**: Google Gemini 2.0 Flash
- **Testing**: Vitest, React Testing Library
- **Styling**: Vanilla CSS (BEM metodolojisi)
- **Linting**: ESLint

## 📋 API Özellikleri

### GeminiClient Sınıfı
- `analyzeCode(code: string)`: Kod analizi yapar
- `testConnection()`: API bağlantısını test eder

### LocalStorageManager Sınıfı
- `saveAnalysis(code, result)`: Analizi kaydeder
- `getAnalyses()`: Tüm analizleri getirir
- `clearAnalyses()`: Tüm analizleri siler
- `deleteAnalysis(id)`: Belirli analizi siler

## 🔒 Güvenlik

- API anahtarları .env dosyasında güvenli şekilde saklanır
- .gitignore ile hassas bilgiler repository'ye dahil edilmez
- Kullanıcı girişleri sanitize edilir

## 🐳 Docker Kullanımı

### Production Build

```bash
# Docker image'ı build edin
npm run docker:build

# Container'ı çalıştırın
npm run docker:run
```

Uygulama http://localhost:3000 adresinde çalışacak.

### Docker Compose ile Çalıştırma

```bash
# Production mode
npm run docker:compose

# Development mode
npm run docker:compose-dev
```

### Manuel Docker Komutları

```bash
# Production build
docker build -t ai-code-analyzer .
docker run -p 3000:80 ai-code-analyzer

# Development build
docker build -f Dockerfile.dev -t ai-code-analyzer-dev .
docker run -p 5173:5173 -v $(pwd):/app ai-code-analyzer-dev
```

## 🚀 Deployment

### Docker Hub'a Push

```bash
# Tag the image
docker tag ai-code-analyzer your-username/ai-code-analyzer:latest

# Push to Docker Hub
docker push your-username/ai-code-analyzer:latest
```

### Vercel/Netlify Deployment

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🙏 Acknowledgments

- Google Gemini AI API
- React ve TypeScript topluluğu
- Vite build tool
- Docker Community

---

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

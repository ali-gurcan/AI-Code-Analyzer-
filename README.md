# 🔍 AI Kod Analiz Aracı

Google Gemini AI ile kodunuzu analiz edin ve hataları tespit edin.

🌐 **Canlı Site:** [https://ai-code-analyzer-eight.vercel.app/](https://ai-code-analyzer-eight.vercel.app/)

## Özellikler

- ✨ AI destekli kod analizi
- 🐛 Hata tespiti
- � Güvenlik kontrolü  
- � İyileştirme önerileri
- � Analiz geçmişi

## Kullanım

1. Siteyi ziyaret edin: https://ai-code-analyzer-eight.vercel.app/
2. Gemini 2.5 flash için API anahtarınızı girin(isteğe bağlı)
3. Kodunuzu yapıştırın
4. "Analiz Et" butonuna tıklayın
5. Sonuçları görüntüleyin

## Yerel Geliştirme

```bash
# Klonlayın
git clone https://github.com/ali-gurcan/AI-Code-Analyzer-.git
cd AI-Code-Analyzer-

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
# .env dosyası oluşturun
cp .env.example .env

# API anahtarınızı ekleyin
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env
```

## API Anahtarı

Gemini API anahtarını [Google AI Studio](https://ai.google.dev/tutorials/setup)'dan alabilirsiniz.

## Docker ile Çalıştırma

```bash
# Production modda çalıştır
docker-compose -f docker/docker-compose.yml up

# Development modda çalıştır  
docker-compose -f docker/docker-compose.yml --profile dev up

# Testleri çalıştır
docker-compose -f docker/docker-compose.yml --profile test up
```

## Teknolojiler

- React 19 + TypeScript
- Vite
- Google Gemini AI
- Docker
- Vitest (Testing)

## Lisans

MIT


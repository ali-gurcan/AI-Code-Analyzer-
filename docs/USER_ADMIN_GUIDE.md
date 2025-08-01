# 👥 Kullanıcı ve Admin Kılavuzu

## AI Kod Analiz Aracı - Kullanım Kılavuzu

---

## 🌐 Hızlı Başlangıç

**Canlı Site:** https://ai-code-analyzer-eight.vercel.app/

1. Siteyi açın
2. API anahtarınızı girin
3. Kodunuzu yapıştırın
4. "Analiz Et" butonuna tıklayın

---

## 👤 Kullanıcı Kılavuzu

### 1. 🔑 API Anahtarı Alma

#### Adım 1: Google AI Studio'ya Git
- [Google AI Studio](https://ai.google.dev/tutorials/setup) sitesini ziyaret edin
- Google hesabınızla giriş yapın

#### Adım 2: API Anahtarı Oluştur
- "Get API Key" butonuna tıklayın
- Yeni bir proje oluşturun veya mevcut projeyi seçin
- API anahtarınızı kopyalayın

#### Adım 3: API Anahtarını Girin
- Uygulama açıldığında üst kısımda "Gemini API Anahtarı" alanını göreceksiniz
- API anahtarınızı buraya yapıştırın
- Anahtar güvenli şekilde tarayıcınızda saklanır

### 2. 📝 Kod Analizi Yapma

#### Kod Girişi
- Sol taraftaki büyük metin alanına analiz etmek istediğiniz kodu yapıştırın
- Desteklenen diller: JavaScript, TypeScript, Python, Java, C++, ve daha fazlası
- Kod boyutu: Maksimum 10,000 karakter

#### Analiz Başlatma
- "Kodu Analiz Et" butonuna tıklayın
- Analiz süreci 5-15 saniye sürebilir
- Yükleme çubuğu ilerlemeyi gösterir

#### Sonuçları İnceleme
Analiz tamamlandığında aşağıdaki bölümleri göreceksiniz:

**🐛 Hatalar**
- Syntax hataları
- Logic hataları  
- Runtime hataları
- Satır ve kolon numaraları ile birlikte

**🔒 Güvenlik**
- Güvenlik açıkları
- Potansiyel tehditler
- Risk seviyesi (Yüksek/Orta/Düşük)
- Çözüm önerileri

**💡 İyileştirmeler**
- Performans önerileri
- Kod kalitesi iyileştirmeleri
- Best practice önerileri
- Refactoring tavsiyeleri

### 3. 📚 Geçmiş Yönetimi

#### Analiz Kaydetme
- Her analiz otomatik olarak kaydedilir
- Tarih ve saat bilgisi ile saklanır
- Tarayıcı hafızasında güvenle tutulur

#### Geçmiş Görüntüleme
- "Geçmiş" sekmesine tıklayın
- Tüm önceki analizlerinizi görün
- En yeniden eskiye doğru sıralanır

#### Geçmiş İşlemleri
- **Yeniden Yükle:** Analizi ana ekrana geri yükler
- **Sil:** Analizi kalıcı olarak kaldırır
- **Tümünü Temizle:** Tüm geçmişi siler

### 4. 🔧 Ayarlar ve Özelleştirme

#### Tema
- Otomatik olarak sistem temasını algılar
- Açık/koyu mod desteği

#### Dil Desteği
- Arayüz: Türkçe
- Analiz: Tüm programlama dilleri

#### Veri Gizliliği
- Kodunuz sadece analiz için kullanılır
- Hiçbir veri sunucularda saklanmaz
- API anahtarı güvenli şekilde saklanır

---

## 🔧 Admin Kılavuzu

### 1. 🚀 Deployment

#### Vercel Deployment
```bash
# Repository'yi Vercel'e bağla
vercel --prod

# Environment variables ekle
vercel env add VITE_GEMINI_API_KEY
```

#### Docker Deployment
```bash
# Production build
docker build -f docker/Dockerfile -t ai-code-analyzer .

# Container çalıştır
docker run -p 3000:80 ai-code-analyzer
```

### 2. 📊 Monitoring

#### Performans Metrikleri
- Sayfa yükleme süreleri
- API response süreleri
- Hata oranları
- Kullanıcı etkileşim oranları

#### Hata Takibi
- Browser console logları
- API hata kodları
- Network hataları
- Memory usage

### 3. 🔧 Maintenance

#### Güncellemeler
```bash
# Bağımlılıkları güncelle
npm update

# Güvenlik güncellemeleri
npm audit fix

# Build test
npm run build
```

#### Backup
- Vercel otomatik backup yapar
- Git repository backup
- Environment variables backup

### 4. 🛡️ Güvenlik

#### API Anahtarı Güvenliği
- Client-side saklama
- HTTPS zorunluluğu
- Rate limiting (Gemini API)

#### CORS Policy
```javascript
// Vite config
export default defineConfig({
  server: {
    cors: true
  }
})
```

#### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               connect-src 'self' https://generativelanguage.googleapis.com;">
```

---

## 🔍 Sorun Giderme

### Sık Karşılaşılan Sorunlar

#### 1. API Anahtarı Hataları
**Sorun:** "Invalid API key" hatası
**Çözüm:** 
- API anahtarının doğru kopyalandığından emin olun
- Google AI Studio'da anahtarın aktif olduğunu kontrol edin
- Quota limitlerini kontrol edin

#### 2. Analiz Çalışmıyor
**Sorun:** "Analysis failed" hatası
**Çözüm:**
- İnternet bağlantınızı kontrol edin
- Kod boyutunu azaltın (max 10k karakter)
- API quota limitlerini kontrol edin

#### 3. Sonuçlar Görünmüyor
**Sorun:** Analiz tamamlandı ama sonuç yok
**Çözüm:**
- Sayfayı yenileyin
- Browser cache'ini temizleyin
- Başka bir browser deneyin

#### 4. Geçmiş Kayboldu
**Sorun:** Önceki analizler görünmüyor
**Çözüm:**
- Browser'ın localStorage'ı temizlenmemiş olduğundan emin olun
- Private/Incognito modda değilseniz kontrol edin
- Aynı browser'ı kullandığınızdan emin olun

### Debug Modları

#### Development Mode
```bash
npm run dev
# Console'da detaylı loglar
```

#### Production Debug
```javascript
// Browser console'da
localStorage.setItem('debug', 'true')
// Sayfayı yenileyin
```

---

## 📞 Destek

### İletişim
- **GitHub Issues:** [Repository Issues](https://github.com/ali-gurcan/AI-Code-Analyzer-/issues)
- **Email:** [Destek için GitHub üzerinden iletişim]

### Katkıda Bulunma
1. Repository'yi fork edin
2. Feature branch oluşturun
3. Pull request gönderin
4. Code review sürecini takip edin

### Dokümantasyon
- **API Docs:** `/docs/MODULE_DOCUMENTATION.md`
- **Test Reports:** `/docs/TEST_REPORT.md`
- **Change Log:** GitHub releases

---

## 📈 En İyi Uygulamalar

### Kullanıcılar İçin
- ✅ Kısa kod parçaları ile başlayın
- ✅ API anahtarınızı güvenli tutun
- ✅ Düzenli olarak geçmişi temizleyin
- ✅ Sonuçları dikkatlice inceleyin

### Geliştiriciler İçin
- ✅ TypeScript kullanın
- ✅ Unit testleri yazın
- ✅ ESLint kurallarına uyun
- ✅ Performance'ı optimize edin

### Yöneticiler İçin
- ✅ Düzenli güvenlik güncellemeleri
- ✅ Monitoring ve alerting
- ✅ Backup planları
- ✅ Capacity planning

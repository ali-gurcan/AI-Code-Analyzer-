# AI Code Analyzer - Docker Test Guide

## Docker Test Komutları

### Test'leri Çalıştırma

```bash
# Test service'ini başlat
docker-compose --profile test up ai-code-analyzer-test

# Test'leri arka planda çalıştır
docker-compose --profile test up -d ai-code-analyzer-test

# Test loglarını göster
docker-compose logs ai-code-analyzer-test

# Test container'ını durdur ve temizle
docker-compose --profile test down
```

### Diğer Docker Komutları

```bash
# Production build
docker-compose up ai-code-analyzer

# Development mode
docker-compose --profile dev up ai-code-analyzer-dev

# Tüm servisleri durdur
docker-compose down

# Volume'ları da temizle
docker-compose down -v
```

### Docker Files

- `Dockerfile` - Production build
- `Dockerfile.dev` - Development build
- `Dockerfile.test` - Test running
- `docker-compose.yml` - Tüm servisler

### Test Özellikleri

✅ 130 comprehensive test
✅ Console error suppression
✅ Clean test output
✅ Full error handling coverage
✅ Component integration tests
✅ API mocking
✅ Performance tests
✅ Security tests

# Changelog

## 2.0.0 - 2 (2026-03-03) NOT PUBLISHED
- **Oyun Başı Sayacı (Countdown):** "3, 2, 1, GO!" akışına Pause/Resume (Duraklat/Devam Et) desteği ve Ana Sayfaya Dönüşte güvenli iptal eklendi. "GO!" metni Dil Seçeneğine bağlandı (TR: BAŞLA!). Çok uzun metinler için ekrandan taşma sorunu (responsive fontsize clamp ile) çözüldü.
- **Oyun Sonu (Game Over) Ekranı:** Stat kutusunun dizaynı modernize edildi (Glassmorphism & Flexbox). Karanlık ve okunaksız metinler düzeltildi, hepsi büyük harf formatına standartlaştırıldı.
- **Elmas Mantığı:** Oyun Sonu ekranında "Toplam Elmas" yerine sadece "Kazanılan Elmas (Earned Gems)" gösterilmeye başlandı. Ayrıca Ana Menü (Menu.js) ekranının sağ üst köşesine oyuncunun sahip olduğu Toplam Elmas miktarını gösteren yeni bir görsel gösterge eklendi.
- **Bonus & İtem Görselleri:** Toplanan özel güçlerin (Slow Mo, Shield, Magnet) hepsi artık klasik küre yerine kendilerine has 3D nesneler olarak tasarlandı (Kum Saati, Kuvvet Alanı Kalkanı, At Nalı Mıknatıs). Elmaslar ise parlayan camımsı bir yapı ile modernize edildi.
- **Reklam Akışı Optimizasyonu:** Oyuncu Game Over ekranında "2X Elmas Kazan (Ödüllü Video - Rewarded Ad)" butonuna tıklayıp reklamı zaten izlediyse; "Yeniden Başla" veya "Ana Menüye Dön" butonlarına tıkladığında ikinci kez Geçiş (Interstitial) ekran reklamı çıkması engellendi.

## 1.0.0 - 1 (2026-02-03) PUBLISHED
Initial release
# Endless Drop 3D – Analiz & Tasarım Dokümanı (v0.2)

## 1. Platform & Teknoloji
- Android + iOS
- Three.js (MIT)
- Vite
- Capacitor
- AdMob
- glTF (.glb)

## 2. Hedef Oyun Profili
- 3D Hyper-Casual
- Sonsuz düşüş
- Tek parmak kontrol
- 30–90 sn oturum süresi
- Skill-based gameplay (Zorunlu halka geçişi)

## 3. Core Gameplay Loop
Start → Countdown → **Zorunlu Halka Geçişi** → Hız Artışı → Miss/Çarpma → Game Over → Reklam → Restart

## 4. Kontrol
- Varsayılan: Swipe
- Opsiyonel: Tilt

## 5. Zorluk Eğrisi
- 0–10 sn: Yavaş, sabit halkalar
- 10–30 sn: Orta hız
- 30–60 sn: Hızlı, karma
- 60+ sn: Çok hızlı

## 6. Engeller
- v1.0: Sabit halkalar
  - Boyut: 1.5 radius (küçültüldü)
  - X pozisyon: -2 ~ +2 (rastgele)
  - **Zorunlu geçiş:** Kaçırılırsa GAME OVER
- v1.1+: Dönen, kapanan, kırılabilir

## 7. Bonus Sistemi
- Slow Motion (3 sn)
- Shield (1 çarpma)
- Magnet (5 sn)
- Spawn oranı: %10

## 8. Tema Sistemi
- Minimal
- Neon
- Renkli / Kids
(Tema menüden seçilir)

## 9. Kamera
- Hafif açılı (15–20°)
- Y ekseni takip
- Smooth lerp

## 10. Ses
- CC0 sesler
- jsfxr ile üretim

## 11. Reklam
- Game Over: Interstitial
- Menü: Banner
- Devam hakkı yok

## 12. Performans & Mimari
- Hedef FPS: 60
- InstancedMesh
- Object Pooling
- Tek scene
- Physics yok (AABB)

### Önerilen Mimari
```
core/
 ├─ GameLoop
 ├─ StateManager
 ├─ InputManager
 ├─ ThemeManager
 ├─ ObstacleFactory
 └─ BonusSystem
```

## 13. Riskler
- FPS düşüşü → Instancing
- Reklam lag → Scene pause
- iOS limit → Düşük texture

---

## 14. Versiyon Geçmişi

### v2.0.0 (2026-03-03)
- **Oyun Başı Sayacı (Countdown):** "3, 2, 1, GO!" akışına Pause/Resume (Duraklat/Devam Et) desteği ve Ana Sayfaya Dönüşte güvenli iptal eklendi. "GO!" metni (TR: BAŞLA!) yerelleştirildi. Taşıma sorunu esnek metin boyutu (clamp) ile çözüldü.
- **Oyun Sonu (Game Over) Ekranı:** Hiyerarşisiz karanlık metinler Glassmorphism & Flexbox destekli okunabilir ve premium stat kutularına dönüştürüldü.
- **Elmas Mantığı & UI:** Oyun Sonu ekranında (toplamın yerine) "Kazanılan Elmas (Earned Gems)" gösterimi aktif edildi. Ana Menü (Menu.js) ekranının sağ üst köşesine oyunun her aşamasında (menüdeyken) güncel "Toplam Elmas Sayaç Göstergesi" eklendi.
- **Bonus Görselleri:** Toplanan 3D nesneler yenilendi. Klasik küreden kopup oyun dünyasına uyan yeni şık formlarına büründüler (Kum Saati, Kuvvet Kalkanı, Mıknatıs ve Cam Elmas).
- **Reklam Akışı Optimizasyonu:** "2X Elmas Kazan (Rewarded)" reklamını izleyen kullanıcılara, oyun bittiğinde Yeniden Başla / Menü seçildiğinde zorunlu reklam (Interstitial) çıkarılması özelliği devre dışı bırakıldı.

### v0.2 (2026-01-31)

#### 🎨 İkon ve Branding
- **App İkonu:** Neon cyberpunk temalı profesyonel ikon tasarlandı
- **PWA Desteği:** manifest.json eklendi
- **Apple Touch Icon:** iOS desteği eklendi
- **Dosyalar:** `public/icon.png`, `public/manifest.json`

#### 🎮 Halka Güncellemeleri
- **Boyut Değişikliği:**
  - Dış radius: 3.0 → **1.5** (-50%)
  - Kalınlık: 0.3 → **0.2** (-33%)
  
- **X Pozisyon Varyasyonu:**
  - Önceki: Sabit (X = 0)
  - Yeni: **-2 ~ +2** rastgele
  - Her oyun farklı deneyim

- **Çarpışma Sistemi Düzeltildi:**
  - Ring merkezine göre doğru mesafe hesaplaması
  - Perfect pass algılaması düzeltildi
  - Collision radii güncellendi (1.2/1.7)

#### ⚠️ Miss Detection Sistemi (ZORUNLU GEÇİŞ)
- **Yeni Kural:** Halkalardan geçmek artık **ZORUNLU**
- **Miss Algılama:**
  - Halka oyuncunun 1 birim üstüne çıktığında kontrol
  - Geçilmemişse → **GAME OVER**
  - Shield bile MISS'i engelleyemez

- **Puanlama:**
  - Normal Pass: +1 puan
  - Perfect Pass: +1 puan + Combo
  - Miss: GAME OVER
  - Collision: GAME OVER (Shield ile kurtulma var)

#### 📝 Teknik Değişiklikler
- `CollisionSystem.js`: Miss detection + improved distance calculation
- `ObstacleFactory.js`: Ring size + random X position + userData reset + **reset() method**
- `Player.js`: **reset() method** added to re-center ball
- `main.js`: Miss handler + game over logic + **restart cleanup logic**
- `index.html`: Icon integration + PWA manifest

#### 📚 Dokümanlar
- `docs/Icon_Integration_Guide.md` - İkon kurulum rehberi
- `docs/Ring_Updates_Changelog.md` - Halka değişiklikleri
- `docs/Miss_System_Changelog.md` - Miss sistem detayları
- `ICON_README.md` - İkon özeti

### v0.4 (2026-01-31) - MVP COMPLETE! 🏆

#### ⏱️ Countdown System
- Oyun başlamadan önce 3-2-1-GO! animasyonu eklendi.
- Oyuncunun oyunun hızına ve pozisyonuna hazırlanması sağlandı.

#### 📅 Daily Tasks UI
- Arka planda çalışan görev sistemi arayüze bağlandı.
- Görev ilerleme çubukları ve ödül (Gem) toplama mekanizması eklendi.

#### ⚙️ Settings & Tilt Control
- **Ayarlar Menüsü:** Müzik, Ses, Haptik ve Tilt açma/kapama seçenekleri.
- **Tilt Control:** Telefonu sağa/sola eğerek topu kontrol etme özelliği eklendi (Opsiyonel).

#### 🌍 Localization (Dil Desteği) - v0.4.1
- **TR/EN Desteği:** Oyun artık Türkçe ve İngilizce dillerini tam destekler.
- **Otomatik Algılama:** Sistem dili TR ise otomatik Türkçe başlar.
- **Manuel Seçim:** Ayarlar menüsünden anlık dil değiştirme.
- **Tüm UI:** Market, Görevler ve Menüler tamamen yerelleştirildi.

#### 🔧 Teknik İyileştirmeler
- `DailyTaskUI.js` ve `SettingsUI.js` bileşenleri eklendi.
- `Player.js`: `deviceorientation` desteği eklendi.
- `main.js`: Countdown state yönetimi eklendi.

### v0.3 (2026-01-31)

#### 🛒 Ball Shop (Market Sistemi)
- **Ekonomi:** Toplanan elmaslar (Gems) artık harcanabiliyor
- **Skin Sistemi:** Farklı renk, parlaklık ve materyal özelliklerine sahip top görünümleri
- **Skinler:**
  - Classic Red (Ücretsiz)
  - Neon Blue (5 Gem)
  - Emerald City (10 Gem)
  - Midas Gold (15 Gem)
  - Void Sphere (30 Gem)
- **Persistency:** Satın alınan skinler local storage'a kaydedilir
- **UI:** Ana menüye SHOP butonu ve tam donanımlı market arayüzü eklendi

#### 🔧 Teknik İyileştirmeler
- `Player.js`: `setSkin` metodu ile dinamik materyal güncelleme
- `Shop.js`: Gem kontrolü ve satın alma mantığına sahip yeni UI bileşeni
- `SkinConfig.js`: Tüm skin verilerinin merkezi yönetimi

### v0.2 (2026-01-31)
- Temel oyun mekaniği
- 3D scene setup
- Player controls
- Obstacle spawning
- Collision detection
- Theme system
- UI components

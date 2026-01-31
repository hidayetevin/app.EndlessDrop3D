# Endless Drop 3D – Icon Integration Guide

Bu rehber, oyun ikonunuzun tüm platformlarda doğru şekilde görünmesi için gerekli adımları içerir.

---

## 📱 **Mevcut Durum**

✅ **Web (index.html):** İkon entegre edildi  
✅ **Public klasörü:** `icon.png` dosyası eklendi  
⚠️ **Android:** Platform henüz eklenmemiş  
⚠️ **iOS:** Platform henüz eklenmemiş  

---

## 🌐 **Web Entegrasyonu (TAMAMLANDI)**

İkon `public/icon.png` olarak kaydedildi ve `index.html` içinde referans verildi:

```html
<link rel="icon" type="image/png" href="/icon.png" />
<link rel="apple-touch-icon" href="/icon.png" />
```

**Test:**
```bash
npm run dev
```
Tarayıcı sekmesinde ve iOS'da "Ana Ekrana Ekle" yaptığınızda ikonunuz görünecektir.

---

## 🤖 **Android Entegrasyonu**

### 1. Android Platformunu Ekleyin (İlk Kez)

```bash
# Önce web build yapın
npm run build

# Android platformunu ekleyin
npx cap add android

# Sync yapın
npx cap sync
```

### 2. İkon Dosyalarını Hazırlayın

Android farklı boyutlarda ikon gerektirir. Aşağıdaki komutları kullanarak otomatik oluşturabilirsiniz:

#### Option A: Capacitor Assets Generator (ÖNERİLEN)

```bash
npm install -g @capacitor/assets

# assets klasörü oluşturun
mkdir -p assets

# Ana ikonunuzu kopyalayın (1024x1024 olmalı)
cp public/icon.png assets/icon.png

# Otomatik oluştur
npx capacitor-assets generate
```

#### Option B: Manuel Oluşturma

Eğer otomatik araç çalışmazsa, aşağıdaki boyutlarda manuel olarak oluşturun:

| Boyut | Klasör | Dosya Adı |
|-------|--------|-----------|
| 48x48 | `android/app/src/main/res/mipmap-mdpi/` | `ic_launcher.png` |
| 72x72 | `android/app/src/main/res/mipmap-hdpi/` | `ic_launcher.png` |
| 96x96 | `android/app/src/main/res/mipmap-xhdpi/` | `ic_launcher.png` |
| 144x144 | `android/app/src/main/res/mipmap-xxhdpi/` | `ic_launcher.png` |
| 192x192 | `android/app/src/main/res/mipmap-xxxhdpi/` | `ic_launcher.png` |
| 512x512 | `android/app/src/main/res/` | `ic_launcher_foreground.png` |

**PowerShell ile boyutlandırma (ImageMagick gerektirir):**

```powershell
# ImageMagick kurulu değilse: winget install ImageMagick

$icon = "public\icon.png"
$sizes = @(
    @{size=48; folder="mdpi"},
    @{size=72; folder="hdpi"},
    @{size=96; folder="xhdpi"},
    @{size=144; folder="xxhdpi"},
    @{size=192; folder="xxxhdpi"}
)

foreach ($s in $sizes) {
    $outDir = "android\app\src\main\res\mipmap-$($s.folder)"
    New-Item -ItemType Directory -Force -Path $outDir
    magick $icon -resize "$($s.size)x$($s.size)" "$outDir\ic_launcher.png"
}
```

### 3. Adaptive Icon (Android 8.0+)

Modern Android için adaptive icon oluşturun:

**android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

**android/app/src/main/res/values/colors.xml:** (arka plan rengi)
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#1a0f2e</color>
</resources>
```

### 4. Build ve Test

```bash
npx cap sync
npx cap open android
```

Android Studio'da:
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. APK'yı cihazınıza yükleyin
3. Ana ekranda ikonunuzu kontrol edin

---

## 🍎 **iOS Entegrasyonu**

### 1. iOS Platformunu Ekleyin

```bash
npx cap add ios
npx cap sync
```

### 2. İkonları Ekleyin

iOS için `AppIcon.appiconset` klasörüne farklı boyutlarda ikonlar eklemeniz gerekir:

**Gerekli boyutlar:**
- 20x20 (2x, 3x)
- 29x29 (2x, 3x)
- 40x40 (2x, 3x)
- 60x60 (2x, 3x)
- 76x76 (1x, 2x)
- 83.5x83.5 (2x)
- 1024x1024 (1x)

**Xcode'da Manuel Ekleme:**
1. `npx cap open ios`
2. Assets.xcassets → AppIcon
3. Her slot için ilgili boyuttaki ikonu sürükle-bırak

---

## 🎨 **İkon Varyasyonları (Opsiyonel)**

Farklı temalar için alternatif ikonlar oluşturabilirsiniz:

```
public/
├── icon.png          (Ana ikon - Neon tema)
├── icon-minimal.png  (Minimal tema)
├── icon-kids.png     (Kids tema)
└── icon-space.png    (Space tema)
```

---

## ✅ **Checklist**

### Web
- [x] `public/icon.png` dosyası eklendi
- [x] `index.html` içinde favicon eklendi
- [x] Apple touch icon eklendi

### Android (Yapılacak)
- [ ] `npx cap add android` komutu çalıştırıldı
- [ ] İkon boyutları oluşturuldu (48px - 192px)
- [ ] Adaptive icon eklendi (Android 8.0+)
- [ ] APK build ve test edildi

### iOS (Yapılacak)
- [ ] `npx cap add ios` komutu çalıştırıldı
- [ ] AppIcon.appiconset dolduruldu
- [ ] Xcode'da build ve test edildi

---

## 🚀 **Hızlı Başlangıç**

Eğer sadece test etmek istiyorsanız:

```bash
# 1. Web'de test
npm run dev

# 2. Android için (platform eklendiyse)
npm run build
npx cap sync
npx cap open android

# 3. iOS için (platform eklendiyse)
npm run build
npx cap sync
npx cap open ios
```

---

## 📚 **Kaynaklar**

- [Capacitor Assets Generator](https://github.com/ionic-team/capacitor-assets)
- [Android Icon Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher)
- [iOS Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [ImageMagick](https://imagemagick.org/)

---

## 🎯 **Sonraki Adımlar**

1. ✅ İkon tasarımı tamamlandı
2. ✅ Web entegrasyonu yapıldı
3. ⏳ Android platformu eklenecek (`npx cap add android`)
4. ⏳ Platform-specific ikonlar oluşturulacak
5. ⏳ APK build ve test edilecek

**Not:** Android/iOS platformlarını eklemeden önce `npm run build` komutunu çalıştırın!

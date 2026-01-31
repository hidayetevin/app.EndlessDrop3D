export const Translations = {
    en: {
        PLAY: 'PLAY',
        SHOP: 'SHOP 💎',
        TASKS: 'TASKS 📅',
        SETTINGS: 'SETTINGS ⚙️',
        BACK: 'BACK',
        HIGH_SCORE: 'High Score',
        PAUSED: 'PAUSED',
        RESUME: 'RESUME',
        MAIN_MENU: 'MAIN MENU',
        GAME_OVER: 'GAME OVER',
        RESTART: 'RESTART',
        SCORE: 'SCORE',
        TOTAL_GEMS: 'TOTAL GEMS',
        BEST_COMBO: 'BEST COMBO',
        BALL_SHOP: 'BALL SHOP',
        SELECT: 'SELECT',
        SELECTED: 'SELECTED',
        CLAIMED: '✅ CLAIMED',
        CLAIM_REWARD: 'CLAIM REWARD',
        DAILY_MISSIONS: 'DAILY MISSIONS',
        MUSIC: 'Music',
        SOUND_FX: 'Sound FX',
        HAPTICS: 'Haptics',
        TILT_CONTROL: 'Tilt Control',
        LANGUAGE: 'Language',
        REWARD: 'Reward',
        PERFECT: 'PERFECT',
        DESC_score_500: 'Score 500 points',
        DESC_score_1000: 'Score 1000 points',
        DESC_rings_20: 'Pass through 20 rings',
        DESC_rings_50: 'Pass through 50 rings',
        DESC_gems_10: 'Collect 10 gems',
        DESC_perfect_5: 'Get 5 perfect passes',
        DESC_perfect_10: 'Get 10 perfect passes',
        DESC_games_3: 'Play 3 games',
        DESC_combo_5: 'Get a 5x combo',
        SKIN_default: 'Classic Red',
        SKIN_neon: 'Neon Blue',
        SKIN_gold: 'Midas Touch',
        SKIN_void: 'Void Sphere',
        SKIN_emerald: 'Emerald City'
    },
    tr: {
        PLAY: 'OYNA',
        SHOP: 'MARKET 💎',
        TASKS: 'GÖREVLER 📅',
        SETTINGS: 'AYARLAR ⚙️',
        BACK: 'GERİ',
        HIGH_SCORE: 'En Yüksek Skor',
        PAUSED: 'DURAKLATILDI',
        RESUME: 'DEVAM ET',
        MAIN_MENU: 'ANA MENÜ',
        GAME_OVER: 'OYUN BİTTİ',
        RESTART: 'YENİDEN BAŞLA',
        SCORE: 'SKOR',
        TOTAL_GEMS: 'TOPLAM ELMAS',
        BEST_COMBO: 'EN İYİ KOMBO',
        BALL_SHOP: 'TOP MARKETİ',
        SELECT: 'SEÇ',
        SELECTED: 'SEÇİLDİ',
        CLAIMED: '✅ ALINDI',
        CLAIM_REWARD: 'ÖDÜLÜ AL',
        DAILY_MISSIONS: 'GÜNLÜK GÖREVLER',
        MUSIC: 'Müzik',
        SOUND_FX: 'Ses Efektleri',
        HAPTICS: 'Titreşim',
        TILT_CONTROL: 'Eğimle Kontrol',
        LANGUAGE: 'Dil',
        REWARD: 'Ödül',
        PERFECT: 'MÜKEMMEL',
        DESC_score_500: '500 Puan Yap',
        DESC_score_1000: '1000 Puan Yap',
        DESC_rings_20: '20 Halkadan Geç',
        DESC_rings_50: '50 Halkadan Geç',
        DESC_gems_10: '10 Elmas Topla',
        DESC_perfect_5: '5 Mükemmel Geçiş Yap',
        DESC_perfect_10: '10 Mükemmel Geçiş Yap',
        DESC_games_3: '3 Oyun Oyna',
        DESC_combo_5: '5x Kombo Yap',
        SKIN_default: 'Klasik Kırmızı',
        SKIN_neon: 'Neon Mavi',
        SKIN_gold: 'Midas Dokunuşu',
        SKIN_void: 'Void Küresi',
        SKIN_emerald: 'Zümrüt Şehri'
    }
};

export class LanguageManager {
    constructor(storage) {
        this.storage = storage;
        this.currentLang = this.storage.data.settings.language || this.detectLanguage();
    }

    detectLanguage() {
        const lang = navigator.language || navigator.userLanguage;
        return lang.startsWith('tr') ? 'tr' : 'en';
    }

    setLanguage(lang) {
        if (Translations[lang]) {
            this.currentLang = lang;
            this.storage.updateSetting('language', lang);
            return true;
        }
        return false;
    }

    get(key) {
        return Translations[this.currentLang][key] || key;
    }
}

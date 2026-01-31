import {
    AdMob,
    BannerAdPosition,
    BannerAdSize,
    RewardAdPluginEvents,
    InterstitialAdPluginEvents
} from '@capacitor-community/admob';

export class AdManager {
    constructor() {
        this.appId = 'ca-app-pub-4190858087915294~7529289894';
        this.bannerId = 'ca-app-pub-4190858087915294/6216208220';
        this.interstitialId = 'ca-app-pub-4190858087915294/4903126552';
        this.rewardedId = 'ca-app-pub-4190858087915294/9963881541';

        this.isInitialized = false;
        this.interstitialReady = false;
        this.rewardedReady = false;
    }

    async initialize() {
        try {
            await AdMob.initialize({
                requestTrackingAuthorization: true,
                testingDevices: [],
                initializeForTesting: false,
            });
            this.isInitialized = true;
            console.log('AdMob initialized');

            this.showBanner();

            // Preload ads
            this.prepareInterstitial();
            this.prepareRewarded();

            this.setupListeners();
        } catch (e) {
            console.error('AdMob initialization failed', e);
        }
    }

    setupListeners() {
        // Prepare next ads when current ones are dismissed
        AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
            console.log('Interstitial dismissed, preparing next one...');
            this.interstitialReady = false;
            setTimeout(() => this.prepareInterstitial(), 2000);
        });

        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            console.log('Rewarded ad dismissed, preparing next one...');
            this.rewardedReady = false;
            setTimeout(() => this.prepareRewarded(), 2000);
        });
    }

    async prepareInterstitial() {
        if (!this.isInitialized) return;

        try {
            this.interstitialReady = false;
            console.log('📺 Interstitial hazırlanıyor...');
            await AdMob.prepareInterstitial({
                adId: this.interstitialId,
            });
            this.interstitialReady = true;
            console.log('✅ Interstitial hazır!');
        } catch (e) {
            console.error('❌ Interstitial hazırlanamadı, 5sn sonra tekrar denenecek', e);
            this.interstitialReady = false;
            setTimeout(() => this.prepareInterstitial(), 5000); // Hata durumunda tekrar dene
        }
    }

    async prepareRewarded() {
        if (!this.isInitialized) return;

        try {
            this.rewardedReady = false;
            console.log('🎁 Ödüllü reklam hazırlanıyor...');
            await AdMob.prepareRewardVideoAd({
                adId: this.rewardedId,
            });
            this.rewardedReady = true;
            console.log('✅ Ödüllü reklam hazır!');
        } catch (e) {
            console.error('❌ Ödüllü reklam hazırlanamadı, 5sn sonra tekrar denenecek', e);
            this.rewardedReady = false;
            setTimeout(() => this.prepareRewarded(), 5000); // Hata durumunda tekrar dene
        }
    }

    isRewardedReady() {
        return this.isInitialized && this.rewardedReady;
    }

    isInterstitialReady() {
        return this.isInitialized && this.interstitialReady;
    }

    async showBanner() {
        if (!this.isInitialized) return;

        const options = {
            adId: this.bannerId,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
        };

        try {
            await AdMob.showBanner(options);
            console.log('📊 Banner gösteriliyor');
        } catch (e) {
            console.error('❌ Banner gösterilemedi', e);
        }
    }

    async hideBanner() {
        if (!this.isInitialized) return;
        await AdMob.hideBanner();
    }

    async showInterstitial() {
        if (!this.isInitialized) return;

        if (!this.interstitialReady) {
            console.warn('⚠️ Interstitial henüz hazır değil, yükleme tetiklendi.');
            this.prepareInterstitial();
            return false;
        }

        try {
            await AdMob.showInterstitial();
            return true;
        } catch (e) {
            console.error('❌ Interstitial gösterilirken hata oluştu', e);
            this.prepareInterstitial();
            return false;
        }
    }

    async showRewarded(onComplete) {
        if (!this.isInitialized) {
            if (onComplete) onComplete(false);
            return;
        }

        if (!this.rewardedReady) {
            console.warn('⚠️ Ödüllü reklam hazır değil.');
            this.prepareRewarded();
            if (onComplete) onComplete(false);
            return;
        }

        try {
            // Ödül dinleyicisi (her gösterim için özel)
            const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
                console.log('💰 Ödül kazanıldı:', reward);
                if (onComplete) onComplete(true);
                rewardListener.remove();
            });

            await AdMob.showRewardVideoAd();
        } catch (e) {
            console.error('❌ Ödüllü reklam gösterilemedi', e);
            if (onComplete) onComplete(false);
            this.prepareRewarded();
        }
    }
}

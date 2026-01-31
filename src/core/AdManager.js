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
            await AdMob.prepareInterstitial({
                adId: this.interstitialId,
            });
            this.interstitialReady = true;
            console.log('Interstitial ad ready');
        } catch (e) {
            console.error('Failed to prepare interstitial', e);
            this.interstitialReady = false;
        }
    }

    async prepareRewarded() {
        if (!this.isInitialized) return;
        try {
            await AdMob.prepareRewardVideoAd({
                adId: this.rewardedId,
            });
            this.rewardedReady = true;
            console.log('Rewarded ad ready');
        } catch (e) {
            console.error('Failed to prepare rewarded ad', e);
            this.rewardedReady = false;
        }
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
        } catch (e) {
            console.error('Failed to show banner', e);
        }
    }

    async hideBanner() {
        if (!this.isInitialized) return;
        await AdMob.hideBanner();
    }

    async showInterstitial() {
        if (!this.isInitialized) return;

        if (!this.interstitialReady) {
            console.warn('Interstitial not ready, preparing...');
            this.prepareInterstitial();
            return;
        }

        try {
            await AdMob.showInterstitial();
        } catch (e) {
            console.error('Failed to show interstitial', e);
            this.prepareInterstitial();
        }
    }

    async showRewarded(onComplete) {
        if (!this.isInitialized) return;

        if (!this.rewardedReady) {
            console.warn('Rewarded ad not ready, preparing...');
            this.prepareRewarded();
            if (onComplete) onComplete(false);
            return;
        }

        try {
            // Listen for reward (specific to this call)
            const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
                console.log('Reward received:', reward);
                if (onComplete) onComplete(true);
                rewardListener.remove();
            });

            await AdMob.showRewardVideoAd();
        } catch (e) {
            console.error('Failed to show rewarded ad', e);
            if (onComplete) onComplete(false);
            this.prepareRewarded();
        }
    }
}

import {
    AdMob,
    BannerAdPosition,
    BannerAdSize,
    RewardAdPluginEvents
} from '@capacitor-community/admob';

export class AdManager {
    constructor() {
        this.appId = 'ca-app-pub-4190858087915294~7529289894';
        this.bannerId = 'ca-app-pub-4190858087915294/6216208220';
        this.interstitialId = 'ca-app-pub-4190858087915294/4903126552';
        this.rewardedId = 'ca-app-pub-4190858087915294/9963881541';

        this.isInitialized = false;
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
        } catch (e) {
            console.error('AdMob initialization failed', e);
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

        try {
            await AdMob.prepareInterstitial({
                adId: this.interstitialId,
            });
            await AdMob.showInterstitial();
        } catch (e) {
            console.error('Failed to show interstitial', e);
        }
    }

    async showRewarded(onComplete) {
        if (!this.isInitialized) return;

        try {
            await AdMob.prepareRewardVideoAd({
                adId: this.rewardedId,
            });

            // Listen for reward
            const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
                console.log('Reward received:', reward);
                if (onComplete) onComplete(true);
                rewardListener.remove();
            });

            // Handle dismissal without reward
            const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
                dismissListener.remove();
            });

            await AdMob.showRewardVideoAd();
        } catch (e) {
            console.error('Failed to show rewarded ad', e);
            if (onComplete) onComplete(false);
        }
    }
}

export class AudioManager {
    constructor(camera) {
        // THREE.js Audio System
        this.camera = camera;
        this.listener = null;
        this.loader = null;
        this.bgMusic = null;
        this.currentBiome = null;
        this.musicCache = {}; // Cache loaded music

        // Settings
        this.sounds = {};
        this.musicEnabled = true;
        this.soundEnabled = true;
        this.musicVolume = 0.3; // Lower volume for background music

        // SFX Audio Context (kept for backward compatibility)
        this.audioContext = null;
        this.initAudio();
    }

    initAudio() {
        // Initialize Web Audio API for SFX
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }

        // Initialize THREE.js Audio System for background music
        if (this.camera) {
            try {
                const THREE = window.THREE || require('three');
                this.listener = new THREE.AudioListener();
                this.camera.add(this.listener);
                this.loader = new THREE.AudioLoader();
                console.log('✅ THREE.Audio initialized with camera');
            } catch (e) {
                console.warn('THREE.Audio initialization failed:', e);
            }
        }
    }

    // Simple beep generator for placeholder sounds
    playBeep(frequency = 440, duration = 0.1, type = 'sine') {
        if (!this.soundEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Predefined sound effects
    playPerfect() {
        this.playBeep(880, 0.15, 'sine'); // High pitch
    }

    playPass() {
        this.playBeep(440, 0.08, 'square'); // Mid pitch
    }

    playCoin() {
        this.playBeep(660, 0.12, 'triangle'); // Coin sound
    }

    playBonus() {
        this.playBeep(1200, 0.2, 'sine'); // Power-up
    }

    playCrash() {
        this.playBeep(110, 0.3, 'sawtooth'); // Low crash
    }

    playClick() {
        this.playBeep(300, 0.05, 'square'); // UI click
    }

    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        if (!enabled && this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.pause();
        } else if (enabled && this.bgMusic && !this.bgMusic.isPlaying) {
            this.bgMusic.play();
        }
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    // Resume audio context (required for iOS)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        // Resume background music if it was playing
        if (this.musicEnabled && this.bgMusic && !this.bgMusic.isPlaying) {
            this.bgMusic.play();
        }
    }

    pause() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.pause();
        }
    }

    stop() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }
    }

    // ===== BACKGROUND MUSIC SYSTEM (THREE.Audio) =====

    /**
     * Load biome music from assets
     * @param {string} biomeName - 'SKY', 'SPACE', or 'VOID'
     * @returns {Promise<THREE.Audio>}
     */
    async loadBiomeMusic(biomeName) {
        if (!this.listener || !this.loader) {
            console.warn('THREE.Audio system not initialized');
            return null;
        }

        // Check cache first
        if (this.musicCache[biomeName]) {
            console.log(`🎵 Using cached music: ${biomeName}`);
            return this.musicCache[biomeName];
        }

        return new Promise((resolve, reject) => {
            const path = `assets/music/${biomeName.toLowerCase()}.mp3`;

            this.loader.load(
                path,
                (buffer) => {
                    const THREE = window.THREE || require('three');
                    const music = new THREE.Audio(this.listener);
                    music.setBuffer(buffer);
                    music.setLoop(true);
                    music.setVolume(this.musicVolume);

                    // Cache it
                    this.musicCache[biomeName] = music;

                    console.log(`✅ Loaded music: ${biomeName}`);
                    resolve(music);
                },
                (progress) => {
                    // Optional: track loading progress
                    const percent = (progress.loaded / progress.total) * 100;
                    console.log(`Loading ${biomeName} music: ${percent.toFixed(0)}%`);
                },
                (error) => {
                    console.error(`❌ Failed to load music: ${biomeName}`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Start background music for a biome
     * @param {string} biomeName - 'SKY', 'SPACE', or 'VOID'
     */
    async startBackgroundMusic(biomeName) {
        if (!this.musicEnabled) return;

        try {
            const music = await this.loadBiomeMusic(biomeName);

            if (music) {
                // Stop current music if playing
                if (this.bgMusic && this.bgMusic.isPlaying) {
                    this.bgMusic.stop();
                }

                this.bgMusic = music;
                this.currentBiome = biomeName;
                this.bgMusic.play();

                console.log(`🎵 Playing: ${biomeName}`);
            }
        } catch (error) {
            console.warn('Background music failed to start:', error);
        }
    }

    /**
     * Crossfade to new biome music
     * @param {string} newBiome - Target biome name
     * @param {number} duration - Fade duration in seconds
     */
    async crossfadeTo(newBiome, duration = 2.0) {
        if (!this.musicEnabled || newBiome === this.currentBiome) return;

        try {
            const newMusic = await this.loadBiomeMusic(newBiome);
            if (!newMusic) return;

            const oldMusic = this.bgMusic;
            const startTime = this.audioContext ? this.audioContext.currentTime : Date.now() / 1000;

            // Start new music at volume 0
            newMusic.setVolume(0);
            newMusic.play();

            // Crossfade animation
            const fadeStep = () => {
                const elapsed = (this.audioContext ? this.audioContext.currentTime : Date.now() / 1000) - startTime;
                const progress = Math.min(elapsed / duration, 1.0);

                // Fade out old, fade in new
                if (oldMusic && oldMusic.isPlaying) {
                    oldMusic.setVolume(this.musicVolume * (1 - progress));
                }
                newMusic.setVolume(this.musicVolume * progress);

                if (progress < 1.0) {
                    requestAnimationFrame(fadeStep);
                } else {
                    // Fade complete
                    if (oldMusic && oldMusic.isPlaying) {
                        oldMusic.stop();
                    }
                    console.log(`🎵 Crossfade complete: ${this.currentBiome} → ${newBiome}`);
                }
            };

            fadeStep();

            this.bgMusic = newMusic;
            this.currentBiome = newBiome;

        } catch (error) {
            console.warn('Crossfade failed:', error);
            // Fallback: just switch immediately
            await this.startBackgroundMusic(newBiome);
        }
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
            console.log('🎵 Background music stopped');
        }
    }

    /**
     * Set music volume (0.0 - 1.0)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.bgMusic) {
            this.bgMusic.setVolume(this.musicVolume);
        }
    }
}

import * as THREE from 'three';

export class ThemeManager {
    constructor(scene, audioManager = null) {
        this.scene = scene;
        this.audioManager = audioManager;
        this.currentTheme = 'SKY';
        this.currentBiome = 0;

        // Skybox system
        this.textureLoader = new THREE.TextureLoader();
        this.skyboxCache = {}; // Cache loaded textures
        this.useSkybox = true; // Toggle skybox (fallback to solid color)

        // Biome definitions (changes with distance)
        this.biomes = [
            {
                name: 'SKY',
                skyboxPath: 'assets/skybox/sky.png',
                backgroundColor: 0x87CEEB,
                ambientColor: 0xffffff,
                ambientIntensity: 0.6,
                directionalColor: 0xffffff,
                directionalIntensity: 0.8,
                fogColor: 0x87CEEB,
                fogNear: 20,
                fogFar: 100
            },
            {
                name: 'SPACE',
                skyboxPath: 'assets/skybox/space.png',
                backgroundColor: 0x0a0a2e,
                ambientColor: 0x6666ff,
                ambientIntensity: 0.4,
                directionalColor: 0xaaaaff,
                directionalIntensity: 0.6,
                fogColor: 0x0a0a2e,
                fogNear: 30,
                fogFar: 120
            },
            {
                name: 'VOID',
                skyboxPath: 'assets/skybox/void.png',
                backgroundColor: 0x1a0000,
                ambientColor: 0xff3333,
                ambientIntensity: 0.3,
                directionalColor: 0xff6666,
                directionalIntensity: 0.5,
                fogColor: 0x1a0000,
                fogNear: 15,
                fogFar: 80
            }
        ];

        // Theme presets (user selectable - for future menu)
        this.themes = {
            MINIMAL: { ringColor: 0xffffff, playerColor: 0x333333 },
            NEON: { ringColor: 0x00ffff, playerColor: 0xff0055 },
            KIDS: { ringColor: 0xff66ff, playerColor: 0xffaa00 }
        };

        this.selectedTheme = 'NEON';
        this.lights = { ambient: null, directional: null };
    }

    setLights(ambientLight, directionalLight) {
        this.lights.ambient = ambientLight;
        this.lights.directional = directionalLight;
    }

    updateBiome(score) {
        let newBiome = 0;

        if (score > 1000) {
            newBiome = 2; // VOID
        } else if (score > 500) {
            newBiome = 1; // SPACE
        }

        if (newBiome !== this.currentBiome) {
            this.currentBiome = newBiome;
            this.applyBiome(this.biomes[newBiome]);
            return true; // Biome changed
        }

        return false;
    }

    applyBiome(biome) {
        // Try to load skybox texture (async, non-blocking)
        if (this.useSkybox && biome.skyboxPath) {
            this.loadSkyboxTexture(biome.skyboxPath)
                .then((texture) => {
                    this.scene.background = texture;
                    console.log(`🌌 Skybox loaded: ${biome.name}`);
                })
                .catch(() => {
                    // Fallback to solid color
                    this.scene.background = new THREE.Color(biome.backgroundColor);
                    console.warn(`⚠️ Skybox failed, using solid color: ${biome.name}`);
                });
        } else {
            // No skybox, use solid color
            this.scene.background = new THREE.Color(biome.backgroundColor);
        }

        // Update fog
        this.scene.fog = new THREE.Fog(biome.fogColor, biome.fogNear, biome.fogFar);

        // Update lights
        if (this.lights.ambient) {
            this.lights.ambient.color.setHex(biome.ambientColor);
            this.lights.ambient.intensity = biome.ambientIntensity;
        }

        if (this.lights.directional) {
            this.lights.directional.color.setHex(biome.directionalColor);
            this.lights.directional.intensity = biome.directionalIntensity;
        }

        // Crossfade background music
        if (this.audioManager && this.audioManager.crossfadeTo) {
            this.audioManager.crossfadeTo(biome.name, 2.0);
        }

        console.log(`🌍 Biome changed to: ${biome.name}`);
    }

    /**
     * Load skybox texture (lazy loading with cache)
     * @param {string} path - Path to texture file
     * @returns {Promise<THREE.Texture>}
     */
    loadSkyboxTexture(path) {
        console.log(`🖼️ Attempting to load skybox: ${path}`);

        // Check cache first
        if (this.skyboxCache[path]) {
            console.log(`🌌 Using cached skybox: ${path}`);
            return Promise.resolve(this.skyboxCache[path]);
        }

        // Load texture
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    // Configure for equirectangular skybox
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    texture.colorSpace = THREE.SRGBColorSpace;

                    // Cache it
                    this.skyboxCache[path] = texture;

                    resolve(texture);
                },
                undefined, // onProgress (optional)
                (error) => {
                    console.error(`❌ Failed to load skybox: ${path}`, error);
                    reject(error);
                }
            );
        });
    }

    applyTheme(themeName) {
        if (!this.themes[themeName]) return;

        this.selectedTheme = themeName;
        // Theme colors will be applied to player/rings when they're created
        // This is for future shop/menu integration
    }

    getCurrentBiome() {
        return this.biomes[this.currentBiome];
    }

    getThemeColors() {
        return this.themes[this.selectedTheme];
    }

    reset() {
        this.currentBiome = 0;
        this.applyBiome(this.biomes[0]);
    }
}

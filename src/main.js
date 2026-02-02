import './style.css';
import { SceneManager } from './core/SceneManager.js';
import { CameraManager } from './core/CameraManager.js';
import { Player } from './core/Player.js';
import { GameLoop } from './core/GameLoop.js';
import { ObstacleFactory } from './core/ObstacleFactory.js';
import { CollisionSystem } from './core/CollisionSystem.js';
import { GameState } from './core/GameState.js';
import { BonusSystem } from './core/BonusSystem.js';
import { DifficultyManager } from './core/DifficultyManager.js';
import { ThemeManager } from './core/ThemeManager.js';
import { Menu } from './ui/Menu.js';
import { HUD } from './ui/HUD.js';
import { GameOver } from './ui/GameOver.js';
import { StorageManager } from './core/StorageManager.js';
import { DailyTaskManager } from './core/DailyTaskManager.js';
import { AudioManager } from './core/AudioManager.js';
import { HapticManager } from './core/HapticManager.js';
import { Shop } from './ui/Shop.js';
import { SkinConfig } from './core/SkinConfig.js';
import { DailyTaskUI } from './ui/DailyTaskUI.js';
import { SettingsUI } from './ui/SettingsUI.js';
import { LanguageManager } from './core/LanguageManager.js';
import { AdManager } from './core/AdManager.js';
import { ParticleManager } from './core/ParticleManager.js';
import { TrailRenderer } from './core/TrailRenderer.js';


class Game {
  constructor() {
    this.storage = new StorageManager();
    this.lang = new LanguageManager(this.storage);
    this.ads = new AdManager();
    this.gemsCollectedThisRun = 0;

    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager();

    // AudioManager needs camera for THREE.AudioListener
    this.audio = new AudioManager(this.cameraManager.camera);

    this.player = new Player(this.sceneManager.scene);
    this.obstacleFactory = new ObstacleFactory(this.sceneManager.scene);
    this.collisionSystem = new CollisionSystem();
    this.gameState = new GameState();
    this.bonusSystem = new BonusSystem(this.sceneManager.scene);
    this.difficultyManager = new DifficultyManager();

    // ThemeManager needs audioManager for background music
    this.themeManager = new ThemeManager(this.sceneManager.scene, this.audio);

    // Visual Effects Systems
    this.particleManager = new ParticleManager(this.sceneManager.scene);
    this.trailRenderer = new TrailRenderer(this.sceneManager.scene, this.player.mesh);

    // Core Systems
    this.dailyTasks = new DailyTaskManager(this.storage);
    this.haptic = new HapticManager();

    // UI Components
    this.menu = new Menu(
      () => this.startGame(),
      (theme) => this.changeTheme(theme),
      () => this.showShop(),
      () => this.showTasks(),
      () => this.showSettings(),
      this.lang
    );
    this.hud = new HUD(this.lang);
    this.shop = new Shop(this.storage, (skinId) => this.applySkin(skinId), this.lang);
    this.taskUI = new DailyTaskUI(this.storage, this.dailyTasks, this.lang);
    this.settingsUI = new SettingsUI(this.storage, (key, val) => this.applySetting(key, val), this.lang);
    this.gameOverScreen = new GameOver(
      () => this.restartGame(),
      () => this.showMenu(),
      this.lang,
      () => this.showRewardedAd()
    );

    this.sceneManager.setCamera(this.cameraManager.camera);
    this.cameraManager.setTarget(this.player.mesh);

    this.gameLoop = new GameLoop(this.update.bind(this));

    this.init();
    this.ads.initialize();
  }

  init() {
    console.log("Endless Drop 3D initialized");

    // Give theme manager access to lights
    const lights = this.sceneManager.scene.children.filter(c => c.isLight);
    if (lights.length >= 2) {
      this.themeManager.setLights(lights[0], lights[1]);
    }
    this.themeManager.reset(); // Apply initial biome

    // Apply initial skin and settings
    this.applySkin(this.storage.data.selectedSkin);
    this.player.useTilt = this.storage.data.settings.tiltEnabled;

    this.hud.create();
    this.hud.setPauseCallbacks(
      () => this.pauseGame(),
      () => this.resumeGame(),
      () => this.quitToMenu()
    );

    this.createOverlays();
    this.menu.show(); // Show menu on startup

    // Apply initial audio settings
    if (this.storage.data.settings.musicVolume !== undefined) {
      this.audio.setMusicVolume(this.storage.data.settings.musicVolume);
    }
    if (this.storage.data.settings.soundEnabled !== undefined) {
      this.audio.setSoundEnabled(this.storage.data.settings.soundEnabled);
    }

    // Start background music (MOVED to startGame)
    // if (this.storage.data.settings.musicEnabled) {
    //   this.audio.startBackgroundMusic('SKY');
    // }

    this.gameLoop.start(); // Start rendering loop
  }

  createOverlays() {
    // Countdown Overlay
    this.countdownOverlay = document.createElement('div');
    this.countdownOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1500;
      pointer-events: none;
    `;
    this.countdownText = document.createElement('div');
    this.countdownText.style.cssText = `
      color: white;
      font-size: 150px;
      font-weight: bold;
      text-shadow: 0 0 30px rgba(0,217,255,0.5);
      font-family: Arial, sans-serif;
    `;
    this.countdownOverlay.appendChild(this.countdownText);
    document.body.appendChild(this.countdownOverlay);

    // Tap to Start Overlay
    this.tapOverlay = document.createElement('div');
    this.tapOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.4);
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1600;
      cursor: pointer;
    `;
    this.tapTextElement = document.createElement('div');
    this.tapTextElement.textContent = this.lang.get('TAP_TO_START');
    this.tapTextElement.style.cssText = `
      color: white;
      font-size: var(--font-size-h2, 40px);
      font-weight: bold;
      text-shadow: 0 0 20px rgba(0,217,255,0.8);
      font-family: Arial, sans-serif;
      animation: pulse 1.5s infinite;
      text-align: center;
      padding: 20px;
    `;
    this.tapOverlay.appendChild(this.tapTextElement);
    this.tapOverlay.onclick = () => {
      // 🔊 CRITICAL: Resume audio context on first real user interaction
      if (this.audio) this.audio.resume();

      this.tapOverlay.style.display = 'none';
      this.startCountdown();
    };
    document.body.appendChild(this.tapOverlay);
  }

  pauseGame() {
    this.gameState.pause();
    this.hud.showPauseMenu(true);
    this.audio.pause();
  }

  resumeGame() {
    this.gameState.resume();
    this.hud.showPauseMenu(false);
    this.audio.resume();
  }

  quitToMenu() {
    this.audio.pause(); // 🛑 Stop music
    this.gameState.state = 'MENU';
    this.hud.showPauseMenu(false);
    this.hud.hide();

    // Hide overlays
    if (this.tapOverlay) this.tapOverlay.style.display = 'none';
    if (this.countdownOverlay) this.countdownOverlay.style.display = 'none';

    this.menu.show();
    this.audio.stop(); // Stop game music

    // Reset game elements so they don't persist in background
    this.player.reset();
    this.obstacleFactory.reset();
    this.bonusSystem.reset();
    this.themeManager.reset();
  }

  showShop() {
    this.shop.show();
  }

  showTasks() {
    this.taskUI.show();
  }

  showSettings() {
    this.settingsUI.show();
  }

  applySetting(key, val) {
    console.log(`Setting changed: ${key} = ${val}`);
    if (key === 'tiltEnabled') {
      this.player.useTilt = val;
    } else if (key === 'tiltSensitivity') {
      this.player.tiltSensitivity = val;
    } else if (key === 'musicEnabled') {
      if (val) {
        this.audio.setMusicEnabled(true);
        this.audio.resume();
      } else {
        this.audio.setMusicEnabled(false);
        this.audio.pause();
      }
    } else if (key === 'musicVolume') {
      this.audio.setMusicVolume(val);
    } else if (key === 'soundEnabled') {
      this.audio.setSoundEnabled(val);
    } else if (key === 'soundVolume') {
      // SFX uses audioContext gain, we'd need to add this feature
      // For now, just log
      console.log(`Sound volume set to: ${Math.round(val * 100)}%`);
    } else if (key === 'language') {
      this.refreshAllUI();
    }
    // Haptics checked inside HapticManager
  }

  refreshAllUI() {
    // Clear and force re-render of all UI components
    if (this.menu.container) {
      this.menu.container.remove();
      this.menu.container = null;
      this.menu.show();
    }
    if (this.hud.container) {
      this.hud.container.remove();
      this.hud.pauseMenu.remove();
      this.hud.container = null;
      this.hud.create(); // Re-create HUD
      if (this.gameState.state === 'PLAYING') this.hud.show();
    }
    if (this.shop.container) {
      this.shop.container.remove();
      this.shop.container = null;
    }
    if (this.taskUI.container) {
      this.taskUI.container.remove();
      this.taskUI.container = null;
    }
    if (this.gameOverScreen.container) {
      this.gameOverScreen.container.remove();
      this.gameOverScreen.container = null;
    }
    if (this.tapTextElement) {
      this.tapTextElement.textContent = this.lang.get('TAP_TO_START');
    }
  }

  applySkin(skinId) {
    const skinData = SkinConfig.skins[skinId];
    this.player.setSkin(skinData);

    // Update trail color to match player skin
    if (this.trailRenderer && skinData && skinData.color) {
      this.trailRenderer.setColor(skinData.color);
    }
  }

  startGame() {
    this.gameState.state = 'COUNTDOWN';
    this.gameState.reset();
    this.player.reset();
    this.gemsCollectedThisRun = 0;

    // Apply selected skin and settings
    this.applySkin(this.storage.data.selectedSkin);
    this.player.useTilt = this.storage.data.settings.tiltEnabled;
    this.player.tiltSensitivity = this.storage.data.settings.tiltSensitivity || 1.2;

    this.obstacleFactory.reset();
    this.bonusSystem.reset();
    this.themeManager.reset();
    this.hud.show();
    this.audio.resume(); // Resume audio context for iOS

    // Show Tap to Start instead of countdown directly
    this.tapOverlay.style.display = 'flex';
  }

  startCountdown() {
    // Start background music here (after user interaction)
    if (this.storage.data.settings.musicEnabled) {
      this.audio.startBackgroundMusic('SKY');
    }

    this.countdownOverlay.style.display = 'flex';
    let count = 3;

    const updateCount = () => {
      if (count > 0) {
        this.countdownText.textContent = count;
        this.audio.playCoin();
        count--;
        setTimeout(updateCount, 1000);
      } else {
        this.countdownText.textContent = 'GO!';
        this.audio.playPerfect();
        setTimeout(() => {
          this.countdownOverlay.style.display = 'none';
          this.gameState.state = 'PLAYING';
          this.storage.incrementStat('totalGamesPlayed');
        }, 500);
      }
    };

    updateCount();
  }

  changeTheme(theme) {
    // Future: Apply theme changes
    console.log("Theme changed to:", theme);
  }


  handleCollisionResult(result) {
    if (!result) return;

    if (result.type === 'perfect') {
      this.gameState.addPerfectPass();
      console.log('🎯 PERFECT! Combo: ' + this.gameState.perfectCombo);

      // Show combo UI
      this.hud.showCombo(this.gameState.perfectCombo);

      // Feedback
      this.audio.playPerfect();
      this.haptic.medium();

      // ✨ Particle burst effect
      if (result.ringPosition) {
        this.particleManager.createBurst(result.ringPosition, 30, 0x00d9ff, 2.0);
      }

      // Update daily tasks
      this.dailyTasks.updateProgress('perfect', 1);
      this.dailyTasks.updateProgress('combo', this.gameState.perfectCombo);
    }
    else if (result.type === 'pass') {
      const shouldIncrease = this.gameState.ringPassed();

      this.audio.playPass();
      this.dailyTasks.updateProgress('rings', 1);
      this.storage.incrementStat('totalRingsPassed');

      if (this.gameState.perfectCombo === 0) {
        // Normal pass (no combo active)
      } else {
        // Passed but not perfect - break combo
        this.gameState.breakCombo();
        this.hud.hideCombo();
      }

      if (shouldIncrease) {
        this.obstacleFactory.increaseDifficulty();
        console.log('📈 Difficulty increased!');
      }
    }
    else if (result.type === 'bonus') {
      console.log('✨ Bonus collected: ' + result.bonusType);
      this.bonusSystem.collectBonus(result.bonusType);
    }
    else if (result.type === 'miss') {
      // ⚠️ MISSED A RING - GAME OVER!
      console.log('❌ MISSED RING - Score: ' + this.gameState.score);
      this.audio.playCrash();
      this.haptic.error();
      this.gameState.gameOver();
      this.doGameOver();
    }
    else if (result.type === 'collision') {
      // Check shield
      if (this.bonusSystem.useShield()) {
        console.log('🛡️ Shield saved you!');
        this.audio.playBonus();
        this.haptic.light();
        return; // Shield consumed, no game over
      }

      console.log('💥 GAME OVER - Score: ' + this.gameState.score);
      this.audio.playCrash();
      this.haptic.error();
      this.gameState.gameOver();
      this.doGameOver();
    }
  }



  doGameOver() {
    this.audio.pause(); // 🛑 Stop music
    console.log('💥 GAME OVER - Score: ' + this.gameState.score);
    this.gameState.gameOver();

    // Save data
    const state = this.gameState.getState();
    this.storage.setHighScore(state.score);
    this.storage.addGems(state.gems); // Permanent gem storage

    if (state.maxCombo > this.storage.getStats().longestCombo) {
      this.storage.data.stats.longestCombo = state.maxCombo;
      this.storage.save();
    }

    // Update daily tasks
    this.dailyTasks.updateProgress('score', state.score);
    this.dailyTasks.updateProgress('games', 1);

    this.gameOverScreen.show(
      state.score,
      this.storage.getHighScore(),
      this.storage.getTotalGems(),
      state.maxCombo
    );
  }

  update(dt) {
    // Always render if world is visible
    if (this.gameState.state !== 'MENU') {
      this.sceneManager.render(this.cameraManager.camera);
    }

    if (this.gameState.state !== 'PLAYING') return;

    // Apply time scale for slow motion
    const timeScale = this.bonusSystem.getTimeScale();
    const scaledDt = dt * timeScale;

    // Update Game Logic
    this.player.update(scaledDt);
    this.cameraManager.update(scaledDt);
    this.obstacleFactory.update(this.player.mesh.position.y);
    this.bonusSystem.update(this.player.mesh.position.y, scaledDt);

    // Check Collisions
    const obstacles = this.obstacleFactory.getActiveObstacles();
    const collisionResult = this.collisionSystem.checkCollision(this.player, obstacles);
    this.handleCollisionResult(collisionResult);

    // Check Bonus Collection
    const collected = this.bonusSystem.checkCollection(this.player.mesh.position);
    for (const item of collected) {
      if (item.type === 'gem') {
        this.gameState.addGem();
        this.gemsCollectedThisRun++;
        this.audio.playCoin();
        this.haptic.light();
        this.dailyTasks.updateProgress('gems', 1);

        // ✨ Sparkle effect at gem position
        if (item.item) {
          this.particleManager.createSparkle(item.item.position, 15, 0xffd700);
        }

        console.log('💎 Gem collected! Total: ' + this.gameState.gems);
      } else if (item.type === 'bonus') {
        this.bonusSystem.activateBonus(item.bonusType);
        this.audio.playBonus();
        this.haptic.medium();
        console.log(`✨ ${item.bonusType} activated!`);
      }
    }

    // Update Biome based on score
    if (this.themeManager.updateBiome(this.gameState.score)) {
      // Biome changed - trigger particle wave effect
      const biome = this.themeManager.getCurrentBiome();
      this.particleManager.createWave(biome.ambientColor, 'up');
    }

    // Update Visual Effects
    this.particleManager.update(scaledDt);
    this.trailRenderer.update(scaledDt);

    // Update HUD
    const state = this.gameState.getState();
    this.hud.updateScore(state.score);
    this.hud.updateGems(state.gems);
    this.hud.showShield(this.bonusSystem.activeEffects.shield);
  }

  showRewardedAd() {
    this.ads.showRewarded((success) => {
      if (success) {
        console.log("Adding reward: " + this.gemsCollectedThisRun + " extra gems");
        this.storage.addGems(this.gemsCollectedThisRun);
        this.gameOverScreen.updateStats(
          this.gameState.score,
          this.storage.getHighScore(),
          this.storage.getTotalGems(),
          this.gameState.maxCombo
        );
      }
    });
  }

  restartGame() {
    if (this.gameState.state === 'GAME_OVER') {
      this.ads.showInterstitial();
    }
    // Clean up and restart
    this.startGame();
  }

  showMenu() {
    this.audio.pause(); // 🛑 Stop music (just in case)
    if (this.gameState.state === 'GAME_OVER') {
      this.ads.showInterstitial();
    }
    this.hud.hide();
    this.menu.show();
  }
}

// Start the game
window.game = new Game();

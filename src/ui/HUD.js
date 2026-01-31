export class HUD {
    constructor(language) {
        this.lang = language;
        this.scoreDiv = null;
        this.comboDiv = null;
        this.gemsDiv = null;
        this.shieldIcon = null;
        this.container = null;
    }

    create() {
        // Main HUD container
        this.container = document.createElement('div');
        this.container.id = 'hud';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            pointer-events: none;
            z-index: 1000;
        `;

        // Score display
        this.scoreDiv = document.createElement('div');
        this.scoreDiv.style.cssText = `
            position: absolute;
            top: max(20px, env(safe-area-inset-top, 20px) + 10px);
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: var(--font-size-score, 36px);
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            font-family: Arial, sans-serif;
            white-space: nowrap;
        `;
        this.container.appendChild(this.scoreDiv);

        // Combo display
        this.comboDiv = document.createElement('div');
        this.comboDiv.style.cssText = `
            position: absolute;
            top: max(60px, env(safe-area-inset-top, 20px) + 50px);
            left: 50%;
            transform: translateX(-50%);
            color: #ffaa00;
            font-size: var(--font-size-body, 28px);
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            font-family: Arial, sans-serif;
            display: none;
            white-space: nowrap;
        `;
        this.container.appendChild(this.comboDiv);

        // Gems display
        this.gemsDiv = document.createElement('div');
        this.gemsDiv.style.cssText = `
            position: absolute;
            top: max(20px, env(safe-area-inset-top, 20px) + 10px);
            right: max(20px, env(safe-area-inset-right, 20px) + 10px);
            color: #ffff00;
            font-size: var(--font-size-body, 24px);
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            font-family: Arial, sans-serif;
            white-space: nowrap;
        `;
        this.container.appendChild(this.gemsDiv);

        // Shield indicator
        this.shieldIcon = document.createElement('div');
        this.shieldIcon.textContent = '🛡️';
        this.shieldIcon.style.cssText = `
            position: absolute;
            top: 120px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 48px;
            display: none;
        `;
        this.container.appendChild(this.shieldIcon);

        // Pause Button
        this.pauseBtn = document.createElement('div');
        this.pauseBtn.innerHTML = '⏸️';
        this.pauseBtn.style.cssText = `
            position: absolute;
            top: max(20px, env(safe-area-inset-top, 20px) + 10px);
            left: max(20px, env(safe-area-inset-left, 20px) + 10px);
            font-size: 24px;
            color: white;
            cursor: pointer;
            pointer-events: auto;
            text-shadow: 0 0 10px rgba(0,0,0,0.5);
        `;
        this.container.appendChild(this.pauseBtn);

        // Pause Menu Container
        this.pauseMenu = document.createElement('div');
        this.pauseMenu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            pointer-events: auto;
            backdrop-filter: blur(5px);
        `;

        const title = document.createElement('h2');
        title.textContent = this.lang.get('PAUSED');
        title.style.cssText = `
            color: white;
            font-size: 48px;
            margin-bottom: 40px;
            font-family: Arial, sans-serif;
            text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
        `;
        this.pauseMenu.appendChild(title);

        this.resumeBtn = document.createElement('button');
        this.resumeBtn.textContent = this.lang.get('RESUME');
        this.resumeBtn.className = 'menu-btn primary';
        this.resumeBtn.style.marginBottom = '20px';
        this.pauseMenu.appendChild(this.resumeBtn);

        this.menuBtn = document.createElement('button');
        this.menuBtn.textContent = this.lang.get('MAIN_MENU');
        this.menuBtn.className = 'menu-btn secondary';
        this.pauseMenu.appendChild(this.menuBtn);

        document.body.appendChild(this.pauseMenu);
        document.body.appendChild(this.container);
    }

    setPauseCallbacks(onPause, onResume, onMenu) {
        this.pauseBtn.onclick = onPause;
        this.resumeBtn.onclick = onResume;
        this.menuBtn.onclick = onMenu;
    }

    showPauseMenu(visible) {
        this.pauseMenu.style.display = visible ? 'flex' : 'none';
        this.pauseBtn.style.display = visible ? 'none' : 'block';
    }

    updateScore(score) {
        if (this.scoreDiv) {
            this.scoreDiv.textContent = `${score}`;
        }
    }

    updateGems(gems) {
        if (this.gemsDiv) {
            this.gemsDiv.textContent = `💎 ${gems}`;
        }
    }

    showCombo(combo) {
        if (this.comboDiv) {
            this.comboDiv.textContent = `${this.lang.get('PERFECT')} x${combo}`;
            this.comboDiv.style.display = 'block';
        }
    }

    hideCombo() {
        if (this.comboDiv) {
            this.comboDiv.style.display = 'none';
        }
    }

    showShield(active) {
        if (this.shieldIcon) {
            this.shieldIcon.style.display = active ? 'block' : 'none';
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }
}

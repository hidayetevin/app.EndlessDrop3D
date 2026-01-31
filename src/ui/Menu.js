export class Menu {
    constructor(onStart, onThemeChange, onShop, onTasks, onSettings, language) {
        this.onStart = onStart;
        this.onThemeChange = onThemeChange;
        this.onShop = onShop;
        this.onTasks = onTasks;
        this.onSettings = onSettings;
        this.lang = language;
        this.container = null;
        this.isVisible = false;
    }

    show() {
        if (this.container) {
            this.container.style.display = 'flex';
            this.isVisible = true;
            this.updateHighScore();
            return;
        }

        this.container = document.createElement('div');
        this.container.id = 'main-menu';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            font-family: 'Arial', sans-serif;
        `;

        // Title
        const title = document.createElement('h1');
        title.textContent = 'ENDLESS DROP 3D';
        title.style.cssText = `
            color: white;
            font-size: var(--font-size-h1, 48px);
            margin-bottom: clamp(20px, 5vw, 40px);
            text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
            letter-spacing: 2px;
            padding: 0 var(--spacing-sm, 20px);
        `;
        this.container.appendChild(title);

        // Play Button
        const playBtn = document.createElement('button');
        playBtn.textContent = this.lang.get('PLAY');
        playBtn.className = 'menu-btn primary';
        playBtn.style.margin = '10px';
        playBtn.onclick = () => {
            this.hide();
            this.onStart();
        };
        this.container.appendChild(playBtn);

        // Shop Button
        const shopBtn = document.createElement('button');
        shopBtn.textContent = this.lang.get('SHOP');
        shopBtn.className = 'menu-btn secondary';
        shopBtn.style.cssText += `
            margin: 10px;
            width: clamp(150px, 40vw, 250px);
        `;
        shopBtn.onclick = () => {
            this.onShop();
        };
        this.container.appendChild(shopBtn);

        // Tasks Button
        const tasksBtn = document.createElement('button');
        tasksBtn.textContent = this.lang.get('TASKS');
        tasksBtn.className = 'menu-btn secondary';
        tasksBtn.style.cssText += `
            margin: 10px;
            width: clamp(150px, 40vw, 250px);
        `;
        tasksBtn.onclick = () => {
            this.onTasks();
        };
        this.container.appendChild(tasksBtn);

        // Settings Button
        const settingsBtn = document.createElement('button');
        settingsBtn.textContent = this.lang.get('SETTINGS');
        settingsBtn.className = 'menu-btn secondary';
        settingsBtn.style.cssText += `
            margin: 10px;
            width: clamp(150px, 40vw, 250px);
        `;
        settingsBtn.onclick = () => {
            this.onSettings();
        };
        this.container.appendChild(settingsBtn);

        // High Score Display
        this.scoreLabel = document.createElement('div');
        this.scoreLabel.style.cssText = `
            color: rgba(255,255,255,0.9);
            font-size: var(--font-size-body, 24px);
            margin-top: 30px;
            font-weight: bold;
        `;
        this.container.appendChild(this.scoreLabel);
        this.updateHighScore();

        document.body.appendChild(this.container);
        this.isVisible = true;
    }

    updateHighScore() {
        const highScore = localStorage.getItem('endless_drop_highscore') || 0;
        if (this.scoreLabel) {
            this.scoreLabel.textContent = `${this.lang.get('HIGH_SCORE')}: ${highScore}`;
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
        }
    }
}


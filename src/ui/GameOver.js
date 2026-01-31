export class GameOver {
    constructor(onRestart, onMenu, language, onReward) {
        this.onRestart = onRestart;
        this.onMenu = onMenu;
        this.onReward = onReward;
        this.lang = language;
        this.container = null;
    }

    show(score, highScore, gems, maxCombo) {
        if (this.container) {
            this.updateStats(score, highScore, gems, maxCombo);
            this.container.style.display = 'flex';
            this.resetButtons();
            return;
        }

        this.container = document.createElement('div');
        this.container.id = 'game-over';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            font-family: Arial, sans-serif;
        `;

        // Game Over Title
        const title = document.createElement('h1');
        title.textContent = this.lang.get('GAME_OVER');
        title.style.cssText = `
            color: #ff4444;
            font-size: var(--font-size-h1, 56px);
            margin-bottom: clamp(20px, 4vw, 30px);
            text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
        `;
        this.container.appendChild(title);

        // Stats Container
        const statsContainer = document.createElement('div');
        statsContainer.style.cssText = `
            background: rgba(255,255,255,0.1);
            padding: var(--spacing-md, 30px);
            border-radius: 20px;
            margin-bottom: clamp(10px, 2vw, 15px);
            max-width: 90vw;
            width: 300px;
        `;

        this.scoreLabel = document.createElement('div');
        statsContainer.appendChild(this.scoreLabel);
        this.highScoreLabel = document.createElement('div');
        statsContainer.appendChild(this.highScoreLabel);
        this.gemsLabel = document.createElement('div');
        statsContainer.appendChild(this.gemsLabel);
        this.comboLabel = document.createElement('div');
        statsContainer.appendChild(this.comboLabel);
        this.container.appendChild(statsContainer);

        // 2X Earn Button (Visible first)
        this.rewardBtn = document.createElement('button');
        this.rewardBtn.textContent = this.lang.get('EARN_2X');
        this.rewardBtn.style.cssText = `
            padding: 15px 30px;
            font-size: 20px;
            font-weight: bold;
            background: #ffff00;
            color: black;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            margin-bottom: 20px;
            box-shadow: 0 0 20px rgba(255,255,0,0.5);
            animation: pulse 1.5s infinite;
        `;
        this.rewardBtn.onclick = () => {
            if (window.game && window.game.ads && !window.game.ads.isRewardedReady()) {
                this.rewardBtn.textContent = 'LOADING...';
                this.rewardBtn.style.background = '#666';
                setTimeout(() => {
                    this.rewardBtn.textContent = this.lang.get('EARN_2X');
                    this.rewardBtn.style.background = '#ffff00';
                }, 2000);
                return;
            }
            this.onReward();
            this.rewardBtn.style.display = 'none';
        };
        this.container.appendChild(this.rewardBtn);

        // Normal Buttons Container (Hidden initially)
        this.btnContainer = document.createElement('div');
        this.btnContainer.style.cssText = `
            display: none;
            flex-direction: column;
            align-items: center;
            width: 100%;
        `;

        // Restart Button
        const restartBtn = document.createElement('button');
        restartBtn.textContent = this.lang.get('RESTART');
        restartBtn.className = 'menu-btn primary';
        restartBtn.style.margin = '10px';
        restartBtn.onclick = () => {
            this.hide();
            this.onRestart();
        };
        this.btnContainer.appendChild(restartBtn);

        // Menu Button
        const menuBtn = document.createElement('button');
        menuBtn.textContent = this.lang.get('MAIN_MENU');
        menuBtn.className = 'menu-btn secondary';
        menuBtn.style.margin = '10px';
        menuBtn.onclick = () => {
            this.hide();
            this.onMenu();
        };
        this.btnContainer.appendChild(menuBtn);

        this.container.appendChild(this.btnContainer);

        document.body.appendChild(this.container);
        this.updateStats(score, highScore, gems, maxCombo);
        this.resetButtons();
    }

    resetButtons() {
        this.rewardBtn.style.display = 'block';
        this.btnContainer.style.display = 'none';

        setTimeout(() => {
            this.btnContainer.style.display = 'flex';
        }, 2000);
    }

    updateStats(score, highScore, gems, maxCombo) {
        if (this.scoreLabel) {
            this.scoreLabel.textContent = `${this.lang.get('SCORE')}: ${score}`;
        }
        if (this.highScoreLabel) {
            const isNewRecord = score > highScore;
            this.highScoreLabel.innerHTML = isNewRecord ?
                `<span style="color: #00ff88">🎉 NEW HIGH SCORE</span>` :
                `${this.lang.get('HIGH_SCORE')}: ${highScore}`;
        }
        if (this.gemsLabel) {
            this.gemsLabel.textContent = `💎 ${this.lang.get('TOTAL_GEMS')}: ${gems}`;
        }
        if (this.comboLabel) {
            this.comboLabel.textContent = `${this.lang.get('BEST_COMBO')}: ${maxCombo}`;
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}



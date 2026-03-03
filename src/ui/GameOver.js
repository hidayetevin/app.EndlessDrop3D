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

        const statsContainer = document.createElement('div');
        statsContainer.className = 'game-over-stats';

        this.scoreLabel = document.createElement('div');
        this.scoreLabel.className = 'stat-row';
        statsContainer.appendChild(this.scoreLabel);

        this.highScoreLabel = document.createElement('div');
        this.highScoreLabel.className = 'stat-row';
        statsContainer.appendChild(this.highScoreLabel);

        this.gemsLabel = document.createElement('div');
        this.gemsLabel.className = 'stat-row';
        statsContainer.appendChild(this.gemsLabel);

        this.comboLabel = document.createElement('div');
        this.comboLabel.className = 'stat-row';
        statsContainer.appendChild(this.comboLabel);

        this.container.appendChild(statsContainer);

        // Add dynamic CSS for the new stat rows formatting
        const style = document.createElement('style');
        style.textContent = `
            .game-over-stats {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                padding: clamp(15px, 4vw, 25px);
                margin-bottom: clamp(15px, 4vw, 25px);
                max-width: 90vw;
                width: 320px;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .stat-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: clamp(16px, 4vw, 22px);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: rgba(255,255,255,0.8);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                padding-bottom: 8px;
            }
            .stat-row:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }
            .stat-value {
                font-weight: 800;
                color: #ffffff;
                text-shadow: 0 0 10px rgba(255,255,255,0.5);
                font-size: 1.1em;
            }
            .stat-highlight {
                color: #00ff88;
                text-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
            }
        `;
        document.head.appendChild(style);

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
            this.scoreLabel.innerHTML = `<span>${this.lang.get('SCORE')}</span> <span class="stat-value">${score}</span>`;
        }
        if (this.highScoreLabel) {
            const isNewRecord = score > highScore && score > 0;
            this.highScoreLabel.innerHTML = isNewRecord ?
                `<span style="color: #00ff88; font-weight:bold; width: 100%; text-align: center; text-shadow: 0 0 10px #00ff88;">🎉 NEW HIGH SCORE! 🎉</span>` :
                `<span>${this.lang.get('HIGH_SCORE').toUpperCase()}</span> <span class="stat-value">${highScore}</span>`;
        }
        if (this.gemsLabel) {
            this.gemsLabel.innerHTML = `<span>💎 ${this.lang.get('EARNED_GEMS')}</span> <span class="stat-value stat-highlight">${gems}</span>`;
        }
        if (this.comboLabel) {
            this.comboLabel.innerHTML = `<span>${this.lang.get('BEST_COMBO')}</span> <span class="stat-value">${maxCombo}</span>`;
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}



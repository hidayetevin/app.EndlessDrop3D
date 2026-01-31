import { SkinConfig } from '../core/SkinConfig.js';

export class Shop {
    constructor(storage, onSkinSelect) {
        this.storage = storage;
        this.onSkinSelect = onSkinSelect;
        this.container = null;
        this.isVisible = false;
    }

    show() {
        if (this.container) {
            this.update();
            this.container.style.display = 'flex';
            this.isVisible = true;
            return;
        }

        this.container = document.createElement('div');
        this.container.id = 'shop-menu';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 4000;
            font-family: 'Arial', sans-serif;
            padding-top: max(40px, env(safe-area-inset-top, 40px));
            overflow-y: auto;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            margin-bottom: 30px;
        `;

        const title = document.createElement('h1');
        title.textContent = 'BALL SHOP';
        title.style.cssText = `color: white; font-size: 32px; margin: 0;`;
        header.appendChild(title);

        this.gemDisplay = document.createElement('div');
        this.gemDisplay.style.cssText = `color: #ffff00; font-size: 24px; font-weight: bold;`;
        header.appendChild(this.gemDisplay);

        this.container.appendChild(header);

        // Skin Grid
        this.grid = document.createElement('div');
        this.grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            padding: 20px;
            width: 100%;
            max-width: 500px;
        `;
        this.container.appendChild(this.grid);

        // Back Button
        const backBtn = document.createElement('button');
        backBtn.textContent = 'BACK';
        backBtn.className = 'menu-btn secondary';
        backBtn.style.margin = '40px 0';
        backBtn.onclick = () => this.hide();
        this.container.appendChild(backBtn);

        document.body.appendChild(this.container);

        this.update();
        this.isVisible = true;
    }

    update() {
        if (!this.container) return;

        const gems = this.storage.getTotalGems();
        this.gemDisplay.innerHTML = `💎 ${gems}`;

        this.grid.innerHTML = '';
        const unlocked = this.storage.data.unlockedSkins;
        const selected = this.storage.data.selectedSkin;

        Object.entries(SkinConfig.skins).forEach(([id, skin]) => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
                border: 2px solid ${selected === id ? '#00ffff' : 'transparent'};
                transition: transform 0.2s;
            `;

            // Preview Sphere (CSS based)
            const preview = document.createElement('div');
            const color = '#' + skin.color.toString(16).padStart(6, '0');
            preview.style.cssText = `
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: ${color};
                box-shadow: inset -10px -10px 20px rgba(0,0,0,0.5), 0 0 15px ${skin.emissive ? color : 'transparent'};
                margin-bottom: 10px;
            `;
            card.appendChild(preview);

            const name = document.createElement('div');
            name.textContent = skin.name;
            name.style.cssText = `color: white; font-weight: bold; margin-bottom: 10px; text-align: center;`;
            card.appendChild(name);

            const btn = document.createElement('button');
            btn.style.cssText = `
                width: 100%;
                padding: 8px;
                border: none;
                border-radius: 5px;
                font-weight: bold;
                cursor: pointer;
            `;

            if (selected === id) {
                btn.textContent = 'SELECTED';
                btn.style.background = '#00ff88';
                btn.style.color = 'black';
                btn.disabled = true;
            } else if (unlocked.includes(id)) {
                btn.textContent = 'SELECT';
                btn.style.background = 'white';
                btn.onclick = () => {
                    this.storage.setSelectedSkin(id);
                    this.onSkinSelect(id);
                    this.update();
                };
            } else {
                btn.textContent = `💎 ${skin.price}`;
                btn.style.background = gems >= skin.price ? '#ffff00' : '#444';
                btn.style.color = 'black';
                btn.onclick = () => {
                    if (this.storage.spendGems(skin.price)) {
                        this.storage.unlockSkin(id);
                        this.storage.setSelectedSkin(id);
                        this.onSkinSelect(id);
                        this.update();
                    } else {
                        // Not enough gems effect
                        card.style.transform = 'translateX(5px)';
                        setTimeout(() => card.style.transform = 'translateX(-5px)', 50);
                        setTimeout(() => card.style.transform = 'translateX(0)', 100);
                    }
                };
            }
            card.appendChild(btn);
            this.grid.appendChild(card);
        });
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
        }
    }
}

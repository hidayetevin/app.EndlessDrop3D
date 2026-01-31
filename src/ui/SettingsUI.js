export class SettingsUI {
    constructor(storage, onSettingChange) {
        this.storage = storage;
        this.onSettingChange = onSettingChange;
        this.container = null;
        this.isVisible = false;
    }

    show() {
        if (this.container) {
            this.container.style.display = 'flex';
            this.isVisible = true;
            return;
        }

        this.container = document.createElement('div');
        this.container.id = 'settings-menu';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 5000;
            font-family: 'Arial', sans-serif;
            padding-top: max(40px, env(safe-area-inset-top, 40px));
        `;

        const title = document.createElement('h1');
        title.textContent = 'SETTINGS';
        title.style.cssText = `color: white; font-size: 32px; margin-bottom: 50px; letter-spacing: 2px;`;
        this.container.appendChild(title);

        this.optionsList = document.createElement('div');
        this.optionsList.style.cssText = `
            width: 80%;
            max-width: 400px;
            display: flex;
            flex-direction: column;
            gap: 25px;
        `;
        this.container.appendChild(this.optionsList);

        // Settings items
        this.addToggle('Music', 'musicEnabled');
        this.addToggle('Sound FX', 'soundEnabled');
        this.addToggle('Haptics', 'hapticEnabled');
        this.addToggle('Tilt Control', 'tiltEnabled');

        const backBtn = document.createElement('button');
        backBtn.textContent = 'BACK';
        backBtn.className = 'menu-btn secondary';
        backBtn.style.marginTop = '60px';
        backBtn.onclick = () => this.hide();
        this.container.appendChild(backBtn);

        document.body.appendChild(this.container);
        this.isVisible = true;
    }

    addToggle(label, key) {
        const row = document.createElement('div');
        row.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        `;

        const name = document.createElement('div');
        name.textContent = label;
        name.style.cssText = `color: white; font-size: 20px; font-weight: bold;`;
        row.appendChild(name);

        const toggle = document.createElement('div');
        const isActive = this.storage.data.settings[key] || false;

        toggle.style.cssText = `
            width: 60px;
            height: 30px;
            background: ${isActive ? '#00ff88' : '#444'};
            border-radius: 15px;
            position: relative;
            cursor: pointer;
            transition: background 0.3s;
        `;

        const knob = document.createElement('div');
        knob.style.cssText = `
            width: 24px;
            height: 24px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 3px;
            left: ${isActive ? '33px' : '3px'};
            transition: left 0.3s;
        `;
        toggle.appendChild(knob);

        toggle.onclick = () => {
            const current = this.storage.data.settings[key];
            const newValue = !current;
            this.storage.updateSetting(key, newValue);

            toggle.style.background = newValue ? '#00ff88' : '#444';
            knob.style.left = newValue ? '33px' : '3px';

            if (this.onSettingChange) {
                this.onSettingChange(key, newValue);
            }
        };

        row.appendChild(toggle);
        this.optionsList.appendChild(row);
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
        }
    }
}

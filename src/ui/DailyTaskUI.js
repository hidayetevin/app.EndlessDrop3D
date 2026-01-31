export class DailyTaskUI {
    constructor(storage, dailyTaskManager) {
        this.storage = storage;
        this.taskManager = dailyTaskManager;
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
        this.container.id = 'tasks-menu';
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
            z-index: 4500;
            font-family: 'Arial', sans-serif;
            padding-top: max(40px, env(safe-area-inset-top, 40px));
        `;

        const title = document.createElement('h1');
        title.textContent = 'DAILY MISSIONS';
        title.style.cssText = `color: white; font-size: 28px; margin-bottom: 30px; letter-spacing: 2px;`;
        this.container.appendChild(title);

        this.taskList = document.createElement('div');
        this.taskList.style.cssText = `
            width: 90%;
            max-width: 500px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        `;
        this.container.appendChild(this.taskList);

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

        this.taskList.innerHTML = '';
        const tasks = this.taskManager.getTasks();
        const completedSaved = this.storage.data.dailyTasks.completedToday;

        tasks.forEach(task => {
            const isClaimed = completedSaved.includes(task.id);
            const canClaim = task.completed && !isClaimed;

            const item = document.createElement('div');
            item.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                border-left: 5px solid ${task.completed ? '#00ff88' : '#666'};
            `;

            const info = document.createElement('div');
            info.style.cssText = `display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;`;

            const textContent = document.createElement('div');
            textContent.innerHTML = `<div style="color: white; font-weight: bold;">${task.desc}</div>
                                     <div style="color: #aaa; font-size: 14px;">Reward: 💎 ${task.reward}</div>`;
            info.appendChild(textContent);

            if (isClaimed) {
                const badge = document.createElement('div');
                badge.textContent = '✅ CLAIMED';
                badge.style.cssText = `color: #00ff88; font-size: 12px; font-weight: bold;`;
                info.appendChild(badge);
            }

            item.appendChild(info);

            // Progress Bar
            const progressRow = document.createElement('div');
            progressRow.style.cssText = `display: flex; align-items: center; gap: 10px;`;

            const barBg = document.createElement('div');
            barBg.style.cssText = `flex: 1; height: 8px; background: #333; border-radius: 4px; overflow: hidden;`;

            const barFill = document.createElement('div');
            const percent = (task.progress / task.target) * 100;
            barFill.style.cssText = `width: ${percent}%; height: 100%; background: ${task.completed ? '#00ff88' : '#00d9ff'}; transition: width 0.3s;`;
            barBg.appendChild(barFill);
            progressRow.appendChild(barBg);

            const count = document.createElement('div');
            count.textContent = `${task.progress}/${task.target}`;
            count.style.cssText = `color: white; font-size: 12px; min-width: 40px; text-align: right;`;
            progressRow.appendChild(count);

            item.appendChild(progressRow);

            if (canClaim) {
                const claimBtn = document.createElement('button');
                claimBtn.textContent = 'CLAIM REWARD';
                claimBtn.style.cssText = `
                    margin-top: 15px;
                    padding: 8px;
                    background: #ffff00;
                    border: none;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    color: black;
                `;
                claimBtn.onclick = () => {
                    this.taskManager.claimReward(task.id);
                    this.update();
                };
                item.appendChild(claimBtn);
            }

            this.taskList.appendChild(item);
        });
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
        }
    }
}

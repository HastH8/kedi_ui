class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notification-container');
        this.notifications = new Map();
        this.counter = 0;
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    handleMessage(event) {
        const data = event.data;
        
        if (data.type === 'notification') {
            this.showNotification(data);
        }
    }

    createNotificationElement(data) {
        const { type = 'info', title, message, duration = 5000, icon = null, gameTime } = data;
        const id = `notification-${++this.counter}`;
        
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification ${type}`;
        notificationEl.id = id;
        
        const time = gameTime || new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        notificationEl.innerHTML = `
            <div class="notification-app-icon">
                ${icon ? `<img src="${icon}" alt="">` : ''}
            </div>
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-title">${title}</div>
                    <div class="notification-time">${time}</div>
                </div>
                <div class="notification-message">${message}</div>
            </div>
        `;

        return { element: notificationEl, duration };
    }

    showNotification(data) {
        const { element, duration } = this.createNotificationElement(data);
        this.container.appendChild(element);
        requestAnimationFrame(() => {
            element.classList.add('show');
        });
        const timer = setTimeout(() => {
            this.closeNotification(element.id);
        }, duration);
        this.notifications.set(element.id, { element, timer });
    }

    closeNotification(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        const { element, timer } = notification;
        clearTimeout(timer);
        
        element.classList.remove('show');
        element.addEventListener('transitionend', () => {
            element.remove();
            this.notifications.delete(id);
        });
    }
}

const notificationSystem = new NotificationSystem();
window.showNotification = (data) => {
    notificationSystem.showNotification({
        type: data.type || 'info',
        title: data.title || 'Notification Title',
        message: data.message || 'This is a test notification message.',
        duration: data.duration || 5000,
        icon: data.icon || null
    });
}; 

class TextUISystem {
    constructor() {
        this.container = document.getElementById('textui-container');
        this.currentTextUI = null;
        this.hideTimer = null;
        window.addEventListener('message', this.handleMessage.bind(this));
    }
    handleMessage(event) {
        const data = event.data;
        
        if (data.type === 'textui') {
            switch (data.action) {
                case 'show':
                    this.showTextUI(data);
                    break;
                case 'hide':
                    this.hideTextUI();
                    break;
                case 'update':
                    this.updateTextUI(data);
                    break;
            }
        }
    }

    createTextUIElement(data) {
        const { key, message } = data;
        
        const textUIEl = document.createElement('div');
        textUIEl.className = 'textui';
        
        textUIEl.innerHTML = `
            <div class="textui-chrome">
                <div class="textui-key">${key}</div>
                <div class="textui-message">${message}</div>
            </div>
        `;
    
        return textUIEl;
    }
    showTextUI(data) {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        this.hideTextUI();
        const element = this.createTextUIElement(data);
        this.container.appendChild(element);
        requestAnimationFrame(() => {
            element.classList.add('show');
        });
        this.currentTextUI = element;
        if (data.isDisabled) {
            element.classList.add('disabled');
        }
        
        if (!data.canInteract) {
            element.classList.add('no-interact');
        }
        if (data.duration) {
            this.hideTimer = setTimeout(() => {
                this.hideTextUI();
            }, data.duration);
        }
    }

    updateTextUI(data) {
        if (!this.currentTextUI) {
            this.showTextUI(data);
            return;
        }

        const titleEl = this.currentTextUI.querySelector('.textui-title');
        const messageEl = this.currentTextUI.querySelector('.textui-message');
        
        if (data.title) titleEl.textContent = data.title;
        if (data.message) messageEl.textContent = data.message;
    }

    hideTextUI() {
        if (this.currentTextUI) {
            this.currentTextUI.classList.remove('show');
            this.currentTextUI.addEventListener('transitionend', () => {
                this.currentTextUI.remove();
                this.currentTextUI = null;
            });
        }
    }
}


const textUISystem = new TextUISystem();
window.showTextUI = (data) => {
    textUISystem.showTextUI({
        key: data.key || 'E',
        message: data.message || 'Interact'
    });
};

window.hideTextUI = () => {
    textUISystem.hideTextUI();
};


class ProgressBarSystem {
    constructor() {
        this.container = document.getElementById('progress-container');
        this.progressBars = new Map();
        this.counter = 0;
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    handleMessage(event) {
        const data = event.data;
        
        if (data.type === 'progress') {
            switch (data.action) {
                case 'start':
                    this.createProgressBar(data);
                    break;
                case 'update':
                    this.updateProgress(data);
                    break;
                case 'end':
                    this.endProgress(data.id);
                    break;
                case 'cancel':
                    this.cancelProgress(data.id);
                    break;
            }
        }
    }
    cancelProgress(id) {
        const progressBar = this.progressBars.get(id);
        if (!progressBar) return;
    
        const { element, animationFrame } = progressBar;
        
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    
        element.classList.add('cancelled');
        setTimeout(() => {
            element.classList.remove('show');
            element.addEventListener('transitionend', () => {
                element.remove();
                this.progressBars.delete(id);
            });
        }, 500);
    }
    createProgressBar(data) {
        const { label = 'Loading...', duration = 0, id = `progress-${++this.counter}` } = data;
        
        const progressEl = document.createElement('div');
        progressEl.className = 'progress-bar';
        progressEl.id = id;
        
        progressEl.innerHTML = `
            <div class="progress-chrome">
                <div class="progress-status">${label}</div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            </div>
        `;

        this.container.appendChild(progressEl);
        requestAnimationFrame(() => {
            progressEl.classList.add('show');
        });
        this.progressBars.set(id, {
            element: progressEl,
            startTime: Date.now(),
            duration: duration
        });
        if (duration > 0) {
            this.startAutoProgress(id, duration);
        }

        return id;
    }

    updateProgress(data) {
        const { id, progress, label } = data;
        const progressBar = this.progressBars.get(id);
        
        if (!progressBar) return;

        const fillEl = progressBar.element.querySelector('.progress-fill');
        const statusEl = progressBar.element.querySelector('.progress-status');
        
        if (fillEl) {
            fillEl.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
        
        if (label && statusEl) {
            statusEl.textContent = label;
        }
    }

    startAutoProgress(id, duration) {
        const progressBar = this.progressBars.get(id);
        if (!progressBar) return;

        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = (elapsed / duration) * 100;

            if (progress < 100) {
                this.updateProgress({ id, progress });
                progressBar.animationFrame = requestAnimationFrame(animate);
            } else {
                this.updateProgress({ id, progress: 100 });
                this.endProgress(id);
            }
        };

        progressBar.animationFrame = requestAnimationFrame(animate);
    }

    endProgress(id) {
        const progressBar = this.progressBars.get(id);
        if (!progressBar) return;

        const { element, animationFrame } = progressBar;
        
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        element.classList.remove('show');
        element.addEventListener('transitionend', () => {
            element.remove();
            this.progressBars.delete(id);
        });
    }
}


const progressBarSystem = new ProgressBarSystem();
window.showProgress = (data) => {
    const id = progressBarSystem.createProgressBar({
        label: data.label || 'Loading...',
        duration: data.duration || 0
    });

    if (!data.duration) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                progressBarSystem.updateProgress({ id, progress });
                setTimeout(() => progressBarSystem.endProgress(id), 500);
            } else {
                progressBarSystem.updateProgress({ id, progress });
            }
        }, 500);
    }
}; 
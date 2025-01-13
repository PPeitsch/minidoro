// DOM elements
const timerDisplay = document.getElementById('timer');
const controlBtn = document.getElementById('controlBtn');
const startStopBtn = document.getElementById('startStopBtn');
const timerTabs = document.querySelectorAll('.timer-tab');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeButtons = document.querySelectorAll('.close-modal');
const saveSettingsBtn = document.getElementById('saveSettings');
const themeColorInput = document.getElementById('themeColor');
const invertLayoutCheckbox = document.getElementById('invertLayout');

// Timer variables
let timer;
let timeLeft;
let isRunning = false;
let currentMode = 'pomodoro';

// Time configurations (in minutes)
const TIMES = {
    pomodoro: 25,
    'short break': 5,
    'long break': 15
};

// Notification settings
let notificationSettings = {
    sound: true,
    desktop: true,
    tabTitle: true,
    volume: 0.5
};

// Initialize timer
function initTimer() {
    timeLeft = TIMES[currentMode] * 60;
    updateDisplay();
}

// Update timer display
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (!document.hidden) {
        updateTabTitle();
    }
}

// Toggle timer (start/pause)
function toggleTimer() {
    if (!isRunning) {
        startTimer();
    } else {
        pauseTimer();
    }
}

// Start timer
function startTimer() {
    if (timeLeft <= 0) {
        timeLeft = TIMES[currentMode] * 60;
    }
    isRunning = true;
    updateControls('pause');

    timer = setInterval(async () => {
        timeLeft--;
        updateDisplay();
        updateTabTitle();

        if (timeLeft <= 0) {
            clearInterval(timer);
            await handleTimerComplete();
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    updateControls('start');
}

// Update control buttons
function updateControls(state) {
    const isStart = state === 'start';
    controlBtn.textContent = isStart ? 'START' : 'PAUSE';
    startStopBtn.querySelector('svg').innerHTML = isStart
        ? '<path d="M8 5v14l11-7z"/>'
        : '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
}

// Handle timer completion
async function handleTimerComplete() {
    isRunning = false;
    updateControls('start');

    // Play sound notification
    if (notificationSettings.sound) {
        await playNotificationSound();
    }

    // Show desktop notification
    if (notificationSettings.desktop && Notification.permission === 'granted') {
        showDesktopNotification();
    }

    // Update tab title
    if (notificationSettings.tabTitle) {
        updateTabTitle(true);
    }

    // Visual feedback
    showVisualNotification();

    // Reset timer
    timeLeft = TIMES[currentMode] * 60;
    updateDisplay();
}

// Play notification sound
async function playNotificationSound() {
    const audio = new Audio('/static/notification.mp3');
    audio.volume = notificationSettings.volume;
    try {
        await audio.play();
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
}

// Show desktop notification
function showDesktopNotification() {
    const notification = new Notification('Minidoro Timer Complete', {
        body: `${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} session completed!`,
        icon: '/favicon.ico',
        silent: true
    });

    notification.onclick = () => {
        window.focus();
        notification.close();
    };
}

// Update tab title
function updateTabTitle(completed = false) {
    if (completed) {
        document.title = `[DONE] Minidoro - ${currentMode}`;
        setTimeout(() => {
            document.title = `${timerDisplay.textContent} - Minidoro`;
        }, 5000);
    } else {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.title = `${time} - Minidoro${isRunning ? ' (Running)' : ''}`;
    }
}

// Show visual notification
function showVisualNotification() {
    const timerContainer = document.querySelector('.timer-container');
    timerContainer.classList.add('complete', 'timer-complete');

    setTimeout(() => {
        timerContainer.classList.remove('complete', 'timer-complete');
    }, 2000);
}

// Load settings from localStorage
function loadSettings() {
    const defaultSettings = {
        themeColor: '#2b5d7e',
        invertLayout: false,
        notifications: {
            sound: true,
            desktop: true,
            tabTitle: true,
            volume: 0.5
        }
    };

    try {
        const settings = JSON.parse(localStorage.getItem('minidoroSettings')) || defaultSettings;

        // Apply theme settings
        themeColorInput.value = settings.themeColor;
        invertLayoutCheckbox.checked = settings.invertLayout;
        document.documentElement.style.setProperty('--theme-color', settings.themeColor);
        document.querySelector('.container').classList.toggle('inverted', settings.invertLayout);

        // Apply notification settings
        notificationSettings = settings.notifications || defaultSettings.notifications;
        document.getElementById('soundEnabled').checked = notificationSettings.sound;
        document.getElementById('notificationsEnabled').checked = notificationSettings.desktop;
        document.getElementById('tabTitleEnabled').checked = notificationSettings.tabTitle;
        document.getElementById('soundVolume').value = notificationSettings.volume * 100;
    } catch (e) {
        console.error('Error loading settings:', e);
    }
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        themeColor: themeColorInput.value,
        invertLayout: invertLayoutCheckbox.checked,
        notifications: notificationSettings
    };

    localStorage.setItem('minidoroSettings', JSON.stringify(settings));

    // Apply settings
    document.documentElement.style.setProperty('--theme-color', settings.themeColor);
    document.querySelector('.container').classList.toggle('inverted', settings.invertLayout);
}

// Request notification permission
async function requestNotificationPermission() {
    if (Notification.permission === 'default') {
        try {
            const permission = await Notification.requestPermission();
            notificationSettings.desktop = permission === 'granted';
            document.getElementById('notificationsEnabled').checked = notificationSettings.desktop;
            saveSettings();
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            notificationSettings.desktop = false;
            document.getElementById('notificationsEnabled').checked = false;
            saveSettings();
        }
    }
}

// Switch timer mode
function switchMode(mode) {
    if (isRunning) {
        pauseTimer();
    }
    currentMode = mode.toLowerCase();
    timeLeft = TIMES[currentMode] * 60;
    updateDisplay();
}

// Event Listeners
controlBtn.addEventListener('click', toggleTimer);
startStopBtn.addEventListener('click', toggleTimer);

timerTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        timerTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        switchMode(e.target.textContent);
    });
});

settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'block';
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
});

saveSettingsBtn.addEventListener('click', saveSettings);

// Notification settings event listeners
document.getElementById('soundEnabled').addEventListener('change', (e) => {
    notificationSettings.sound = e.target.checked;
    saveSettings();
});

document.getElementById('notificationsEnabled').addEventListener('change', async (e) => {
    notificationSettings.desktop = e.target.checked;
    if (e.target.checked) {
        await requestNotificationPermission();
    }
    saveSettings();
});

document.getElementById('tabTitleEnabled').addEventListener('change', (e) => {
    notificationSettings.tabTitle = e.target.checked;
    saveSettings();
});

document.getElementById('soundVolume').addEventListener('input', (e) => {
    notificationSettings.volume = e.target.value / 100;
    saveSettings();
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
    }
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRunning) {
        document.title = `${timerDisplay.textContent} - Minidoro (Running)`;
    } else {
        updateDisplay();
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    loadSettings();
    initTimer();
    await requestNotificationPermission();
});
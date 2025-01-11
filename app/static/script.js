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
    document.title = `${timerDisplay.textContent} - Minidoro`;
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

    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimerComplete();
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
function handleTimerComplete() {
    isRunning = false;
    updateControls('start');
    playNotification();
    timeLeft = TIMES[currentMode] * 60;
    updateDisplay();
}

// Play notification
function playNotification() {
    // Request notification permission if not granted
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }

    // Show notification if permitted
    if (Notification.permission === 'granted') {
        new Notification('Minidoro', {
            body: `${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} completed!`,
            icon: '/favicon.ico'
        });
    }

    // Play sound
    const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RSU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwPj4+Pj4+TExMTExZWVlZWVlnZ2dnZ3V1dXV1dYODg4ODkZGRkZGRn5+fn5+frKysrKy6urq6urrIyMjIyNbW1tbW1uTk5OTk8vLy8vLy//////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQKAAAAAAAAHjOZTf9/AAAAAAAAAAAAAAAAAAAAAP/7UMQAAAesTXWUEQBD+CtzK9QBTgnI3g5q7gNBYZC+2TRSL3p0LQxFvcjgwykz/7AsF7EglCvBxoZCE8QCDBB4kDEEgnncWx/aXxf/u0AQFkhFT/0Scp0SLv/z8tT//1qWoGQORv/7UsQJgAeYTNzdaAAIzwmba4wwAQQFgIcbG9o+T0tLqb/P8L6bq6m6ur9Laaqwk3/+tpaQAoEHOGZJJKkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk//tSxCMABPBO012xgAi8ipn9xhgBkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk//tSxFQABvWfVbmWAADeCyq3MwAAkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
    audio.play();
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

// Save settings to localStorage
function saveSettings() {
    const settings = {
        themeColor: themeColorInput.value,
        invertLayout: invertLayoutCheckbox.checked
    };
    localStorage.setItem('minidoroSettings', JSON.stringify(settings));
    applySettings(settings);
    settingsModal.style.display = 'none';
}

// Load settings from localStorage
function loadSettings() {
    const defaultSettings = {
        themeColor: '#2b5d7e',
        invertLayout: false
    };

    try {
        const settings = JSON.parse(localStorage.getItem('minidoroSettings')) || defaultSettings;
        themeColorInput.value = settings.themeColor;
        invertLayoutCheckbox.checked = settings.invertLayout;
        applySettings(settings);
    } catch (e) {
        console.error('Error loading settings:', e);
        applySettings(defaultSettings);
    }
}

// Apply settings to the UI
function applySettings(settings) {
    document.documentElement.style.setProperty('--theme-color', settings.themeColor);
    document.querySelector('.container').classList.toggle('inverted', settings.invertLayout);
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

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initTimer();
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
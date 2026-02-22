// ==========================================
// MODULE TIMER
// Minimalist Pomodoro / Focus Timer
// ==========================================

const TimerLogic = {
    elements: {},
    timeLeft: 25 * 60, // 25 minutes in seconds
    timerInterval: null,
    isRunning: false,
    defaultTime: 25 * 60,

    init: function () {
        this.cacheDOM();
        this.bindEvents();
        this.updateDisplay();

        // Align timer to background particles sphere center (50vh)
        this.alignToSphere();
    },

    cacheDOM: function () {
        this.elements = {
            minInput: document.getElementById('timerMinInput'),
            secInput: document.getElementById('timerSecInput'),
            startBtn: document.getElementById('startTimerBtn'),
            resetBtn: document.getElementById('resetTimerBtn'),
            durationBtns: document.querySelectorAll('.duration-btn')
        };
    },

    bindEvents: function () {
        const el = this.elements;
        if (el.startBtn) el.startBtn.addEventListener('click', () => this.toggleTimer());
        if (el.resetBtn) el.resetBtn.addEventListener('click', () => this.resetTimer());

        if (el.durationBtns) {
            el.durationBtns.forEach(btn => {
                btn.addEventListener('click', (e) => this.setDurationFromPreset(e));
            });
        }

        // Listen for manual input changes to update default time
        if (el.minInput) el.minInput.addEventListener('change', () => this.updateDefaultFromInputs());
        if (el.secInput) el.secInput.addEventListener('change', () => this.updateDefaultFromInputs());

        // Keep timer perfectly centered over background sphere on resize
        window.addEventListener('resize', () => {
            // Small timeout to allow carousel to adjust before reading relative positions
            setTimeout(() => this.alignToSphere(), 50);
        });
    },

    alignToSphere: function () {
        const wrapper = document.querySelector('.timer-circle-wrapper');
        const panel = document.getElementById('timer-panel');
        if (wrapper && panel) {
            // Center of the canvas sphere is at exactly window.innerHeight / 2
            const targetViewportCenterY = window.innerHeight / 2;
            // The top of the timer panel relative to the viewport
            const panelRect = panel.getBoundingClientRect();

            // Calculate where 50vh is relative to the top of the timer-panel
            const relativeY = targetViewportCenterY - panelRect.top;

            wrapper.style.position = 'absolute';
            wrapper.style.top = relativeY + 'px';
            wrapper.style.left = '50%';
            wrapper.style.transform = 'translate(-50%, -50%)';
        }
    },

    setDurationFromPreset: function (e) {
        if (this.isRunning) return; // Don't change duration while running

        // Clear success state if applying new duration
        this.clearSuccessState();

        // Update active button styling
        this.elements.durationBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        // Parse time from data attribute (minutes)
        const minutes = parseInt(e.target.getAttribute('data-time'), 10);
        this.defaultTime = minutes * 60;
        this.timeLeft = this.defaultTime;
        this.updateDisplay();
    },

    updateDefaultFromInputs: function () {
        if (this.isRunning) return;

        // Clear success state if typing new time
        this.clearSuccessState();

        let m = parseInt(this.elements.minInput.value) || 0;
        let s = parseInt(this.elements.secInput.value) || 0;

        // basic bounds checking
        if (m < 0) m = 0;
        if (m > 99) m = 99;
        if (s < 0) s = 0;
        if (s > 59) s = 59;

        // Remove active state from presets since it's custom now
        this.elements.durationBtns.forEach(btn => btn.classList.remove('active'));

        this.elements.minInput.value = m.toString().padStart(2, '0');
        this.elements.secInput.value = s.toString().padStart(2, '0');

        this.defaultTime = (m * 60) + s;
        this.timeLeft = this.defaultTime;
    },

    toggleTimer: function () {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    },

    startTimer: function () {
        if (this.isRunning) return;

        // Grab latest input values right before starting
        this.updateDefaultFromInputs();

        if (this.timeLeft <= 0) return; // Don't start if 0

        this.isRunning = true;
        this.elements.startBtn.innerText = "Pause";
        this.elements.startBtn.classList.add('btn-pause');
        this.elements.startBtn.style.background = "";
        this.elements.startBtn.style.color = "";

        // Lock inputs
        this.elements.minInput.readOnly = true;
        this.elements.secInput.readOnly = true;

        this.timerInterval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateDisplay();
            } else {
                this.timerFinished();
            }
        }, 1000);
    },

    pauseTimer: function () {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.elements.startBtn.innerText = "Resume";
        this.elements.startBtn.classList.remove('btn-pause');
        this.elements.startBtn.style.background = "";
        this.elements.startBtn.style.color = "";

        // Unlock inputs on pause
        this.elements.minInput.readOnly = false;
        this.elements.secInput.readOnly = false;
    },

    resetTimer: function () {
        this.pauseTimer();
        this.timeLeft = this.defaultTime;
        this.updateDisplay();
        this.elements.startBtn.innerText = "Start";
        this.elements.startBtn.classList.remove('btn-pause');
        this.elements.startBtn.style.background = "";
        this.elements.startBtn.style.color = "";

        this.clearSuccessState();
    },

    clearSuccessState: function () {
        const container = document.querySelector('.timer-container');
        if (container) container.classList.remove('success');
        if (document.body.classList.contains('dark-mode') && typeof ParticleSystem !== 'undefined') {
            ParticleSystem.setTheme('dark');
        }
    },

    timerFinished: function () {
        this.pauseTimer();
        this.updateDisplay();

        // Apply Success State visually!
        const container = document.querySelector('.timer-container');
        if (container) container.classList.add('success');

        if (typeof ParticleSystem !== 'undefined') {
            ParticleSystem.setTheme('success');
        }

        // We removed the blocking alert popup here.
        // The timer will stay in the green "success" state until the user
        // clicks 'Reset' or selects a new duration.
    },

    updateDisplay: function () {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;

        if (this.elements.minInput && this.elements.secInput) {
            this.elements.minInput.value = minutes.toString().padStart(2, '0');
            this.elements.secInput.value = seconds.toString().padStart(2, '0');
        }
    }
};

// Auto-init if DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    TimerLogic.init();
});


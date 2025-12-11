// ==========================================
// MAIN CONTROLLER
// Orchestrates: Auth -> Init -> Navigation -> UI
// Entry point for the application.
// ==========================================

let db;

// ==========================================
// 1. APP INITIALIZATION FLOW
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Start Authentication Flow
    // When Auth succeeds, it calls initApp(config)
    Auth.init((config) => initApp(config));
});

/**
 * Initializes the application after successful authentication.
 * @param {Object} decryptedConfig - Firebase configuration object.
 */
function initApp(decryptedConfig) {
    try {
        // 1. Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(decryptedConfig);
        }
        db = firebase.firestore();

        // 2. Logic Modules
        if (typeof DailyLogic !== 'undefined') DailyLogic.init(db);
        if (typeof YearlyLogic !== 'undefined') YearlyLogic.init(db);
        if (typeof AchievementsLogic !== 'undefined') AchievementsLogic.init(db);

        // 3. Visuals
        ParticleSystem.init();

        // 4. Navigation
        initNavigation();

    } catch (e) {
        console.error("Init Error:", e);
        // Fallback for critical errors
        alert("Critical Error initializing app. Check console.");
    }
}

// ==========================================
// 2. NAVIGATION LOGIC (Global Coordinator)
// ==========================================

/**
 * Sets up global navigation listeners and arrow delegation.
 */
function initNavigation() {
    const toggleBtn = document.getElementById('period-toggle');

    // Default State
    toggleBtn.classList.add('text-daily');

    // --- MAIN TOGGLE (Daily <-> Yearly) ---
    toggleBtn.addEventListener('click', () => {
        // Prevent spam clicks during animation
        if (toggleBtn.classList.contains('flip-out') || toggleBtn.classList.contains('flip-in')) return;

        // Determine current state based on active panel
        const tasksPanel = document.getElementById('tasks-panel');
        const isCurrentlyDaily = tasksPanel.classList.contains('active-panel');

        // Animate
        toggleBtn.classList.add('flip-out');

        setTimeout(() => {
            if (isCurrentlyDaily) {
                switchToYearly();
            } else {
                switchToDaily();
            }

            // Animation Reset
            toggleBtn.classList.remove('flip-out');
            toggleBtn.classList.add('flip-in');
            setTimeout(() => toggleBtn.classList.remove('flip-in'), 250);

        }, 250);
    });

    // --- DELEGATION FOR DYNAMIC ARROWS ---
    // Achievements -> Yearly (Up Arrow)
    // Yearly -> Achievements (Down Arrow) is handled in YearlyLogic or below if static

    // We attach global listeners for the navigation arrows to avoid losing them on re-renders
    document.body.addEventListener('click', (e) => {
        // Down Arrow (Yearly -> Achievements)
        if (e.target.closest('#nav-arrow-down')) {
            switchToAchievements();
        }

        // Up Arrow (Achievements -> Yearly)
        if (e.target.closest('#nav-arrow-up')) {
            switchToYearlyFromAchievements();
        }
    });
}

// --- NAVIGATION ACTIONS ---
// These functions manage the DOM classes to switch between panels.

function switchToDaily() {
    const tasksPanel = document.getElementById('tasks-panel');
    const summaryPanel = document.getElementById('summary-panel');
    const toggleBtn = document.getElementById('period-toggle');

    // Logic
    if (typeof DailyLogic !== 'undefined') DailyLogic.resetToToday();

    // UI
    toggleBtn.innerText = "Daily";
    toggleBtn.classList.replace('text-yearly', 'text-daily');

    summaryPanel.classList.remove('active-panel');
    summaryPanel.classList.add('hidden-panel');

    tasksPanel.classList.remove('hidden-panel');
    tasksPanel.classList.add('active-panel');

    // Ensure Title is correct
    if (typeof DailyLogic !== 'undefined') DailyLogic.updateTitle();
}

function switchToYearly() {
    const tasksPanel = document.getElementById('tasks-panel');
    const summaryPanel = document.getElementById('summary-panel');
    const toggleBtn = document.getElementById('period-toggle');

    // Logic
    if (typeof YearlyLogic !== 'undefined') YearlyLogic.renderSummary();

    // UI
    toggleBtn.innerText = "Yearly";
    toggleBtn.classList.replace('text-daily', 'text-yearly');

    tasksPanel.classList.remove('active-panel');
    tasksPanel.classList.add('hidden-panel');

    summaryPanel.classList.remove('hidden-panel');
    summaryPanel.classList.add('active-panel');
}

function switchToAchievements() {
    const summaryPanel = document.getElementById('summary-panel');
    const achievementsPanel = document.getElementById('achievements-panel');
    const heroTitle = document.querySelector('.hero-title');
    const staticText = document.querySelector('.static-text');
    const periodToggle = document.getElementById('period-toggle');

    // UI Switch
    summaryPanel.classList.add('hidden-panel');
    summaryPanel.classList.remove('active-panel');

    achievementsPanel.classList.remove('hidden-panel');
    achievementsPanel.classList.add('active-panel');

    if (typeof AchievementsLogic !== 'undefined') AchievementsLogic.renderPanel();

    // Hero Transformation
    heroTitle.classList.add('achievements-mode');
    staticText.textContent = "Achievements";
    periodToggle.classList.add('hidden-panel');
}

function switchToYearlyFromAchievements() {
    const summaryPanel = document.getElementById('summary-panel');
    const achievementsPanel = document.getElementById('achievements-panel');
    const heroTitle = document.querySelector('.hero-title');
    const staticText = document.querySelector('.static-text');
    const periodToggle = document.getElementById('period-toggle');

    // UI Switch
    achievementsPanel.classList.add('hidden-panel');
    achievementsPanel.classList.remove('active-panel');

    summaryPanel.classList.remove('hidden-panel');
    summaryPanel.classList.add('active-panel');

    // Hero Revert
    heroTitle.classList.remove('achievements-mode');
    staticText.textContent = "Quests";
    periodToggle.classList.remove('hidden-panel');

    // Ensure text is consistent
    if (periodToggle.textContent.includes('Yearly')) {
        periodToggle.textContent = 'Yearly';
    }
}


// --- CROSS-MODULE HELPERS ---
// Called by Yearly Calendar to jump to a specific date
window.switchToDailyDate = function (dateObj) {
    const toggleBtn = document.getElementById('period-toggle');
    const tasksPanel = document.getElementById('tasks-panel');
    const summaryPanel = document.getElementById('summary-panel');

    // 1. Set Date
    if (typeof DailyLogic !== 'undefined') {
        DailyLogic.setViewDate(dateObj);
    }

    // 2. Switch View (only if not already there)
    if (!tasksPanel.classList.contains('active-panel')) {

        toggleBtn.classList.add('flip-out');

        setTimeout(() => {
            toggleBtn.classList.replace('text-yearly', 'text-daily');

            summaryPanel.classList.remove('active-panel');
            summaryPanel.classList.add('hidden-panel');

            tasksPanel.classList.remove('hidden-panel');
            tasksPanel.classList.add('active-panel');

            toggleBtn.classList.remove('flip-out');
            toggleBtn.classList.add('flip-in');
            setTimeout(() => toggleBtn.classList.remove('flip-in'), 250);

            // Update Title
            if (typeof DailyLogic !== 'undefined') DailyLogic.updateTitle();
        }, 250);
    }
};
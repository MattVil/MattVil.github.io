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
        if (typeof NotesLogic !== 'undefined') NotesLogic.init(db);

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
// 2. NAVIGATION LOGIC (Swipe & Scroll)
// ==========================================

// Global Configuration
const defaultPanelId = 'tasks-panel';

const panelConfig = [
    {
        id: 'timer-panel',
        title: 'Focus',
        titleClass: 'text-focus', /* White title */
        subtitle: 'Timer',
        isAchievementsMode: true /* To center the title like achievements */
    },
    {
        id: 'notes-panel',
        title: 'Quick',
        titleClass: 'text-quick',
        subtitle: 'Notes',
        isAchievementsMode: false
    },
    {
        id: 'tasks-panel',
        title: 'Daily',
        titleClass: 'text-daily',
        subtitle: 'Quests',
        isAchievementsMode: false
    },
    {
        id: 'summary-panel',
        title: 'Yearly',
        titleClass: 'text-yearly',
        subtitle: 'Quests',
        isAchievementsMode: false
    },
    {
        id: 'achievements-panel',
        title: 'Yearly', // Keeps structure for animation
        titleClass: 'hidden-panel',
        subtitle: 'Achievements',
        isAchievementsMode: true
    }
];

// Flat array for quick index lookups based on DOM IDs
const panels = panelConfig.map(config => config.id);
let currentPanelIndex = panels.indexOf(defaultPanelId);

/**
 * Sets up global navigation listeners and horizontal scroll observer.
 */
function initNavigation() {
    const carousel = document.getElementById('main-carousel');
    const toggleBtn = document.getElementById('period-toggle');
    const staticText = document.querySelector('.static-text');
    const heroTitle = document.querySelector('.hero-title');

    const leftBtn = document.getElementById('nav-btn-left');
    const rightBtn = document.getElementById('nav-btn-right');

    // 1. Reorder DOM nodes based on config
    panelConfig.forEach(config => {
        const el = document.getElementById(config.id);
        if (el) carousel.appendChild(el);
    });

    // 2. Snap to default panel immediately (No animation)
    const targetPanel = document.getElementById(defaultPanelId);
    if (targetPanel) {
        // Force layout recalc
        carousel.scrollLeft = targetPanel.offsetLeft - carousel.offsetLeft;
    }

    // Default State Initialization
    updateHeaderForPanel(currentPanelIndex);

    // --- INTERSECTION OBSERVER FOR SWIPE/SCROLL ---
    const observerOptions = {
        root: carousel,
        rootMargin: '0px',
        threshold: 0.6 // Trigger when 60% of the panel is visible
    };

    const panelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const visiblePanelId = entry.target.id;
                const newIndex = panels.indexOf(visiblePanelId);

                if (newIndex !== currentPanelIndex && newIndex !== -1) {
                    const direction = newIndex > currentPanelIndex ? 1 : -1;
                    currentPanelIndex = newIndex;
                    updateHeaderForPanel(newIndex, direction);
                    updateDesktopButtons(newIndex);

                    // Dynamic Dark Mode for Timer Panel
                    if (visiblePanelId === 'timer-panel') {
                        document.body.classList.add('dark-mode');
                        if (typeof ParticleSystem !== 'undefined') ParticleSystem.setTheme('dark');
                    } else {
                        document.body.classList.remove('dark-mode');
                        if (typeof ParticleSystem !== 'undefined') ParticleSystem.setTheme('default');

                        // Auto-reset timer if it was in the success state (finished) and user swiped away
                        const tc = document.querySelector('.timer-container');
                        if (typeof Timer !== 'undefined' && tc && tc.classList.contains('success')) {
                            Timer.resetTimer();
                        }
                    }

                    // Trigger panel-specific logic if needed when coming into view
                    if (newIndex === 1 && typeof YearlyLogic !== 'undefined') YearlyLogic.renderSummary();
                    if (newIndex === 2 && typeof AchievementsLogic !== 'undefined') AchievementsLogic.renderPanel();
                }
            }
        });
    }, observerOptions);

    // Observe all panels
    panels.forEach(panelId => {
        const el = document.getElementById(panelId);
        if (el) panelObserver.observe(el);
    });

    // --- DESKTOP BUTTON NAVIGATION ---
    if (leftBtn && rightBtn) {
        leftBtn.addEventListener('click', () => {
            if (currentPanelIndex > 0) {
                scrollToPanel(currentPanelIndex - 1);
            }
        });

        rightBtn.addEventListener('click', () => {
            if (currentPanelIndex < panels.length - 1) {
                scrollToPanel(currentPanelIndex + 1);
            }
        });
    }

    // Main header click logic has been removed to prevent erratic jumping.
}

function scrollToPanel(index) {
    if (index >= 0 && index < panels.length) {
        const carousel = document.getElementById('main-carousel');
        const targetPanel = document.getElementById(panels[index]);
        if (carousel && targetPanel) {
            // Scroll the carousel horizontally without affecting vertical page scroll
            carousel.scrollTo({
                left: targetPanel.offsetLeft - carousel.offsetLeft,
                behavior: 'smooth'
            });
        }
    }
}

function updateDesktopButtons(index) {
    const leftBtn = document.getElementById('nav-btn-left');
    const rightBtn = document.getElementById('nav-btn-right');

    if (leftBtn) {
        leftBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
    }
    if (rightBtn) {
        rightBtn.style.visibility = index === panels.length - 1 ? 'hidden' : 'visible';
    }
}

function updateHeaderForPanel(index, direction = 1) {
    if (index < 0 || index >= panelConfig.length) return;

    const config = panelConfig[index];
    const toggleBtn = document.getElementById('period-toggle');
    const staticText = document.querySelector('.static-text');
    const heroTitle = document.querySelector('.hero-title');

    // Clear any ongoing animations to prevent desync during fast scrolling
    if (window.titleAnimOut) clearTimeout(window.titleAnimOut);
    if (window.titleAnimIn) clearTimeout(window.titleAnimIn);

    heroTitle.classList.remove('fade-out-left', 'fade-out-right', 'fade-in-left', 'fade-in-right');
    // Force DOM reflow to restart animation instantly
    void heroTitle.offsetWidth;

    const fadeOutClass = direction === 1 ? 'fade-out-left' : 'fade-out-right';
    const fadeInClass = direction === 1 ? 'fade-in-right' : 'fade-in-left';

    heroTitle.classList.add(fadeOutClass);

    window.titleAnimOut = setTimeout(() => {
        // Update Title Output automatically via config
        toggleBtn.innerText = config.title;
        toggleBtn.className = config.titleClass;
        staticText.textContent = config.subtitle;

        // Apply Achievements specific layouts
        if (config.isAchievementsMode) {
            heroTitle.classList.add('achievements-mode');
        } else {
            heroTitle.classList.remove('achievements-mode');
        }

        // Trigger Panel-Specific visual updates
        if (config.id === 'tasks-panel') {
            if (typeof DailyLogic !== 'undefined') DailyLogic.resetToToday();
            if (typeof DailyLogic !== 'undefined') DailyLogic.updateTitle();
        }

        // Animation Reset
        heroTitle.classList.remove(fadeOutClass);
        heroTitle.classList.add(fadeInClass);

        window.titleAnimIn = setTimeout(() => {
            heroTitle.classList.remove(fadeInClass);
        }, 200);

    }, 200);
}


// --- CROSS-MODULE HELPERS ---
// Called by Yearly Calendar to jump to a specific date
window.switchToDailyDate = function (dateObj) {
    // 1. Set Date
    if (typeof DailyLogic !== 'undefined') {
        DailyLogic.setViewDate(dateObj);
    }

    // 2. Switch View via scroll
    scrollToPanel(0);
};
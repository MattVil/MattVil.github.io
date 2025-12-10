// ==========================================
// MAIN CONTROLLER (SCRIPT.JS)
// Orchestration, Auth, Navigation, Particules
// ==========================================

const ENCRYPTED_CONFIG = "U2FsdGVkX18mZec/cFVYe9asXI38d8kogEDARqxksKvt1xv7SM3K2yPa9OBFjZt0C9R4gd6ElKWawX3lTpFt0d8B3nLMgtibEW/VMawI1vb9EymX/9KqFn+jRCncgVT836j55eif4ItsGHEHMwjoU9WqcIC5jNusMXnt6uNcEF249C+A+KZ9RTPnFrfGmPHOhm7PMUCcZoOcxsiY1fynp+cOdRfInurnC+YAIACwPTqPhJdeHPFHiJyF6H0IP/JURMzwdJagCqYJvgQVa19rBGfcGjLEEOWaj7wN0DxY5wPsHsL96LXxn5LEXIPFFCDHOCDmdLBA3DP2dvDQZ5WMbGqwN42SNUqeZwVpPBKMFl+idGDK8b+1R8uTLgfDx3mQKjo5IcFmNZypUO9K/yfkI624YRJbI/AV7GCisx++8d6fJQXq/XvspjYTtBIdWJu+";

let db;

// Éléments Login
const loginOverlay = document.getElementById('loginOverlay');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

// ==========================================
// 1. PARTICULES 3D
// ==========================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let width, height, globeRadius;
let mouseX = null, mouseY = null;
const interactionRadius = 80; const pushStrength = 0.8;

window.addEventListener('mousemove', (e) => { mouseX = e.clientX - width / 2; mouseY = e.clientY - height / 2; });
window.addEventListener('mouseleave', () => { mouseX = null; mouseY = null; });
window.addEventListener('resize', () => { resize(); initParticles(); });

function resize() {
    const dpr = window.devicePixelRatio || 1;
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr);

    width = window.innerWidth;
    height = window.innerHeight;
    globeRadius = Math.min(width, height) * 0.45;
}
resize();

class Particle3D {
    constructor() {
        this.theta = Math.random() * 2 * Math.PI;
        this.phi = Math.acos((Math.random() * 2) - 1);
        this.x = 0; this.y = 0; this.z = 0;
        this.size = Math.random() * 3.5 + 1;
        const position = Math.random();
        const r = Math.floor(66 + (155 - 66) * position);
        const g = Math.floor(133 + (114 - 133) * position);
        const b = Math.floor(244 + (203 - 244) * position);
        this.color = `rgb(${r},${g},${b})`;
        this.driftSpeed = Math.random() * 0.02 + 0.005;
        this.driftPhase = Math.random() * Math.PI * 2;
        this.driftRange = Math.random() * 30 + 10;
    }
    update(rotationX, rotationY, time) {
        const currentRadius = globeRadius + Math.sin(time * this.driftSpeed + this.driftPhase) * this.driftRange;
        let x0 = currentRadius * Math.sin(this.phi) * Math.cos(this.theta);
        let y0 = currentRadius * Math.sin(this.phi) * Math.sin(this.theta);
        let z0 = currentRadius * Math.cos(this.phi);
        let x1 = x0 * Math.cos(rotationY) - z0 * Math.sin(rotationY);
        let z1 = x0 * Math.sin(rotationY) + z0 * Math.cos(rotationY);
        let y2 = y0 * Math.cos(rotationX) - z1 * Math.sin(rotationX);
        let z2 = y0 * Math.sin(rotationX) + z1 * Math.cos(rotationX);
        this.x = x1; this.y = y2; this.z = z2;
    }
    draw() {
        const perspective = width;
        const scale = perspective / (perspective + this.z + globeRadius);
        let x2D = this.x * scale; let y2D = this.y * scale; let currentSize = this.size * scale;

        if (mouseX !== null && mouseY !== null) {
            const dx = x2D - mouseX; const dy = y2D - mouseY;
            const distSq = dx * dx + dy * dy;
            if (distSq < interactionRadius * interactionRadius) {
                const distance = Math.sqrt(distSq);
                const force = (interactionRadius - distance) / interactionRadius;
                const angle = Math.atan2(dy, dx);
                x2D += Math.cos(angle) * force * interactionRadius * pushStrength;
                y2D += Math.sin(angle) * force * interactionRadius * pushStrength;
            }
        }
        const finalScreenX = x2D + width / 2; const finalScreenY = y2D + height / 2;

        // --- TITLE VISIBILITY LOGIC ---
        // Title is approx at top center (x=0, y = -height/2 + ~150px) relative to center
        // In screen coords: x = width/2, y = ~150
        const titleX = width / 2;
        const titleY = height * 0.15; // Approx 15% from top
        const dxT = finalScreenX - titleX;
        const dyT = finalScreenY - titleY;
        const distTitle = Math.sqrt(dxT * dxT + dyT * dyT);

        // Opacity Mask: If close to title, reduce opacity significantly
        const titleSafeRadius = 250;
        let alpha = Math.max(0.1, 1 - (this.z + globeRadius) / (2.5 * globeRadius));

        if (distTitle < titleSafeRadius) {
            const fadeFactor = distTitle / titleSafeRadius; // 0 (center) to 1 (edge)
            alpha *= Math.pow(fadeFactor, 2); // Square for smoother drop
        }

        ctx.fillStyle = this.color; ctx.globalAlpha = Math.max(0.05, alpha); // Keep tiny bit visible
        ctx.beginPath(); ctx.arc(finalScreenX, finalScreenY, currentSize, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1.0;
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 1000; i++) particles.push(new Particle3D());
}

let angleY = 0; let angleX = 0; let time = 0;
function animate() {
    ctx.clearRect(0, 0, width, height);
    angleY += 0.0005; angleX += 0.0002; time++;
    particles.forEach(p => { p.update(angleX, angleY, time); p.draw(); });
    requestAnimationFrame(animate);
}

// ==========================================
// 2. INITIALISATION DE L'APP
// ==========================================
function initApp(decryptedConfig) {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(decryptedConfig);
        }
        db = firebase.firestore();
        console.log("Firebase Connected.");

        if (typeof DailyLogic !== 'undefined') DailyLogic.init(db);
        if (typeof YearlyLogic !== 'undefined') YearlyLogic.init(db);

        loginOverlay.classList.add('hidden-overlay');
        initParticles();
        animate();
        initNavigation();

    } catch (e) {
        console.error("Init Error:", e);
        localStorage.removeItem('dailyQuestKey');
        loginError.style.display = 'block';
        loginError.innerText = "Error initializing app.";
    }
}

// ==========================================
// 3. NAVIGATION (Daily <-> Yearly)
// ==========================================

// Fonction Globale pour basculer vers une date précise (appelée depuis Yearly)
window.switchToDailyDate = function (dateObj) {
    const toggleBtn = document.getElementById('period-toggle');
    const tasksPanel = document.getElementById('tasks-panel');
    const summaryPanel = document.getElementById('summary-panel');

    // 1. Charger la date dans le module Daily
    if (typeof DailyLogic !== 'undefined') {
        DailyLogic.setViewDate(dateObj);
    }

    // 2. Si on est déjà en mode Daily, on a fini (le DailyLogic a déjà refresh)
    // Sinon, on bascule l'UI
    if (summaryPanel.classList.contains('active-panel')) {
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

            // On met à jour le texte
            toggleBtn.innerText = "Today's"; // Ou la date si ce n'est pas aujourd'hui
            if (typeof DailyLogic !== 'undefined') DailyLogic.updateTitle();
        }, 250);
    }
};

function initNavigation() {
    const toggleBtn = document.getElementById('period-toggle');
    const tasksPanel = document.getElementById('tasks-panel');
    const summaryPanel = document.getElementById('summary-panel');

    // Par défaut, on est sur Daily (Aujourd'hui)
    toggleBtn.classList.add('text-daily');

    toggleBtn.addEventListener('click', () => {
        if (toggleBtn.classList.contains('flip-out') || toggleBtn.classList.contains('flip-in')) return;

        const isCurrentlyDaily = tasksPanel.classList.contains('active-panel');
        toggleBtn.classList.add('flip-out');

        setTimeout(() => {
            if (isCurrentlyDaily) {
                // Aller vers YEARLY
                toggleBtn.innerText = "Yearly";
                toggleBtn.classList.replace('text-daily', 'text-yearly');

                tasksPanel.classList.remove('active-panel');
                tasksPanel.classList.add('hidden-panel');

                summaryPanel.classList.remove('hidden-panel');
                summaryPanel.classList.add('active-panel');

                if (typeof YearlyLogic !== 'undefined') YearlyLogic.renderSummary();

            } else {
                // Aller vers DAILY (Retour à aujourd'hui par défaut si on clique sur Yearly)
                if (typeof DailyLogic !== 'undefined') DailyLogic.resetToToday();

                toggleBtn.classList.replace('text-yearly', 'text-daily');

                summaryPanel.classList.remove('active-panel');
                summaryPanel.classList.add('hidden-panel');

                tasksPanel.classList.remove('hidden-panel');
                tasksPanel.classList.add('active-panel');
            }

            toggleBtn.classList.remove('flip-out');
            toggleBtn.classList.add('flip-in');
            setTimeout(() => toggleBtn.classList.remove('flip-in'), 250);

        }, 250);
    });
}


// ==========================================
// 4. AUTHENTIFICATION & EXECUTION
// ==========================================
function tryLogin(password) {
    try {
        const bytes = CryptoJS.AES.decrypt(ENCRYPTED_CONFIG, password);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        const config = JSON.parse(originalText);
        localStorage.setItem('dailyQuestKey', password);
        initApp(config);
    } catch (error) {
        console.error("Login failed:", error);
        loginError.style.display = 'block';
        passwordInput.value = '';
    }
}

const savedPassword = localStorage.getItem('dailyQuestKey');
if (savedPassword) tryLogin(savedPassword);

loginBtn.addEventListener('click', () => { if (passwordInput.value) tryLogin(passwordInput.value); });
passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && passwordInput.value) tryLogin(passwordInput.value); });
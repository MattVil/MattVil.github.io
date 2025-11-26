// ==========================================
// MAIN CONTROLLER (SCRIPT.JS)
// Orchestration, Auth, Navigation, Particules
// ==========================================

// CONFIGURATION CRYPTÉE
const ENCRYPTED_CONFIG = "U2FsdGVkX19OOtq6V9fRLJlziRY6kE1FYL35pi4u1EeQ5QvhBvbrEkauTxn0m1hwGSCTNH4ofifG3J9oHAguWyZpRQqBv4nJwnYV8bYPEGqVR0zS7SJQ4gw9ii0JStgkZ702RN6xd/IYlvTmldU9TTT6Vlt39zvZvHW2Q0+6oDHahc1BETvO0dy61N8qNJ6Et37Do5gKJ597d9zx3RuKo8ysE0Q7C/8t7ftY9h2bQpqzWUzJy7UY2NOk6PPXZKQbPAKqasZG6vTqsZcVCTtjZ8rVbMYOUKuhuI2Tzyn67LQpYZiBQF/MXqAGliT2lG7ph2pmWf2dRdFsergfx1nZRTWXhURi1E+NRANFTja9SWj5oxhH5aT4dz9B+PRHjtVQoCi9ZazjBvd7w3vYhtuFgq9oyGq0rXnKUqOjm5GJWr9DjdVNXi0XMiPrd5pQdgbA";

let db;

// Éléments Login
const loginOverlay = document.getElementById('loginOverlay');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');


// ==========================================
// 1. PARTICULES 3D (Défini en premier pour éviter les erreurs)
// ==========================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let width, height, globeRadius; 
let mouseX = null, mouseY = null;
const interactionRadius = 80; const pushStrength = 0.8; 

// Listeners Particules
window.addEventListener('mousemove', (e) => { mouseX = e.clientX - width / 2; mouseY = e.clientY - height / 2; });
window.addEventListener('mouseleave', () => { mouseX = null; mouseY = null; });
window.addEventListener('resize', () => { resize(); initParticles(); });

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    globeRadius = Math.min(width, height) * 0.45; 
}
// Init canvas size immediately
resize();

class Particle3D {
    constructor() {
        this.theta = Math.random() * 2 * Math.PI;
        this.phi = Math.acos((Math.random() * 2) - 1);
        this.x = 0; this.y = 0; this.z = 0;
        this.size = Math.random() * 1.5 + 1;
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
            const distSq = dx*dx + dy*dy;
            if (distSq < interactionRadius * interactionRadius) {
                const distance = Math.sqrt(distSq);
                const force = (interactionRadius - distance) / interactionRadius;
                const angle = Math.atan2(dy, dx);
                x2D += Math.cos(angle) * force * interactionRadius * pushStrength;
                y2D += Math.sin(angle) * force * interactionRadius * pushStrength;
            }
        }
        const finalScreenX = x2D + width / 2; const finalScreenY = y2D + height / 2;
        const alpha = Math.max(0.1, 1 - (this.z + globeRadius) / (2.5 * globeRadius));
        ctx.fillStyle = this.color; ctx.globalAlpha = alpha;
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

        // INJECTION DE DÉPENDANCE : On passe la DB aux modules
        if (typeof DailyLogic !== 'undefined') {
            DailyLogic.init(db);
        }
        if (typeof YearlyLogic !== 'undefined') {
            YearlyLogic.init(db);
        }

        // UI Start
        loginOverlay.classList.add('hidden-overlay');
        initParticles(); // Maintenant Particle3D est bien défini
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
function initNavigation() {
    const toggleBtn = document.getElementById('period-toggle');
    const tasksPanel = document.getElementById('tasks-panel');
    const summaryPanel = document.getElementById('summary-panel');
    let isDailyMode = true; 

    toggleBtn.classList.add('text-daily');

    toggleBtn.addEventListener('click', () => {
        if (toggleBtn.classList.contains('flip-out') || toggleBtn.classList.contains('flip-in')) return;

        toggleBtn.classList.add('flip-out');
        setTimeout(() => {
            isDailyMode = !isDailyMode;
            toggleBtn.innerText = isDailyMode ? "Daily" : "Yearly";
            
            if (isDailyMode) {
                toggleBtn.classList.replace('text-yearly', 'text-daily');
                tasksPanel.classList.remove('hidden-panel');
                tasksPanel.classList.add('active-panel');
                summaryPanel.classList.remove('active-panel');
                summaryPanel.classList.add('hidden-panel');
            } else {
                toggleBtn.classList.replace('text-daily', 'text-yearly');
                summaryPanel.classList.remove('hidden-panel');
                summaryPanel.classList.add('active-panel');
                tasksPanel.classList.remove('active-panel');
                tasksPanel.classList.add('hidden-panel');
                
                // On notifie le module Yearly qu'on est prêt
                if (typeof YearlyLogic !== 'undefined') YearlyLogic.renderSummary();
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

// Auto-login check (Exécuté en dernier)
const savedPassword = localStorage.getItem('dailyQuestKey');
if (savedPassword) tryLogin(savedPassword);

loginBtn.addEventListener('click', () => { if(passwordInput.value) tryLogin(passwordInput.value); });
passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && passwordInput.value) tryLogin(passwordInput.value); });
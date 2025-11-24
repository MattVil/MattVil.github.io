// ==========================================
// 1. SYSTÈME DE PARTICULES (SPHÈRE 3D)
// ==========================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let width, height;
let globeRadius; 

// Interaction Souris / Doigt
let mouseX = null;
let mouseY = null;
const interactionRadius = 80; 
const pushStrength = 0.8; 

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX - width / 2;
    mouseY = e.clientY - height / 2;
});

window.addEventListener('mouseleave', () => {
    mouseX = null;
    mouseY = null;
});

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    globeRadius = Math.min(width, height) * 0.45; 
}

window.addEventListener('resize', () => {
    resize();
    initParticles();
});
resize();

class Particle3D {
    constructor() {
        this.theta = Math.random() * 2 * Math.PI;
        this.phi = Math.acos((Math.random() * 2) - 1);
        this.x = 0; this.y = 0; this.z = 0;
        this.size = Math.random() * 1.5 + 1;
        
        // Gradient bleu-violet
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
        
        let x2D = this.x * scale;
        let y2D = this.y * scale;
        let currentSize = this.size * scale;

        if (mouseX !== null && mouseY !== null) {
            const dx = x2D - mouseX;
            const dy = y2D - mouseY;
            const distSq = dx*dx + dy*dy;
            const radSq = interactionRadius * interactionRadius;

            if (distSq < radSq) {
                const distance = Math.sqrt(distSq);
                const force = (interactionRadius - distance) / interactionRadius;
                const angle = Math.atan2(dy, dx);
                
                const moveX = Math.cos(angle) * force * interactionRadius * pushStrength;
                const moveY = Math.sin(angle) * force * interactionRadius * pushStrength;
                
                x2D += moveX;
                y2D += moveY;
            }
        }

        const finalScreenX = x2D + width / 2;
        const finalScreenY = y2D + height / 2;

        const alpha = Math.max(0.1, 1 - (this.z + globeRadius) / (2.5 * globeRadius));
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        
        ctx.beginPath();
        ctx.arc(finalScreenX, finalScreenY, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1.0;
    }
}

function initParticles() {
    particles = [];
    const particleCount = 650;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle3D());
    }
}

let angleY = 0;
let angleX = 0;
let time = 0;

function animate() {
    ctx.clearRect(0, 0, width, height);
    angleY += 0.0005;
    angleX += 0.0002;
    time++;
    particles.forEach(p => {
        p.update(angleX, angleY, time);
        p.draw();
    });
    requestAnimationFrame(animate);
}

initParticles();
animate();

// ==========================================
// 2. LOGIQUE UI (TOGGLE & NAVIGATION)
// ==========================================

const toggleBtn = document.getElementById('period-toggle');
const tasksPanel = document.getElementById('tasks-panel');
const summaryPanel = document.getElementById('summary-panel');

let isDailyMode = true; 

// Initialisation de la couleur
toggleBtn.classList.add('text-daily');

toggleBtn.addEventListener('click', () => {
    if (toggleBtn.classList.contains('flip-out') || toggleBtn.classList.contains('flip-in')) return;

    // 1. Sortie
    toggleBtn.classList.add('flip-out');

    setTimeout(() => {
        // 2. Changement de données
        isDailyMode = !isDailyMode;
        toggleBtn.innerText = isDailyMode ? "Daily" : "Yearly";
        
        // Changement de couleur
        if (isDailyMode) {
            toggleBtn.classList.replace('text-yearly', 'text-daily');
        } else {
            toggleBtn.classList.replace('text-daily', 'text-yearly');
        }
        
        toggleBtn.classList.remove('flip-out');
        
        // 3. Entrée
        toggleBtn.classList.add('flip-in');

        // 4. Panels
        if (isDailyMode) {
            tasksPanel.classList.remove('hidden-panel');
            tasksPanel.classList.add('active-panel');
            summaryPanel.classList.remove('active-panel');
            summaryPanel.classList.add('hidden-panel');
        } else {
            summaryPanel.classList.remove('hidden-panel');
            summaryPanel.classList.add('active-panel');
            tasksPanel.classList.remove('active-panel');
            tasksPanel.classList.add('hidden-panel');
        }

        setTimeout(() => {
            toggleBtn.classList.remove('flip-in');
        }, 250);

    }, 250);
});
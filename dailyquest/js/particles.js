// ==========================================
// PARTICLES 3D ENGINE
// ==========================================

const ParticleSystem = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    particles: [],
    globeRadius: 0,
    mouseX: null,
    mouseY: null,
    animationId: null,

    // Constants
    interactionRadius: 80,
    pushStrength: 0.8,
    particleCount: 1000,

    init: function () {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.bindEvents();
        this.resize();
        this.initParticles();
        this.animate();
    },

    bindEvents: function () {
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX - this.width / 2;
            this.mouseY = e.clientY - this.height / 2;
        });

        window.addEventListener('mouseleave', () => {
            this.mouseX = null;
            this.mouseY = null;
        });

        // Mobile Scroll Fix: Only resize if WIDTH changes
        let lastWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            if (window.innerWidth !== lastWidth) {
                lastWidth = window.innerWidth;
                this.resize();
                this.initParticles();
            }
        });
    },

    resize: function () {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.scale(dpr, dpr);

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.globeRadius = Math.min(this.width, this.height) * 0.45;
    },

    initParticles: function () {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle3D(this));
        }
    },

    animate: function () {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Update global rotation
        ParticleSystem.angleY = (ParticleSystem.angleY || 0) + 0.0005;
        ParticleSystem.angleX = (ParticleSystem.angleX || 0) + 0.0002;
        ParticleSystem.time = (ParticleSystem.time || 0) + 1;

        this.particles.forEach(p => {
            p.update(ParticleSystem.angleX, ParticleSystem.angleY, ParticleSystem.time);
            p.draw();
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }
};

class Particle3D {
    constructor(system) {
        this.system = system;
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
        const currentRadius = this.system.globeRadius + Math.sin(time * this.driftSpeed + this.driftPhase) * this.driftRange;

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
        const perspective = this.system.width;
        const scale = perspective / (perspective + this.z + this.system.globeRadius);
        let x2D = this.x * scale;
        let y2D = this.y * scale;
        let currentSize = this.size * scale;

        if (this.system.mouseX !== null && this.system.mouseY !== null) {
            const dx = x2D - this.system.mouseX;
            const dy = y2D - this.system.mouseY;
            const distSq = dx * dx + dy * dy;

            if (distSq < this.system.interactionRadius * this.system.interactionRadius) {
                const distance = Math.sqrt(distSq);
                const force = (this.system.interactionRadius - distance) / this.system.interactionRadius;
                const angle = Math.atan2(dy, dx);

                x2D += Math.cos(angle) * force * this.system.interactionRadius * this.system.pushStrength;
                y2D += Math.sin(angle) * force * this.system.interactionRadius * this.system.pushStrength;
            }
        }

        const finalScreenX = x2D + this.system.width / 2;
        const finalScreenY = y2D + this.system.height / 2;

        // --- TITLE VISIBILITY LOGIC ---
        // Title is approx at top center (x=0, y = -height/2 + ~150px) relative to center
        // In screen coords: x = width/2, y = ~150
        const titleX = this.system.width / 2;
        const titleY = this.system.height * 0.15; // Approx 15% from top

        const dxT = finalScreenX - titleX;
        const dyT = finalScreenY - titleY;
        const distTitle = Math.sqrt(dxT * dxT + dyT * dyT);

        // Opacity Mask: If close to title, reduce opacity significantly
        const titleSafeRadius = 250;
        let alpha = Math.max(0.1, 1 - (this.z + this.system.globeRadius) / (2.5 * this.system.globeRadius));

        if (distTitle < titleSafeRadius) {
            const fadeFactor = distTitle / titleSafeRadius; // 0 (center) to 1 (edge)
            alpha *= Math.pow(fadeFactor, 2); // Square for smoother drop
        }

        const ctx = this.system.ctx;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0.05, alpha); // Keep tiny bit visible
        ctx.beginPath();
        ctx.arc(finalScreenX, finalScreenY, currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// ==========================================
// 1. 3D PARTICLE SPHERE SYSTEM
// ==========================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let width, height;
let globeRadius; 

// Interaction Mouse / Finger
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
        
        // Blue-Violet Gradient
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
// 2. UI LOGIC (TOGGLE & NAVIGATION)
// ==========================================

const toggleBtn = document.getElementById('period-toggle');
const tasksPanel = document.getElementById('tasks-panel');
const summaryPanel = document.getElementById('summary-panel');

let isDailyMode = true; 

toggleBtn.classList.add('text-daily');

toggleBtn.addEventListener('click', () => {
    if (toggleBtn.classList.contains('flip-out') || toggleBtn.classList.contains('flip-in')) return;

    // 1. Out animation
    toggleBtn.classList.add('flip-out');

    setTimeout(() => {
        // 2. Data change
        isDailyMode = !isDailyMode;
        toggleBtn.innerText = isDailyMode ? "Daily" : "Yearly";
        
        // Color change
        if (isDailyMode) {
            toggleBtn.classList.replace('text-yearly', 'text-daily');
        } else {
            toggleBtn.classList.replace('text-daily', 'text-yearly');
        }
        
        toggleBtn.classList.remove('flip-out');
        
        // 3. In animation
        toggleBtn.classList.add('flip-in');

        // 4. Panel switch
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


// ==========================================
// 3. QUEST LOGIC (Display & Progress)
// ==========================================

const questList = document.getElementById('questList'); 
const progressBarFill = document.getElementById('progressBarFill');
const progressEmoji = document.getElementById('progressEmoji');


// Function to create a visual quest item
function displayQuest(title, isDone = false, type = 'DAILY_ONLY') {
    const li = document.createElement('li');
    li.className = `quest-item ${isDone ? 'completed' : ''}`;
    
    // Set type color class
    let typeClass = 'daily-type';
    if (type === 'WEEKLY') {
        typeClass = 'weekly-type';
    } else if (type === 'MONTHLY') {
        typeClass = 'monthly-type';
    } else if (type === 'RECURRING') {
        typeClass = 'daily-type'; // Treat recurring like daily for color
    }
    li.classList.add(typeClass);

    li.innerHTML = `
        <span class="quest-text">${title}</span>
        <button class="check-btn"></button>
    `;

    // Event: Click to simulate completion 
    const checkBtn = li.querySelector('.check-btn');
    checkBtn.addEventListener('click', () => {
        li.classList.toggle('completed');
        updateProgress();
    });

    questList.prepend(li);
    updateProgress();
}

// Function that calculates and updates the progress bar and emoji
function updateProgress() {
    const allQuests = questList.querySelectorAll('.quest-item');
    if (allQuests.length === 0) {
        progressBarFill.style.width = '0%';
        progressEmoji.innerText = '😴'; 
        return;
    }

    const completedQuests = questList.querySelectorAll('.quest-item.completed').length;
    const totalQuests = allQuests.length;
    const percentage = Math.round((completedQuests / totalQuests) * 100);

    // 1. Update bar width
    progressBarFill.style.width = `${percentage}%`;

    // 2. Update emoji (Final Set)
    let emoji = '';
    if (percentage === 100) {
        emoji = '🏆'; // Trophy
    } else if (percentage >= 80) {
        emoji = '🚀'; // Liftoff
    } else if (percentage >= 60) {
        emoji = '💪'; // Strength
    } else if (percentage >= 40) {
        emoji = '🔥'; // On fire
    } else if (percentage >= 20) {
        emoji = '🌱'; // Growth
    } else {
        emoji = '💧'; // Start
    }
    progressEmoji.innerText = emoji;
}


// --- DEMO: Fixed quests for design testing ---
setTimeout(() => displayQuest("Implement persistence layer", true), 100);
setTimeout(() => displayQuest("Review responsive layout", false, 'WEEKLY'), 300);
setTimeout(() => displayQuest("Define data structure", false, 'MONTHLY'), 500);

if (questList.children.length === 0) {
    updateProgress();
}

// ==========================================
// 4. UI LOGIC: ADD QUEST FORM
// ==========================================

const desktopToggleFormBtn = document.getElementById('desktopToggleFormBtn');
const taskForm = document.getElementById('taskForm');
const closeFormBtn = document.getElementById('closeFormBtn'); 
const desktopAddBtnArea = document.getElementById('desktopAddBtnArea');
const questAddForm = document.getElementById('questAddForm');
const questTypeRadios = document.querySelectorAll('input[name="questType"]');
const recurrenceOptions = document.getElementById('recurrenceOptions');
const questDateInput = document.getElementById('questDate'); 
const submitQuestBtn = document.getElementById('submitQuestBtn'); 


// Set today's date as default
questDateInput.valueAsDate = new Date();


// Function to handle recurrence options visibility AND button color
function handleRecurrenceToggle() {
    const selectedType = document.querySelector('input[name="questType"]:checked').value;
    
    // 1. Recurrence Options Visibility
    if (selectedType === 'RECURRING') {
        recurrenceOptions.classList.remove('hidden-recurrence');
    } else {
        recurrenceOptions.classList.add('hidden-recurrence');
    }

    // 2. Button Color Logic
    let colorClass = '';
    if (selectedType === 'WEEKLY') {
        colorClass = 'weekly-type-btn';
    } else if (selectedType === 'MONTHLY') {
        colorClass = 'monthly-type-btn';
    } else {
        // DAILY_ONLY and RECURRING use the daily color (Blue)
        colorClass = 'daily-type-btn';
    }

    // Remove all color classes and add the correct one
    submitQuestBtn.classList.remove('daily-type-btn', 'weekly-type-btn', 'monthly-type-btn');
    submitQuestBtn.classList.add(colorClass);
    
    // On doit aussi mettre à jour la couleur du bouton statique desktop (fermée)
    desktopToggleFormBtn.classList.remove('daily-type-btn', 'weekly-type-btn', 'monthly-type-btn');
    desktopToggleFormBtn.classList.add(colorClass);
}

function toggleForm() {
    taskForm.classList.toggle('open');
    const isOpen = taskForm.classList.contains('open');

    // Update the static button text
    desktopToggleFormBtn.innerText = isOpen ? 'Close Form' : 'New Quest';
    
    // Optional: Hide/Show the static button area for animation purposes 
    if (!isOpen) {
        desktopAddBtnArea.style.opacity = '1';
        desktopAddBtnArea.style.pointerEvents = 'auto';
    }
}

// Attach listeners
desktopToggleFormBtn.addEventListener('click', toggleForm);
closeFormBtn.addEventListener('click', toggleForm);

questTypeRadios.forEach(radio => {
    radio.addEventListener('change', handleRecurrenceToggle);
});

// Ensure initial color is set on load
handleRecurrenceToggle(); 

// Demo Submission 
questAddForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('questTitle').value;
    const type = document.querySelector('input[name="questType"]:checked').value;
    const date = questDateInput.value;
    
    console.log(`Submitting Quest: ${title}, Type: ${type}, Date: ${date}`);
    
    // Add the new quest to the list for immediate visual feedback
    displayQuest(title, false, type); 
    
    // Clear form and close
    questAddForm.reset();
    questDateInput.valueAsDate = new Date(); // Reset date to today
    handleRecurrenceToggle(); // Reset button color to default (Daily)
    toggleForm(); 
});
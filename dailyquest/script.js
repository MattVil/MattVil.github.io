// ==========================================
// 0. FIREBASE SETUP & UTILITIES
// ==========================================

let currentEditTemplateId = null;
let currentEditTemplateData = null; // Pour stocker les données originales lors de l'édition

// VOS CLÉS FIREBASE
const firebaseConfig = {
    apiKey: "*",
    authDomain: "*",
    projectId: "*",
    storageBucket: "*",
    messagingSenderId: "*",
    appId: "*",
    measurementId: "*"
};

let db;
let getTodayTimestamp, getDayOfWeek, formatDateString; 

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase Initialized Successfully.");

    getTodayTimestamp = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return firebase.firestore.Timestamp.fromDate(today);
    };

    getDayOfWeek = (date) => {
        const day = date.getDay();
        return day === 0 ? 7 : day;
    };
    
    formatDateString = (date) => {
        return date.toISOString().split('T')[0];
    };
    
} catch (e) {
    console.error("FATAL ERROR: Firebase Initialization Failed.", e);
}

if (db) { 
    // ==========================================
    // 1. 3D PARTICLE SPHERE SYSTEM
    // ==========================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;
    let globeRadius; 
    let mouseX = null, mouseY = null;
    const interactionRadius = 80; 
    const pushStrength = 0.8; 

    window.addEventListener('mousemove', (e) => { mouseX = e.clientX - width / 2; mouseY = e.clientY - height / 2; });
    window.addEventListener('mouseleave', () => { mouseX = null; mouseY = null; });
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        globeRadius = Math.min(width, height) * 0.45; 
    }
    window.addEventListener('resize', () => { resize(); initParticles(); });
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
        for (let i = 0; i < particleCount; i++) { particles.push(new Particle3D()); }
    }
    let angleY = 0; let angleX = 0; let time = 0;
    function animate() {
        ctx.clearRect(0, 0, width, height);
        angleY += 0.0005; angleX += 0.0002; time++;
        particles.forEach(p => { p.update(angleX, angleY, time); p.draw(); });
        requestAnimationFrame(animate);
    }
    initParticles(); animate();

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
        toggleBtn.classList.add('flip-out');
        setTimeout(() => {
            isDailyMode = !isDailyMode;
            toggleBtn.innerText = isDailyMode ? "Daily" : "Yearly";
            if (isDailyMode) { toggleBtn.classList.replace('text-yearly', 'text-daily'); } 
            else { toggleBtn.classList.replace('text-daily', 'text-yearly'); }
            toggleBtn.classList.remove('flip-out'); toggleBtn.classList.add('flip-in');
            if (isDailyMode) {
                tasksPanel.classList.remove('hidden-panel'); tasksPanel.classList.add('active-panel');
                summaryPanel.classList.remove('active-panel'); summaryPanel.classList.add('hidden-panel');
            } else {
                summaryPanel.classList.remove('hidden-panel'); summaryPanel.classList.add('active-panel');
                tasksPanel.classList.remove('active-panel'); tasksPanel.classList.add('hidden-panel');
            }
            setTimeout(() => { toggleBtn.classList.remove('flip-in'); }, 250);
        }, 250);
    });

    // ==========================================
    // 3. QUEST LOGIC
    // ==========================================
    const questList = document.getElementById('questList'); 
    const progressBarFill = document.getElementById('progressBarFill');
    const progressEmoji = document.getElementById('progressEmoji');

    function displayQuest(id, title, isDone = false, type = 'DAILY_ONLY', instanceId = null) {
        const li = document.createElement('li');
        li.className = `quest-item ${isDone ? 'completed' : ''}`;
        li.dataset.questId = id; 
        if (instanceId) li.dataset.instanceId = instanceId;
        
        let typeClass = 'daily-type';
        if (type === 'WEEKLY') typeClass = 'weekly-type'; 
        else if (type === 'MONTHLY') typeClass = 'monthly-type'; 
        else if (type === 'RECURRING') typeClass = 'daily-type';
        li.classList.add(typeClass);

        li.innerHTML = `<span class="quest-text">${title}</span><button class="check-btn"></button>`;

        const checkBtn = li.querySelector('.check-btn');
        checkBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); 
            const isCurrentlyCompleted = li.classList.contains('completed');
            if (isCurrentlyCompleted) {
                const instanceIdToDelete = li.dataset.instanceId;
                if (!instanceIdToDelete) return;
                try {
                    await db.collection('quest_instances').doc(instanceIdToDelete).delete();
                    li.classList.remove('completed');
                    delete li.dataset.instanceId; 
                    updateProgress();
                } catch (error) { console.error(error); }
            } else {
                const questInstance = {
                    template_id: id, 
                    date: getTodayTimestamp(),
                    is_completed: true,
                    created_at: firebase.firestore.FieldValue.serverTimestamp()
                };
                try {
                    const docRef = await db.collection('quest_instances').add(questInstance);
                    li.classList.add('completed');
                    li.dataset.instanceId = docRef.id; 
                    updateProgress();
                } catch (error) { console.error(error); }
            }
        });
        
        li.addEventListener('click', () => { handleEditClick(id); });
        questList.appendChild(li); 
        updateProgress();
    }

    async function loadAndDisplayQuests() {
        questList.innerHTML = ''; 
        const today = new Date();
        const todayString = formatDateString(today); 
        const todayDayOfWeek = getDayOfWeek(today); 
        const todayTimestamp = getTodayTimestamp();
        
        try {
            const templatesSnapshot = await db.collection('quest_templates')
                .where('is_active', '==', true)
                .get();

            if (templatesSnapshot.empty) { updateProgress(); return; }

            const templates = templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const instancesSnapshot = await db.collection('quest_instances')
                .where('date', '==', todayTimestamp)
                .where('is_completed', '==', true)
                .get();
                
            const completedInstancesMap = new Map();
            instancesSnapshot.docs.forEach(doc => { completedInstancesMap.set(doc.data().template_id, doc.id); });

            templates.forEach(template => {
                if (template.exception_dates && template.exception_dates.includes(todayString)) {
                    return; 
                }

                const completionInstanceId = completedInstancesMap.get(template.id);
                const isDone = !!completionInstanceId; 

                let shouldDisplay = false;
                switch (template.type) {
                    case 'DAILY_ONLY': 
                        if (template.start_date) {
                            const tDate = template.start_date.toDate();
                            if (formatDateString(tDate) === todayString) shouldDisplay = true;
                        }
                        break;
                    case 'RECURRING':
                        if (template.recurrence_rule && template.recurrence_rule.daysOfWeek) {
                            shouldDisplay = template.recurrence_rule.daysOfWeek.includes(todayDayOfWeek);
                        }
                        break;
                    case 'WEEKLY':
                    case 'MONTHLY': shouldDisplay = true; break;
                }

                if (shouldDisplay) {
                    displayQuest(template.id, template.title, isDone, template.type, completionInstanceId);
                }
            });
        } catch (error) { console.error("Erreur chargement:", error); }
        updateProgress();
    }

    function updateProgress() {
        const allQuests = questList.querySelectorAll('.quest-item');
        if (allQuests.length === 0) {
            progressBarFill.style.width = '0%'; progressEmoji.innerText = '😴'; return;
        }
        const completedQuests = questList.querySelectorAll('.quest-item.completed').length;
        const totalQuests = allQuests.length;
        const percentage = Math.round((completedQuests / totalQuests) * 100);
        progressBarFill.style.width = `${percentage}%`;
        let emoji = percentage === 100 ? '🏆' : percentage >= 80 ? '🚀' : percentage >= 60 ? '💪' : percentage >= 40 ? '🔥' : percentage >= 20 ? '🌱' : '💧';
        progressEmoji.innerText = emoji;
    }

    // ==========================================
    // 4. UI LOGIC: FORMULAIRE (AVEC CHECKBOX SCOPE)
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
    const deleteQuestBtn = document.getElementById('deleteQuestBtn'); 
    
    // NOUVEAU CONTENEUR (CHECKBOX)
    const editScopeContainer = document.getElementById('editScopeContainer'); 
    const editScopeCheckbox = document.getElementById('editScopeCheckbox');

    questDateInput.valueAsDate = new Date();

    function resetFormToCreateMode() {
        currentEditTemplateId = null;
        currentEditTemplateData = null;
        document.getElementById('questAddForm').reset();
        document.getElementById('questDate').valueAsDate = new Date();
        document.querySelector('.task-form-content h2').innerText = 'Add New Quest';
        submitQuestBtn.innerText = 'Add Quest';
        deleteQuestBtn.classList.add('hidden-action-btn');
        
        // Reset des notes
        document.getElementById('questNotes').value = ''; 

        editScopeContainer.classList.add('hidden-scope'); 
        editScopeCheckbox.checked = false; 

        document.getElementById('typeDaily').checked = true;
        handleRecurrenceToggle(); 
    }

    function toggleForm() {
        taskForm.classList.toggle('open');
        const isOpen = taskForm.classList.contains('open');
        desktopToggleFormBtn.innerText = isOpen ? 'Close Form' : 'New Quest';
        if (!isOpen) {
            desktopAddBtnArea.style.opacity = '1'; desktopAddBtnArea.style.pointerEvents = 'auto';
            resetFormToCreateMode(); 
        } else {
            if (currentEditTemplateId === null) resetFormToCreateMode();
        }
    }

    function handleRecurrenceToggle() {
        const selectedType = document.querySelector('input[name="questType"]:checked').value;
        if (selectedType === 'RECURRING') recurrenceOptions.classList.remove('hidden-recurrence');
        else recurrenceOptions.classList.add('hidden-recurrence');

        let colorClass = 'daily-type-btn';
        if (selectedType === 'WEEKLY') colorClass = 'weekly-type-btn';
        else if (selectedType === 'MONTHLY') colorClass = 'monthly-type-btn';
        
        submitQuestBtn.className = `new-quest-btn submit-form-btn ${colorClass}`;
        desktopToggleFormBtn.className = `new-quest-btn ${colorClass}`;
    }

    async function handleEditClick(templateId) {
        try {
            const doc = await db.collection('quest_templates').doc(templateId).get(); 
            if (!doc.exists) return;

            const template = doc.data();
            currentEditTemplateId = templateId; 
            currentEditTemplateData = template; 

            document.getElementById('questTitle').value = template.title;
            
            // --- NOUVEAU : Chargement des notes ---
            document.getElementById('questNotes').value = template.notes || ''; 
            
            let dateValue = new Date().toISOString().split('T')[0];
            if (template.type === 'DAILY_ONLY' && template.start_date) {
                dateValue = template.start_date.toDate().toISOString().split('T')[0];
            }
            document.getElementById('questDate').value = dateValue;

            const typeId = `type${template.type.charAt(0).toUpperCase() + template.type.slice(1).toLowerCase()}`;
            const radio = document.getElementById(typeId);
            if (radio) radio.checked = true;
            
            document.querySelectorAll('.day-selector input[type="checkbox"]').forEach(cb => cb.checked = false);
            if (template.type === 'RECURRING' && template.recurrence_rule && template.recurrence_rule.daysOfWeek) {
                template.recurrence_rule.daysOfWeek.forEach(day => {
                    const dayInput = document.querySelector(`.day-selector input[value="${day}"]`);
                    if (dayInput) dayInput.checked = true;
                });
            }
            
            if (template.type === 'RECURRING') {
                editScopeContainer.classList.remove('hidden-scope');
                editScopeCheckbox.checked = false; 
            } else {
                editScopeContainer.classList.add('hidden-scope');
            }

            handleRecurrenceToggle(); 
            document.querySelector('.task-form-content h2').innerText = 'Edit Quest';
            submitQuestBtn.innerText = 'Save';
            deleteQuestBtn.classList.remove('hidden-action-btn');
            toggleForm();

        } catch (error) { console.error("Erreur edit:", error); }
    }

    desktopToggleFormBtn.addEventListener('click', toggleForm);
    closeFormBtn.addEventListener('click', toggleForm);
    questTypeRadios.forEach(radio => radio.addEventListener('change', handleRecurrenceToggle));
    
    // --- DELETE LOGIC ---
    deleteQuestBtn.addEventListener('click', async () => {
        if (!currentEditTemplateId) return;
        
        const isRecurring = currentEditTemplateData && currentEditTemplateData.type === 'RECURRING';
        
        // CHECKBOX : si cochée => SERIES, sinon => SINGLE
        const deleteScope = editScopeCheckbox.checked ? 'SERIES' : 'SINGLE'; 
        
        try {
            if (isRecurring && deleteScope === 'SINGLE') {
                const todayString = formatDateString(new Date());
                await db.collection('quest_templates').doc(currentEditTemplateId).update({
                    exception_dates: firebase.firestore.FieldValue.arrayUnion(todayString)
                });
                console.log("Exception added for deletion");
            } 
            else {
                await db.collection('quest_templates').doc(currentEditTemplateId).delete();
                console.log("Template fully deleted");
            }

            toggleForm(); 
            await loadAndDisplayQuests();
        } catch (error) { console.error("Erreur delete:", error); }
    });

    // --- SUBMIT LOGIC ---
    questAddForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('questTitle').value;
        const type = document.querySelector('input[name="questType"]:checked').value;
        const dateString = document.getElementById('questDate').value;
        // --- NOUVEAU : Récupération des notes ---
        const notes = document.getElementById('questNotes').value;

        const targetDate = new Date(dateString);
        const recurrenceDays = Array.from(document.querySelectorAll('.day-selector input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));

        const formData = {
            title: title,
            notes: notes, // Ajout au template de données
            type: type,
            is_active: true,
            start_date: isNaN(targetDate.getTime()) ? null : firebase.firestore.Timestamp.fromDate(targetDate), 
            recurrence_rule: { daysOfWeek: type === 'RECURRING' ? recurrenceDays : [] },
            exception_dates: [] 
        };
        
        try {
            if (currentEditTemplateId) {
                // MODE EDITION
                const isRecurringOriginal = currentEditTemplateData && currentEditTemplateData.type === 'RECURRING';
                const editScope = editScopeCheckbox.checked ? 'SERIES' : 'SINGLE'; 

                if (isRecurringOriginal && editScope === 'SINGLE') {
                    const todayString = formatDateString(new Date());

                    // 1. Exception
                    await db.collection('quest_templates').doc(currentEditTemplateId).update({
                        exception_dates: firebase.firestore.FieldValue.arrayUnion(todayString)
                    });

                    // 2. Nouvelle quête (Daily)
                    formData.type = 'DAILY_ONLY';
                    formData.recurrence_rule = {}; 
                    formData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                    
                    await db.collection('quest_templates').add(formData);
                    console.log("Exception created: Splitting recurrence");
                } 
                else {
                    delete formData.exception_dates; 
                    delete formData.created_at; 
                    await db.collection('quest_templates').doc(currentEditTemplateId).update(formData);
                    console.log("Global update");
                }
            } else {
                // MODE CREATION
                formData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('quest_templates').add(formData);
            }
            await loadAndDisplayQuests(); 
            toggleForm(); 
        } catch (error) { console.error("Erreur submit:", error); }
    });

    handleRecurrenceToggle(); 
    loadAndDisplayQuests();
}
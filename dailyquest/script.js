// ==========================================
// 0. FIREBASE SETUP & SECURITY
// ==========================================

// TA CHAÎNE CRYPTÉE (fournie par l'utilisateur)
const ENCRYPTED_CONFIG = "U2FsdGVkX18mZec/cFVYe9asXI38d8kogEDARqxksKvt1xv7SM3K2yPa9OBFjZt0C9R4gd6ElKWawX3lTpFt0d8B3nLMgtibEW/VMawI1vb9EymX/9KqFn+jRCncgVT836j55eif4ItsGHEHMwjoU9WqcIC5jNusMXnt6uNcEF249C+A+KZ9RTPnFrfGmPHOhm7PMUCcZoOcxsiY1fynp+cOdRfInurnC+YAIACwPTqPhJdeHPFHiJyF6H0IP/JURMzwdJagCqYJvgQVa19rBGfcGjLEEOWaj7wN0DxY5wPsHsL96LXxn5LEXIPFFCDHOCDmdLBA3DP2dvDQZ5WMbGqwN42SNUqeZwVpPBKMFl+idGDK8b+1R8uTLgfDx3mQKjo5IcFmNZypUO9K/yfkI624YRJbI/AV7GCisx++8d6fJQXq/XvspjYTtBIdWJu+";

// Variables globales qui seront définies après le décryptage
let db;
let getTodayTimestamp, getDayOfWeek, formatDateString;

// Variables d'état pour le mode Édition
let currentEditTemplateId = null;
let currentEditTemplateData = null; 

// Éléments UI du Login
const loginOverlay = document.getElementById('loginOverlay');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');


// --- FONCTION D'INITIALISATION DE L'APP ---
function initApp(decryptedConfig) {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(decryptedConfig);
        }
        db = firebase.firestore();
        console.log("Firebase Initialized Successfully.");

        // Définition des utilitaires
        getTodayTimestamp = () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return firebase.firestore.Timestamp.fromDate(today);
        };
        getDayOfWeek = (date) => { const day = date.getDay(); return day === 0 ? 7 : day; };
        // Fonction utilitaire pour le mode Édition Instance Unique (Gestion des Exceptions)
        formatDateString = (date) => { return date.toISOString().split('T')[0]; }; 

        // Masquer l'écran de login
        loginOverlay.classList.add('hidden-overlay');
        
        // Démarrer la logique visuelle et logicielle
        startVisualsAndLogic();

    } catch (e) {
        console.error("Config Error:", e);
        // Si la config décryptée est invalide (mauvais mdp qui donne du charabia)
        localStorage.removeItem('dailyQuestKey'); // On nettoie
        loginError.style.display = 'block';
        loginError.innerText = "Decryption failed. Wrong password?";
    }
}


// --- LOGIQUE DE DÉCRYPTAGE ---
function tryLogin(password) {
    try {
        // Tente de décrypter
        const bytes = CryptoJS.AES.decrypt(ENCRYPTED_CONFIG, password);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        
        const config = JSON.parse(originalText); 
        
        // Si on arrive ici, le mot de passe est BON !
        // On sauvegarde le mot de passe dans le téléphone pour la prochaine fois
        localStorage.setItem('dailyQuestKey', password);
        
        initApp(config);
        
    } catch (error) {
        console.error("Login failed:", error);
        loginError.style.display = 'block';
        passwordInput.value = '';
    }
}

// --- AU CHARGEMENT DE LA PAGE (Auto-login) ---
const savedPassword = localStorage.getItem('dailyQuestKey');

if (savedPassword) {
    console.log("Auto-login...");
    tryLogin(savedPassword);
} else {
    console.log("Waiting for user login...");
}

// Écouteur sur le bouton Login
loginBtn.addEventListener('click', () => {
    const pass = passwordInput.value;
    if(pass) tryLogin(pass);
});

// Écouteur sur "Entrée" dans le champ
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const pass = passwordInput.value;
        if(pass) tryLogin(pass);
    }
});


// ==========================================
// TOUT LE CODE DE L'APPLICATION EST ICI
// ==========================================
function startVisualsAndLogic() {
    
    // ==========================================
    // 1. 3D PARTICLE SPHERE SYSTEM (Inchangé)
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
        const particleCount = 1000;
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
    // 2. UI LOGIC (TOGGLE & NAVIGATION) (Inchangé)
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
    // 3. QUEST LOGIC (Persistence)
    // ==========================================

    const questList = document.getElementById('questList'); 
    const progressBarFill = document.getElementById('progressBarFill');
    const progressEmoji = document.getElementById('progressEmoji');


    /**
     * Crée un élément de quête visuel et l'ajoute à la liste.
     */
    function displayQuest(id, title, isDone = false, type = 'DAILY_ONLY') {
        const li = document.createElement('li');
        li.className = `quest-item ${isDone ? 'completed' : ''}`;
        li.dataset.questId = id; 
        
        let typeClass = 'daily-type';
        if (type === 'WEEKLY') {
            typeClass = 'weekly-type';
        } else if (type === 'MONTHLY') {
            typeClass = 'monthly-type';
        } else if (type === 'RECURRING') {
            typeClass = 'daily-type'; 
        }
        li.classList.add(typeClass);

        li.innerHTML = `
            <span class="quest-text">${title}</span>
            <button class="check-btn"></button>
        `;

        // 1. Logique de Complétion/Dé-validation
        const checkBtn = li.querySelector('.check-btn');
        checkBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); 
            
            const isCurrentlyCompleted = li.classList.contains('completed');
            
            if (isCurrentlyCompleted) {
                // DÉ-VALIDATION (DELETE INSTANCE)
                try {
                    // Trouver l'instance complétée pour aujourd'hui
                    const instanceQuery = await db.collection('quest_instances')
                        .where('template_id', '==', id)
                        .where('date', '==', getTodayTimestamp())
                        .limit(1)
                        .get();
                    
                    if (!instanceQuery.empty) {
                        const instanceDocId = instanceQuery.docs[0].id;
                        await db.collection('quest_instances').doc(instanceDocId).delete();
                        
                        // Mise à jour de l'UI
                        li.classList.remove('completed');
                        updateProgress();
                    }
                    
                } catch (error) {
                    console.error("Erreur lors de la dé-validation:", error);
                }
                return;
            }

            // Validation (ADD INSTANCE)
            const questInstance = {
                template_id: id, 
                date: getTodayTimestamp(),
                is_completed: true,
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            try {
                await db.collection('quest_instances').add(questInstance);
                li.classList.add('completed');
                updateProgress();
            } catch (error) {
                console.error("Erreur lors de la validation:", error);
            }
        });
        
        // 2. Logique d'Édition
        li.addEventListener('click', () => {
            handleEditClick(id);
        });

        questList.appendChild(li); 
        updateProgress();
    }

    /**
     * Calcul les quêtes à afficher pour aujourd'hui en lisant Firestore.
     */
    async function loadAndDisplayQuests() {
        questList.innerHTML = ''; 
        const today = new Date();
        const todayDayOfWeek = getDayOfWeek(today); 
        const todayTimestamp = getTodayTimestamp();
        const todayString = formatDateString(today); 
        
        try {
            // 1. Récupération des templates
            const templatesSnapshot = await db.collection('quest_templates')
                .where('is_active', '==', true)
                .get();

            if (templatesSnapshot.empty) {
                updateProgress();
                return;
            }

            const templates = templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // 2. Récupération des instances (complétées)
            const instancesSnapshot = await db.collection('quest_instances')
                .where('date', '==', todayTimestamp)
                .where('is_completed', '==', true)
                .get();
                
            const completedTemplateIds = new Set(
                instancesSnapshot.docs.map(doc => doc.data().template_id)
            );
            
            // 3. Logique de calcul et d'affichage
            templates.forEach(template => {
                const isCompleted = completedTemplateIds.has(template.id);
                
                // Si la quête est complétée, on l'affiche directement.
                if (isCompleted) {
                    displayQuest(template.id, template.title, true, template.type);
                    return;
                }

                // Check exceptions (pour les non-complétées)
                if (template.type === 'RECURRING' && template.exception_dates && template.exception_dates.includes(todayString)) {
                    return;
                }

                let shouldDisplay = false;

                switch (template.type) {
                    case 'DAILY_ONLY':
                        shouldDisplay = true;
                        break;
                    case 'RECURRING':
                        if (template.recurrence_rule && template.recurrence_rule.daysOfWeek) {
                            shouldDisplay = template.recurrence_rule.daysOfWeek.includes(todayDayOfWeek);
                        }
                        break;
                    case 'WEEKLY':
                    case 'MONTHLY':
                        shouldDisplay = true;
                        break;
                }

                if (shouldDisplay) {
                    displayQuest(template.id, template.title, false, template.type);
                }
            });
        } catch (error) {
            console.error("Erreur lors du chargement des quêtes:", error);
        }

        updateProgress();
    }


    // Function qui calcule et met à jour la barre de progression
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

        progressBarFill.style.width = `${percentage}%`;

        let emoji = '';
        if (percentage === 100) { emoji = '🏆'; } 
        else if (percentage >= 80) { emoji = '🚀'; } 
        else if (percentage >= 60) { emoji = '💪'; } 
        else if (percentage >= 40) { emoji = '🔥'; } 
        else if (percentage >= 20) { emoji = '🌱'; } 
        else { emoji = '💧'; }
        progressEmoji.innerText = emoji;
    }


    // ==========================================
    // 4. UI LOGIC: ADD/EDIT/DELETE QUEST FORM
    // ==========================================

    const desktopToggleFormBtn = document.getElementById('desktopToggleFormBtn');
    const taskForm = document.getElementById('taskForm');
    const closeFormBtn = document.getElementById('closeFormBtn'); 
    const desktopAddBtnArea = document.getElementById('desktopAddBtnArea');
    const questAddForm = document.getElementById('questAddForm');
    const questTypeRadios = document.querySelectorAll('input[name="questType"]');
    const recurrenceOptions = document.getElementById('recurrenceOptions');
    const questDateInput = document.getElementById('questDate'); 
    const questNotesInput = document.getElementById('questNotes'); 
    const submitQuestBtn = document.getElementById('submitQuestBtn'); 
    const deleteQuestBtn = document.getElementById('deleteQuestBtn'); 

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
        questNotesInput.value = '';

        if (editScopeContainer && editScopeCheckbox) {
            editScopeContainer.classList.add('hidden-scope'); 
            editScopeCheckbox.checked = false; 
        }
        
        document.getElementById('typeDaily').checked = true;
        handleRecurrenceToggle(); 
    }


    function toggleForm() {
        taskForm.classList.toggle('open');
        const isOpen = taskForm.classList.contains('open');

        desktopToggleFormBtn.innerText = isOpen ? 'Close Form' : 'New Quest';
        
        if (!isOpen) {
            desktopAddBtnArea.style.opacity = '1';
            desktopAddBtnArea.style.pointerEvents = 'auto';
            resetFormToCreateMode(); 
        } else {
            if (currentEditTemplateId === null) {
                resetFormToCreateMode();
            }
        }
    }


    function handleRecurrenceToggle() {
        const selectedType = document.querySelector('input[name="questType"]:checked').value;
        
        if (selectedType === 'RECURRING') {
            recurrenceOptions.classList.remove('hidden-recurrence');
        } else {
            recurrenceOptions.classList.add('hidden-recurrence');
        }

        let colorClass = '';
        if (selectedType === 'WEEKLY') {
            colorClass = 'weekly-type-btn';
        } else if (selectedType === 'MONTHLY') {
            colorClass = 'monthly-type-btn';
        } else {
            colorClass = 'daily-type-btn';
        }

        submitQuestBtn.classList.remove('daily-type-btn', 'weekly-type-btn', 'monthly-type-btn');
        submitQuestBtn.classList.add(colorClass);
        desktopToggleFormBtn.classList.remove('daily-type-btn', 'weekly-type-btn', 'monthly-type-btn');
        desktopToggleFormBtn.classList.add(colorClass);
    }


    async function handleEditClick(templateId) {
        try {
            const doc = await db.collection('quest_templates').doc(templateId).get(); 
            if (!doc.exists) return;

            const template = doc.data();
            currentEditTemplateId = templateId; 
            currentEditTemplateData = template;

            document.getElementById('questTitle').value = template.title;
            questNotesInput.value = template.notes || '';
            
            let dateValue = '';
            if (template.start_date && template.start_date.toDate) {
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
            
            handleRecurrenceToggle(); 
            document.querySelector('.task-form-content h2').innerText = 'Edit Quest';
            submitQuestBtn.innerText = 'Save';
            deleteQuestBtn.classList.remove('hidden-action-btn');

            if (template.type === 'RECURRING') {
                editScopeContainer.classList.remove('hidden-scope');
                editScopeCheckbox.checked = false; 
            } else {
                editScopeContainer.classList.add('hidden-scope');
            }

            toggleForm();

        } catch (error) {
            console.error("Erreur chargement quête:", error);
        }
    }


    desktopToggleFormBtn.addEventListener('click', toggleForm);
    closeFormBtn.addEventListener('click', toggleForm);
    questTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleRecurrenceToggle);
    });
    
    // --- SUPPRESSION : RETRAIT DU CONFIRM() ---
    deleteQuestBtn.addEventListener('click', async () => {
        if (!currentEditTemplateId) return;

        // ON SUPPRIME DIRECTEMENT SANS CONFIRMATION
        try {
            await db.collection('quest_templates').doc(currentEditTemplateId).delete();
            console.log(`Template deleted: ${currentEditTemplateId}`);

            toggleForm(); 
            await loadAndDisplayQuests();

        } catch (error) {
            console.error("Erreur suppression:", error);
            // Pas d'alerte non plus
        }
    });


    // Logique de Soumission (ADD/UPDATE)
    questAddForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('questTitle').value;
        const type = document.querySelector('input[name="questType"]:checked').value;
        const dateString = document.getElementById('questDate').value;
        const notes = questNotesInput.value; 
        
        const targetDate = new Date(dateString);
        const recurrenceDays = Array.from(document.querySelectorAll('.day-selector input[type="checkbox"]:checked'))
                                   .map(cb => parseInt(cb.value));

        const templateData = {
            title: title,
            notes: notes, 
            type: type,
            is_active: true,
            start_date: isNaN(targetDate.getTime()) ? null : firebase.firestore.Timestamp.fromDate(targetDate), 
            recurrence_rule: {
                daysOfWeek: type === 'RECURRING' ? recurrenceDays : [],
            },
            exception_dates: currentEditTemplateData ? currentEditTemplateData.exception_dates || [] : []
        };
        
        try {
            if (currentEditTemplateId) {
                // UPDATE
                const isRecurringOriginal = currentEditTemplateData && currentEditTemplateData.type === 'RECURRING';
                const editScope = editScopeCheckbox.checked ? 'SERIES' : 'SINGLE'; 

                if (isRecurringOriginal && editScope === 'SINGLE') {
                    const todayString = formatDateString(new Date()); 
                    
                    await db.collection('quest_templates').doc(currentEditTemplateId).update({
                        exception_dates: firebase.firestore.FieldValue.arrayUnion(todayString)
                    });

                    const newQuestData = {...templateData};
                    newQuestData.type = 'DAILY_ONLY';
                    newQuestData.recurrence_rule = {}; 
                    newQuestData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                    delete newQuestData.exception_dates;
                    
                    await db.collection('quest_templates').add(newQuestData);
                    console.log("Exception created");
                } 
                else {
                    delete templateData.exception_dates; 
                    delete templateData.created_at; 
                    await db.collection('quest_templates').doc(currentEditTemplateId).update(templateData);
                }
            } else {
                // CREATE
                templateData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                delete templateData.exception_dates;
                await db.collection('quest_templates').add(templateData);
            }
            
            await loadAndDisplayQuests(); 
            toggleForm(); 
            
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
        }
    });


    // ==========================================
    // 5. BOOTSTRAP
    // ==========================================

    handleRecurrenceToggle(); 
    loadAndDisplayQuests();
}
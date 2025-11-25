// ==========================================
// 0. FIREBASE SETUP & SECURITY
// ==========================================

// TA CHAÎNE CRYPTÉE (fournie par l'utilisateur)
const ENCRYPTED_CONFIG = "U2FsdGVkX18F8Ppeh2sKQ/WaeBmIzEPfzOQKTGCTlYbCiszus8i/42WIXRATVAn0A3iIgM+B1WxWHBzL9KBE8kbzfY9ZEKNKQ739DUb2kBSlEcIUp50WXuC+VT4xhkm0MMutu7gUu7cWjDlY6zXIXhKJ3BySA75b3LKqT8vkukKQx6CuxV8oJXHrT7EskK4GxEhd1gknCHJ7QdGNgQgakpUi/mcqQvf+4C7bOEkLNlL6UvoWHNIARkB5J1y/JiGNBIeJZI7oG9VkRclHIIcos2bsgAnQ0jNm0SpgmuCx8nvT/nDAkR4QWwTYZ+Lw51OEDIj4mxbLFT4IxdN+oEHiQijl57Z/yopUVHDndQPSgo5yX5rpWxES8CqTy2I4EEyMKA687AMfVyt5HPl14WQnmP2G0amm/HKzf35qVABPCKfgD99Zhr9DHK6tDNdiB/FT"; 

// Variables globales qui seront définies après le décryptage
let db;
let getTodayTimestamp, getDayOfWeek, formatDateString;

// Variables d'état pour le mode Édition
let currentEditTemplateId = null;
let currentEditTemplateData = null; // Pour gérer la logique Série/Instance unique

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

        // 1. Logique de Complétion (Écriture dans Firestore)
        const checkBtn = li.querySelector('.check-btn');
        checkBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); 
            
            const isCurrentlyCompleted = li.classList.contains('completed');
            
            if (isCurrentlyCompleted) {
                console.warn("La dé-validation n'est pas encore implémentée dans Firestore.");
                return;
            }

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
                console.error("Erreur lors de la validation de la quête:", error);
                alert("Erreur lors de la validation de la quête.");
            }
        });
        
        // 2. Logique d'Édition (Clic sur le reste de la ligne)
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
        const todayString = formatDateString(today); // Pour check l'exception
        
        try {
            // 1. Récupération des templates de quête actifs
            const templatesSnapshot = await db.collection('quest_templates')
                .where('is_active', '==', true)
                .get();

            if (templatesSnapshot.empty) {
                updateProgress();
                return;
            }

            const templates = templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // 2. Récupération des instances complétées pour aujourd'hui
            const instancesSnapshot = await db.collection('quest_instances')
                .where('date', '==', todayTimestamp)
                .where('is_completed', '==', true)
                .get();
                
            const completedTemplateIds = new Set(
                instancesSnapshot.docs.map(doc => doc.data().template_id)
            );
            

            // 3. Logique de calcul et d'affichage pour aujourd'hui
            templates.forEach(template => {
                
                if (completedTemplateIds.has(template.id)) {
                    return;
                }

                // Check pour les exceptions sur les quêtes récurrentes
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
            console.error("Erreur critique lors du chargement initial des quêtes:", error);
            alert("Erreur lors du chargement initial des quêtes. Vérifiez vos règles Firestore.");
        }

        updateProgress();
    }


    // Function qui calcule et met à jour la barre de progression et l'emoji
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


    // ==========================================
    // 4. UI LOGIC: ADD/EDIT/DELETE QUEST FORM (MODIFIÉ)
    // ==========================================

    const desktopToggleFormBtn = document.getElementById('desktopToggleFormBtn');
    const taskForm = document.getElementById('taskForm');
    const closeFormBtn = document.getElementById('closeFormBtn'); 
    const desktopAddBtnArea = document.getElementById('desktopAddBtnArea');
    const questAddForm = document.getElementById('questAddForm');
    const questTypeRadios = document.querySelectorAll('input[name="questType"]');
    const recurrenceOptions = document.getElementById('recurrenceOptions');
    const questDateInput = document.getElementById('questDate'); 
    const questNotesInput = document.getElementById('questNotes'); // NOUVEAU
    const submitQuestBtn = document.getElementById('submitQuestBtn'); 
    const deleteQuestBtn = document.getElementById('deleteQuestBtn'); 

    // Éléments pour le Scope d'édition (Instance vs Série)
    const editScopeContainer = document.getElementById('editScopeContainer'); 
    const editScopeCheckbox = document.getElementById('editScopeCheckbox'); 


    // Set today's date as default
    questDateInput.valueAsDate = new Date();


    // Fonction pour réinitialiser le formulaire au mode Création
    function resetFormToCreateMode() {
        currentEditTemplateId = null;
        currentEditTemplateData = null; // Reset
        document.getElementById('questAddForm').reset();
        document.getElementById('questDate').valueAsDate = new Date();
        
        document.querySelector('.task-form-content h2').innerText = 'Add New Quest';
        
        submitQuestBtn.innerText = 'Add Quest';
        deleteQuestBtn.classList.add('hidden-action-btn');
        
        // Reset des notes
        questNotesInput.value = '';

        // Reset scope controls
        if (editScopeContainer && editScopeCheckbox) {
            editScopeContainer.classList.add('hidden-scope'); 
            editScopeCheckbox.checked = false; 
        }
        
        document.getElementById('typeDaily').checked = true;
        handleRecurrenceToggle(); 
    }


    // Fonction pour gérer l'ouverture/fermeture et le reset du formulaire
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


    // Fonction pour gérer l'affichage de la récurrence ET la couleur du bouton
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


    /**
     * Gère le clic sur une quête pour ouvrir le formulaire en mode édition.
     */
    async function handleEditClick(templateId) {
        try {
            const doc = await db.collection('quest_templates').doc(templateId).get(); 
            
            if (!doc.exists) return;

            const template = doc.data();
            currentEditTemplateId = templateId; 
            currentEditTemplateData = template; // Stocke pour la logique de soumission

            // 1. Remplir les champs du formulaire
            document.getElementById('questTitle').value = template.title;
            questNotesInput.value = template.notes || ''; // Remplir les notes
            
            let dateValue = '';
            if (template.start_date && template.start_date.toDate) {
                dateValue = template.start_date.toDate().toISOString().split('T')[0];
            }
            document.getElementById('questDate').value = dateValue;

            // Type
            const typeId = `type${template.type.charAt(0).toUpperCase() + template.type.slice(1).toLowerCase()}`;
            const radio = document.getElementById(typeId);
            if (radio) radio.checked = true;
            
            // Jours de récurrence
            document.querySelectorAll('.day-selector input[type="checkbox"]').forEach(cb => cb.checked = false);
            if (template.type === 'RECURRING' && template.recurrence_rule && template.recurrence_rule.daysOfWeek) {
                template.recurrence_rule.daysOfWeek.forEach(day => {
                    const dayInput = document.querySelector(`.day-selector input[value="${day}"]`);
                    if (dayInput) dayInput.checked = true;
                });
            }
            
            // 2. Mettre à jour l'UI du formulaire en mode Édition
            handleRecurrenceToggle(); 
            document.querySelector('.task-form-content h2').innerText = 'Edit Quest';
            submitQuestBtn.innerText = 'Save';
            deleteQuestBtn.classList.remove('hidden-action-btn');

            // Afficher la portée d'édition si c'est une quête récurrente
            if (template.type === 'RECURRING') {
                editScopeContainer.classList.remove('hidden-scope');
                editScopeCheckbox.checked = false; 
            } else {
                editScopeContainer.classList.add('hidden-scope');
            }

            // 3. Ouvrir le modal
            toggleForm();

        } catch (error) {
            console.error("Erreur détaillée lors du chargement de la quête:", error);
            alert("Erreur lors du chargement de la quête pour modification. (Voir la console pour plus de détails)"); 
        }
    }


    // Attacher les écouteurs de base
    desktopToggleFormBtn.addEventListener('click', toggleForm);
    closeFormBtn.addEventListener('click', toggleForm);
    questTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleRecurrenceToggle);
    });
    deleteQuestBtn.addEventListener('click', async () => {
        if (!currentEditTemplateId) return;

        if (!confirm("Are you sure you want to delete this quest permanently? This will delete the recurring rule (Delete All).")) {
            return;
        }

        try {
            await db.collection('quest_templates').doc(currentEditTemplateId).delete();
            console.log(`Template deleted: ${currentEditTemplateId}`);

            toggleForm(); 
            await loadAndDisplayQuests();

        } catch (error) {
            console.error("Erreur lors de la suppression de la quête:", error);
            alert("An error occurred while deleting the quest.");
        }
    });


    // Logique de Soumission: Gère l'ADD et l'UPDATE
    questAddForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('questTitle').value;
        const type = document.querySelector('input[name="questType"]:checked').value;
        const dateString = document.getElementById('questDate').value;
        const notes = questNotesInput.value; // Récupération des notes
        
        const targetDate = new Date(dateString);
        const recurrenceDays = Array.from(document.querySelectorAll('.day-selector input[type="checkbox"]:checked'))
                                   .map(cb => parseInt(cb.value));

        const templateData = {
            title: title,
            notes: notes, // Ajout des notes
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
                // MODE EDITION
                const isRecurringOriginal = currentEditTemplateData && currentEditTemplateData.type === 'RECURRING';
                const editScope = editScopeCheckbox.checked ? 'SERIES' : 'SINGLE'; 

                if (isRecurringOriginal && editScope === 'SINGLE') {
                    const todayString = formatDateString(new Date()); 
                    
                    // 1. Créer une exception sur le template original
                    await db.collection('quest_templates').doc(currentEditTemplateId).update({
                        exception_dates: firebase.firestore.FieldValue.arrayUnion(todayString)
                    });

                    // 2. Créer une nouvelle quête de type DAILY_ONLY pour cette instance modifiée
                    const newQuestData = {...templateData};
                    newQuestData.type = 'DAILY_ONLY';
                    newQuestData.recurrence_rule = {}; 
                    newQuestData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                    delete newQuestData.exception_dates;
                    
                    await db.collection('quest_templates').add(newQuestData);
                    console.log("Exception created: Splitting recurrence");
                } 
                else {
                    // Update Series (ou quête non récurrente)
                    delete templateData.exception_dates; 
                    delete templateData.created_at; 
                    await db.collection('quest_templates').doc(currentEditTemplateId).update(templateData);
                    console.log(`Quest Template updated: ${currentEditTemplateId}`);
                }
                alert('Quest updated successfully!');
            } else {
                // MODE CREATION
                templateData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                delete templateData.exception_dates;
                await db.collection('quest_templates').add(templateData);
                console.log(`New Quest Template created: ${title}`);
                alert('Quest created successfully!');
            }
            
            await loadAndDisplayQuests(); 
            toggleForm(); 
            
        } catch (error) {
            console.error(`Error during quest ${currentEditTemplateId ? 'update' : 'creation'}:`, error);
            alert(`An error occurred while ${currentEditTemplateId ? 'updating' : 'adding'} the quest.`);
        }
    });


    // ==========================================
    // 5. BOOTSTRAP (Lancement des fonctions initiales)
    // ==========================================

    handleRecurrenceToggle(); 
    loadAndDisplayQuests();
} // Fin de startVisualsAndLogic()
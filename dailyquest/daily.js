// ==========================================
// MODULE DAILY QUESTS
// Gère l'affichage, l'ajout, la modification et la suppression des quêtes.
// ==========================================

const DailyLogic = {
    db: null,
    
    // Variables d'état
    currentEditTemplateId: null,
    currentEditTemplateData: null,

    // Éléments DOM (seront initialisés dans init)
    elements: {},

    // --- INITIALISATION ---
    init: function(database) {
        this.db = database;
        this.cacheDOM();
        this.bindEvents();
        this.loadAndDisplayQuests();
        console.log("Daily Logic Initialized");
    },

    // Récupération des références DOM
    cacheDOM: function() {
        this.elements = {
            questList: document.getElementById('questList'),
            progressBarFill: document.getElementById('progressBarFill'),
            progressEmoji: document.getElementById('progressEmoji'),
            
            // Formulaire & Boutons
            taskForm: document.getElementById('taskForm'),
            questAddForm: document.getElementById('questAddForm'),
            desktopToggleFormBtn: document.getElementById('desktopToggleFormBtn'),
            closeFormBtn: document.getElementById('closeFormBtn'),
            desktopAddBtnArea: document.getElementById('desktopAddBtnArea'),
            submitQuestBtn: document.getElementById('submitQuestBtn'),
            deleteQuestBtn: document.getElementById('deleteQuestBtn'),
            
            // Inputs
            questTitle: document.getElementById('questTitle'),
            questDate: document.getElementById('questDate'),
            questNotes: document.getElementById('questNotes'),
            questTypeRadios: document.querySelectorAll('input[name="questType"]'),
            recurrenceOptions: document.getElementById('recurrenceOptions'),
            dayCheckboxes: document.querySelectorAll('.day-selector input[type="checkbox"]'),
            
            // Scope Edit
            editScopeContainer: document.getElementById('editScopeContainer'),
            editScopeCheckbox: document.getElementById('editScopeCheckbox')
        };
        
        // Set default date
        this.elements.questDate.valueAsDate = new Date();
    },

    // Attachement des événements
    bindEvents: function() {
        const el = this.elements;

        // Toggle Form
        el.desktopToggleFormBtn.addEventListener('click', () => this.toggleForm());
        el.closeFormBtn.addEventListener('click', () => this.toggleForm());

        // Recurrence Toggle
        el.questTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleRecurrenceToggle());
        });

        // Delete
        el.deleteQuestBtn.addEventListener('click', () => this.handleDelete());

        // Submit (Add/Edit)
        el.questAddForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Initial setup UI
        this.handleRecurrenceToggle();
    },

    // --- UTILITAIRES DE DATE ---
    getTodayTimestamp: function() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return firebase.firestore.Timestamp.fromDate(today);
    },

    getDayOfWeek: function(date) {
        const day = date.getDay();
        return day === 0 ? 7 : day;
    },

    formatDateString: function(date) {
        return date.toISOString().split('T')[0];
    },


    // --- AFFICHAGE ET LOGIQUE MÉTIER ---

    loadAndDisplayQuests: async function() {
        const el = this.elements;
        el.questList.innerHTML = ''; 
        
        const today = new Date();
        const todayDayOfWeek = this.getDayOfWeek(today); 
        const todayTimestamp = this.getTodayTimestamp();
        const todayString = this.formatDateString(today); 
        
        try {
            // 1. Templates actifs
            const templatesSnapshot = await this.db.collection('quest_templates')
                .where('is_active', '==', true)
                .get();

            if (templatesSnapshot.empty) {
                this.updateProgress();
                return;
            }

            const templates = templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // 2. Instances complétées aujourd'hui
            const instancesSnapshot = await this.db.collection('quest_instances')
                .where('date', '==', todayTimestamp)
                .where('is_completed', '==', true)
                .get();
                
            const completedTemplateIds = new Set(
                instancesSnapshot.docs.map(doc => doc.data().template_id)
            );
            
            // 3. Filtrage et Affichage
            templates.forEach(template => {
                const isCompleted = completedTemplateIds.has(template.id);
                
                // Si complété, on affiche direct
                if (isCompleted) {
                    this.createQuestElement(template.id, template.title, true, template.type);
                    return;
                }

                // Check exceptions
                if (template.type === 'RECURRING' && template.exception_dates && template.exception_dates.includes(todayString)) {
                    return;
                }

                let shouldDisplay = false;
                switch (template.type) {
                    case 'DAILY_ONLY': shouldDisplay = true; break;
                    case 'RECURRING':
                        if (template.recurrence_rule && template.recurrence_rule.daysOfWeek) {
                            shouldDisplay = template.recurrence_rule.daysOfWeek.includes(todayDayOfWeek);
                        }
                        break;
                    case 'WEEKLY':
                    case 'MONTHLY': shouldDisplay = true; break;
                }

                if (shouldDisplay) {
                    this.createQuestElement(template.id, template.title, false, template.type);
                }
            });
        } catch (error) {
            console.error("Erreur loadAndDisplayQuests:", error);
        }
        this.updateProgress();
    },

    createQuestElement: function(id, title, isDone, type) {
        const li = document.createElement('li');
        li.className = `quest-item ${isDone ? 'completed' : ''}`;
        li.dataset.questId = id; 
        
        let typeClass = 'daily-type';
        if (type === 'WEEKLY') typeClass = 'weekly-type';
        else if (type === 'MONTHLY') typeClass = 'monthly-type';
        li.classList.add(typeClass);

        li.innerHTML = `
            <span class="quest-text">${title}</span>
            <button class="check-btn"></button>
        `;

        // Click Check
        const checkBtn = li.querySelector('.check-btn');
        checkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleQuestCompletion(id, li);
        });
        
        // Click Edit
        li.addEventListener('click', () => this.handleEditClick(id));

        this.elements.questList.appendChild(li); 
        this.updateProgress();
    },

    toggleQuestCompletion: async function(id, liElement) {
        const isCurrentlyCompleted = liElement.classList.contains('completed');
        
        if (isCurrentlyCompleted) {
            // Dé-validation
            try {
                const instanceQuery = await this.db.collection('quest_instances')
                    .where('template_id', '==', id)
                    .where('date', '==', this.getTodayTimestamp())
                    .limit(1)
                    .get();
                
                if (!instanceQuery.empty) {
                    await this.db.collection('quest_instances').doc(instanceQuery.docs[0].id).delete();
                    liElement.classList.remove('completed');
                    this.updateProgress();
                }
            } catch (error) { console.error("Error unchecking:", error); }
        } else {
            // Validation
            try {
                await this.db.collection('quest_instances').add({
                    template_id: id, 
                    date: this.getTodayTimestamp(),
                    is_completed: true,
                    created_at: firebase.firestore.FieldValue.serverTimestamp()
                });
                liElement.classList.add('completed');
                this.updateProgress();
            } catch (error) { console.error("Error checking:", error); }
        }
    },

    updateProgress: function() {
        const allQuests = this.elements.questList.querySelectorAll('.quest-item');
        if (allQuests.length === 0) {
            this.elements.progressBarFill.style.width = '0%';
            this.elements.progressEmoji.innerText = '😴'; 
            return;
        }

        const completedQuests = this.elements.questList.querySelectorAll('.quest-item.completed').length;
        const totalQuests = allQuests.length;
        const percentage = Math.round((completedQuests / totalQuests) * 100);

        this.elements.progressBarFill.style.width = `${percentage}%`;

        let emoji = '💧';
        if (percentage === 100) emoji = '🏆';
        else if (percentage >= 80) emoji = '🚀';
        else if (percentage >= 60) emoji = '💪';
        else if (percentage >= 40) emoji = '🔥';
        else if (percentage >= 20) emoji = '🌱';
        this.elements.progressEmoji.innerText = emoji;
    },

    // --- GESTION DU FORMULAIRE ---

    toggleForm: function() {
        const el = this.elements;
        el.taskForm.classList.toggle('open');
        const isOpen = el.taskForm.classList.contains('open');

        el.desktopToggleFormBtn.innerText = isOpen ? 'Close Form' : 'New Quest';
        
        if (!isOpen) {
            el.desktopAddBtnArea.style.opacity = '1';
            el.desktopAddBtnArea.style.pointerEvents = 'auto';
            this.resetFormToCreateMode(); 
        } else {
            if (this.currentEditTemplateId === null) {
                this.resetFormToCreateMode();
            }
        }
    },

    resetFormToCreateMode: function() {
        this.currentEditTemplateId = null;
        this.currentEditTemplateData = null;
        this.elements.questAddForm.reset();
        this.elements.questDate.valueAsDate = new Date();
        
        document.querySelector('.task-form-content h2').innerText = 'Add New Quest';
        this.elements.submitQuestBtn.innerText = 'Add Quest';
        this.elements.deleteQuestBtn.classList.add('hidden-action-btn');
        this.elements.questNotes.value = '';

        this.elements.editScopeContainer.classList.add('hidden-scope'); 
        this.elements.editScopeCheckbox.checked = false; 
        
        document.getElementById('typeDaily').checked = true;
        this.handleRecurrenceToggle();
    },

    handleRecurrenceToggle: function() {
        const selectedType = document.querySelector('input[name="questType"]:checked').value;
        const el = this.elements;
        
        if (selectedType === 'RECURRING') {
            el.recurrenceOptions.classList.remove('hidden-recurrence');
        } else {
            el.recurrenceOptions.classList.add('hidden-recurrence');
        }

        let colorClass = 'daily-type-btn';
        if (selectedType === 'WEEKLY') colorClass = 'weekly-type-btn';
        else if (selectedType === 'MONTHLY') colorClass = 'monthly-type-btn';

        el.submitQuestBtn.classList.remove('daily-type-btn', 'weekly-type-btn', 'monthly-type-btn');
        el.submitQuestBtn.classList.add(colorClass);
        el.desktopToggleFormBtn.classList.remove('daily-type-btn', 'weekly-type-btn', 'monthly-type-btn');
        el.desktopToggleFormBtn.classList.add(colorClass);
    },

    handleEditClick: async function(templateId) {
        try {
            const doc = await this.db.collection('quest_templates').doc(templateId).get(); 
            if (!doc.exists) return;

            const template = doc.data();
            this.currentEditTemplateId = templateId; 
            this.currentEditTemplateData = template;

            const el = this.elements;
            el.questTitle.value = template.title;
            el.questNotes.value = template.notes || '';
            
            if (template.start_date && template.start_date.toDate) {
                el.questDate.value = template.start_date.toDate().toISOString().split('T')[0];
            }

            const typeId = `type${template.type.charAt(0).toUpperCase() + template.type.slice(1).toLowerCase()}`;
            const radio = document.getElementById(typeId);
            if (radio) radio.checked = true;
            
            el.dayCheckboxes.forEach(cb => cb.checked = false);
            if (template.type === 'RECURRING' && template.recurrence_rule && template.recurrence_rule.daysOfWeek) {
                template.recurrence_rule.daysOfWeek.forEach(day => {
                    const dayInput = document.querySelector(`.day-selector input[value="${day}"]`);
                    if (dayInput) dayInput.checked = true;
                });
            }
            
            this.handleRecurrenceToggle(); 
            document.querySelector('.task-form-content h2').innerText = 'Edit Quest';
            el.submitQuestBtn.innerText = 'Save';
            el.deleteQuestBtn.classList.remove('hidden-action-btn');

            if (template.type === 'RECURRING') {
                el.editScopeContainer.classList.remove('hidden-scope');
                el.editScopeCheckbox.checked = false; 
            } else {
                el.editScopeContainer.classList.add('hidden-scope');
            }

            this.toggleForm();

        } catch (error) { console.error("Error loading edit:", error); }
    },

    handleDelete: async function() {
        if (!this.currentEditTemplateId) return;
        try {
            await this.db.collection('quest_templates').doc(this.currentEditTemplateId).delete();
            this.toggleForm(); 
            this.loadAndDisplayQuests();
        } catch (error) { console.error("Error delete:", error); }
    },

    handleSubmit: async function(e) {
        e.preventDefault();
        const el = this.elements;
        
        const title = el.questTitle.value;
        const type = document.querySelector('input[name="questType"]:checked').value;
        const dateString = el.questDate.value;
        const notes = el.questNotes.value; 
        
        const targetDate = new Date(dateString);
        const recurrenceDays = Array.from(document.querySelectorAll('.day-selector input[type="checkbox"]:checked'))
                                   .map(cb => parseInt(cb.value));

        const templateData = {
            title: title, notes: notes, type: type, is_active: true,
            start_date: isNaN(targetDate.getTime()) ? null : firebase.firestore.Timestamp.fromDate(targetDate), 
            recurrence_rule: { daysOfWeek: type === 'RECURRING' ? recurrenceDays : [] },
            exception_dates: this.currentEditTemplateData ? this.currentEditTemplateData.exception_dates || [] : []
        };
        
        try {
            if (this.currentEditTemplateId) {
                // UPDATE
                const isRecurringOriginal = this.currentEditTemplateData && this.currentEditTemplateData.type === 'RECURRING';
                const editScope = el.editScopeCheckbox.checked ? 'SERIES' : 'SINGLE'; 

                if (isRecurringOriginal && editScope === 'SINGLE') {
                    // Exception Logic
                    const todayString = this.formatDateString(new Date()); 
                    await this.db.collection('quest_templates').doc(this.currentEditTemplateId).update({
                        exception_dates: firebase.firestore.FieldValue.arrayUnion(todayString)
                    });

                    const newQuestData = {...templateData};
                    newQuestData.type = 'DAILY_ONLY';
                    newQuestData.recurrence_rule = {}; 
                    newQuestData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                    delete newQuestData.exception_dates;
                    
                    await this.db.collection('quest_templates').add(newQuestData);
                } else {
                    delete templateData.exception_dates; 
                    delete templateData.created_at; 
                    await this.db.collection('quest_templates').doc(this.currentEditTemplateId).update(templateData);
                }
            } else {
                // CREATE
                templateData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                delete templateData.exception_dates;
                await this.db.collection('quest_templates').add(templateData);
            }
            
            this.loadAndDisplayQuests(); 
            this.toggleForm(); 
        } catch (error) { console.error("Error submit:", error); }
    }
};
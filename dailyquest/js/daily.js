// ==========================================
// MODULE DAILY QUESTS
// Core logic for managing daily, weekly, and monthly quests.
// Handles CRUD operations, status hydration, and UI rendering.
// ==========================================

/**
 * Main Logic Object for Daily Quests
 * @namespace DailyLogic
 */
const DailyLogic = {
    db: null,
    viewDate: new Date(),
    elements: {},

    // Local State
    currentLogData: null,
    virtualTasks: [],
    templatesCache: {},

    /**
     * Initialize the module
     * @param {Object} database - Firebase Firestore instance
     */
    init: function (database) {
        this.db = database;
        this.cacheDOM();
        this.bindEvents();
        this.resetToToday();
    },

    cacheDOM: function () {
        this.elements = {
            questList: document.getElementById('questList'),
            progressBarFill: document.getElementById('progressBarFill'),
            progressEmoji: document.getElementById('progressEmoji'),
            periodToggle: document.getElementById('period-toggle'),

            taskForm: document.getElementById('taskForm'),
            questAddForm: document.getElementById('questAddForm'),
            desktopToggleFormBtn: document.getElementById('desktopToggleFormBtn'),
            closeFormBtn: document.getElementById('closeFormBtn'),
            desktopAddBtnArea: document.getElementById('desktopAddBtnArea'),
            submitQuestBtn: document.getElementById('submitQuestBtn'),
            deleteQuestBtn: document.getElementById('deleteQuestBtn'),

            // Form Fields
            questTitle: document.getElementById('questTitle'),
            questDate: document.getElementById('questDate'),
            questNotes: document.getElementById('questNotes'),
            questTypeRadios: document.querySelectorAll('input[name="questType"]'),
            recurrenceOptions: document.getElementById('recurrenceOptions'),
            dayCheckboxes: document.querySelectorAll('.day-selector input[type="checkbox"]'),

            editScopeContainer: document.getElementById('editScopeContainer'),
            editScopeCheckbox: document.getElementById('editScopeCheckbox'),

            // Advanced Options
            toggleAdvancedBtn: document.getElementById('toggleAdvancedBtn'),
            advancedOptions: document.getElementById('advancedOptions'),
            questTarget: document.getElementById('questTarget'),
            targetValue: document.getElementById('targetValue')
        };
    },

    bindEvents: function () {
        const el = this.elements;

        // --- NEW QUEST BUTTON ---
        el.desktopToggleFormBtn.addEventListener('click', () => {
            if (!el.taskForm.classList.contains('open')) {
                this.resetFormToCreateMode();
            }
            this.toggleForm();
        });

        el.closeFormBtn.addEventListener('click', () => this.toggleForm());

        // --- TOGGLE ADVANCED OPTIONS ---
        if (el.toggleAdvancedBtn) {
            el.toggleAdvancedBtn.addEventListener('click', () => {
                const isHidden = el.advancedOptions.classList.contains('hidden-advanced');
                if (isHidden) {
                    el.advancedOptions.classList.remove('hidden-advanced');
                    el.advancedOptions.classList.add('visible-advanced');
                    el.toggleAdvancedBtn.classList.add('open');
                } else {
                    el.advancedOptions.classList.add('hidden-advanced');
                    el.advancedOptions.classList.remove('visible-advanced');
                    el.toggleAdvancedBtn.classList.remove('open');
                }
            });
        }

        el.questTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleRecurrenceToggle());
        });
        el.deleteQuestBtn.addEventListener('click', () => this.handleDelete());
        el.questAddForm.addEventListener('submit', (e) => this.handleSubmit(e));

        // Slider Listener
        if (el.questTarget) {
            el.questTarget.addEventListener('input', (e) => {
                if (el.targetValue) el.targetValue.innerText = e.target.value;
            });
        }

        this.handleRecurrenceToggle();
    },

    // --- DATE UTILITIES ---

    /**
     * Converts a date object to YYYY-MM-DD string in local time.
     * @param {Date} date 
     * @returns {string}
     */
    toLocalYMD: function (date) {
        const d = new Date(date);
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    },

    /**
     * Generates a unique Period ID for Weekly/Monthly tracking.
     * @param {Date} d - The date to check
     * @param {string} type - 'WEEKLY' or 'MONTHLY'
     * @returns {string|null} e.g. "2025-W48"
     */
    getPeriodID: function (d, type) {
        const date = new Date(d);
        const year = date.getFullYear();

        if (type === 'MONTHLY') {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            return `${year}-M${month}`;
        }
        else if (type === 'WEEKLY') {
            const target = new Date(date.valueOf());
            const dayNr = (date.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            const firstThursday = target.valueOf();
            target.setMonth(0, 1);
            if (target.getDay() !== 4) {
                target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
            }
            const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
            return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
        }
        return null;
    },

    // --- NAVIGATION ---
    setViewDate: function (date) {
        this.viewDate = new Date(date);
        this.updateTitle();
        this.loadAndDisplayQuests();
    },

    resetToToday: function () {
        this.viewDate = new Date();
        this.updateTitle();
        this.loadAndDisplayQuests();
    },

    updateTitle: function () {
        const todayStr = this.toLocalYMD(new Date());
        const viewStr = this.toLocalYMD(this.viewDate);

        if (todayStr === viewStr) {
            this.elements.periodToggle.innerText = "Daily";
        } else {
            const d = this.viewDate.getDate().toString().padStart(2, '0');
            const m = (this.viewDate.getMonth() + 1).toString().padStart(2, '0');
            const y = this.viewDate.getFullYear();
            this.elements.periodToggle.innerText = `${d}/${m}/${y}`;
        }
    },

    // --- DATA HELPERS ---

    /**
     * Fetches quest instances for a specific date (Daily Logs).
     * @param {Date} date 
     * @returns {Map<string, number>} Map of TemplateID -> Count
     */
    fetchDailyInstances: async function (date) {
        // Strict normalization to midnight
        const midnight = new Date(date);
        midnight.setHours(0, 0, 0, 0);

        const dateTimestamp = firebase.firestore.Timestamp.fromDate(midnight);
        const snapshot = await this.db.collection('quest_instances')
            .where('date', '==', dateTimestamp)
            .get();

        const completionMap = new Map();
        snapshot.forEach(doc => {
            const data = doc.data();
            const val = data.count || 1;
            completionMap.set(data.template_id, val);
        });
        return completionMap;
    },

    // --- MAIN LOADING ---
    loadAndDisplayQuests: async function () {
        const el = this.elements;
        el.questList.innerHTML = '';

        try {
            // 1. Load Templates (Source of Truth)
            const templatesSnap = await this.db.collection('quest_templates')
                .where('is_active', '==', true)
                .get();

            this.templatesCache = {};
            templatesSnap.forEach(doc => {
                this.templatesCache[doc.id] = doc.data();
            });

            // 2. Generate Virtual List based on Recurrence rules
            let tasksToRender = await this.generateVirtualListCandidates();

            // 3. Hydrate Status (Check db for completion)
            const validationMap = await this.fetchDailyInstances(this.viewDate);
            tasksToRender = this.hydrateWithTemplateStatus(tasksToRender, validationMap);

            // 4. Render
            this.renderTasks(tasksToRender);

        } catch (error) {
            console.error("Error loading quests:", error);
            el.questList.innerHTML = '<p>Error loading data.</p>';
        }
    },

    /**
     * Combines Template Logic with Actual Instances to determine status.
     */
    hydrateWithTemplateStatus: function (tasks, validationMap) {
        return tasks.map(task => {
            const template = this.templatesCache[task.id];
            const target = template?.completion_target || 1;
            const current = validationMap ? (validationMap.get(task.id) || 0) : 0;

            if (task.type === 'DAILY_ONLY' || task.type === 'RECURRING') {
                const isCompleted = current >= target;
                return {
                    ...task,
                    status: isCompleted ? 'completed' : 'pending',
                    current_count: current,
                    target_count: target
                };
            }

            // For Weekly/Monthly, checking persistence field in Template
            if (!template || !template.last_completed_at) {
                return { ...task, status: 'pending', current_count: 0, target_count: target };
            }

            let lastDoneDate = template.last_completed_at;
            if (lastDoneDate && lastDoneDate.toDate) {
                lastDoneDate = lastDoneDate.toDate();
            } else {
                lastDoneDate = new Date(lastDoneDate);
            }

            const viewDate = this.viewDate;

            const isDoneInCurrentPeriod = (
                (task.type === 'WEEKLY' && this.getPeriodID(lastDoneDate, 'WEEKLY') === this.getPeriodID(viewDate, 'WEEKLY')) ||
                (task.type === 'MONTHLY' && this.getPeriodID(lastDoneDate, 'MONTHLY') === this.getPeriodID(viewDate, 'MONTHLY'))
            );

            if (isDoneInCurrentPeriod) {
                const isToday = this.toLocalYMD(lastDoneDate) === this.toLocalYMD(viewDate);
                return {
                    ...task,
                    status: isToday ? 'completed' : 'completed_previously', // darker check if done previously
                    current_count: target,
                    target_count: target
                };
            } else {
                return { ...task, status: 'pending', current_count: 0, target_count: target };
            }
        });
    },

    // --- VIRTUAL LIST GENERATOR ---
    generateVirtualListCandidates: async function () {
        const viewDateStr = this.toLocalYMD(this.viewDate);
        const dayOfWeek = this.viewDate.getDay() === 0 ? 0 : this.viewDate.getDay(); // 0 = Sun
        const candidates = [];

        const currentViewWeekID = this.getPeriodID(this.viewDate, 'WEEKLY');
        const currentViewMonthID = this.getPeriodID(this.viewDate, 'MONTHLY');

        Object.keys(this.templatesCache).forEach(id => {
            const t = this.templatesCache[id];

            // Exception handling (Deleted instances)
            if (t.exception_dates && t.exception_dates.includes(viewDateStr)) return;

            let shouldInclude = false;

            // 1. DAILY ONLY
            if (t.type === 'DAILY_ONLY') {
                const tDate = t.start_date.toDate();
                if (this.toLocalYMD(tDate) === viewDateStr) shouldInclude = true;
            }
            // 2. RECURRING
            else if (t.type === 'RECURRING') {
                const tDateStr = this.toLocalYMD(t.start_date.toDate());
                if (t.recurrence_rule?.daysOfWeek?.includes(dayOfWeek)) {
                    if (tDateStr <= viewDateStr) shouldInclude = true;
                }
            }
            // 3. WEEKLY
            else if (t.type === 'WEEKLY') {
                const targetID = t.target_period || this.getPeriodID(t.start_date.toDate(), 'WEEKLY');
                if (targetID === currentViewWeekID) shouldInclude = true;
            }
            // 4. MONTHLY
            else if (t.type === 'MONTHLY') {
                const targetID = t.target_period || this.getPeriodID(t.start_date.toDate(), 'MONTHLY');
                if (targetID === currentViewMonthID) shouldInclude = true;
            }

            if (shouldInclude) {
                candidates.push({ id: id, title: t.title, type: t.type, status: 'pending' });
            }
        });
        return candidates;
    },

    // --- STATS UPDATE ---
    /**
     * Recalculates daily score and persists to 'daily_logs'.
     */
    updateDailyStats: async function (date) {
        try {
            const dateStr = this.toLocalYMD(date);
            if (dateStr !== this.toLocalYMD(this.viewDate)) return;

            const validationMap = await this.fetchDailyInstances(date);
            let tasks = await this.generateVirtualListCandidates();
            tasks = this.hydrateWithTemplateStatus(tasks, validationMap);

            const total = tasks.length;
            const completed = tasks.filter(t => t.status === 'completed' || t.status === 'completed_previously').length;

            let ratio = 0;
            if (total > 0) ratio = completed / total;

            const score = Math.round(ratio * 100);

            // Access main stats collection
            await this.db.collection('daily_logs').doc(dateStr).set({
                date: dateStr,
                stats: {
                    total: total,
                    completed: completed,
                    ratio: ratio,
                    score: score
                },
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

        } catch (error) {
            console.error("Error updating stats:", error);
        }
    },

    // --- UI RENDERING ---
    renderTasks: function (tasks) {
        this.elements.questList.innerHTML = '';

        // Sort: Daily/Recurring > Weekly > Monthly
        const typePriority = { 'DAILY_ONLY': 1, 'RECURRING': 1, 'WEEKLY': 2, 'MONTHLY': 3 };
        tasks.sort((a, b) => (typePriority[a.type] || 4) - (typePriority[b.type] || 4));

        if (tasks.length === 0) {
            this.updateProgress(0, 0);
            return;
        }

        tasks.forEach(task => {
            const isDone = task.status === 'completed' || task.status === 'completed_previously';
            this.createQuestElement(task.id, task.title, isDone, task.type, task.current_count, task.target_count);
        });

        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed' || t.status === 'completed_previously').length;

        this.updateProgress(completed, total);
    },

    createQuestElement: function (id, title, isDone, type, currentCount = 0, targetCount = 1) {
        const li = document.createElement('li');
        li.className = `quest-item ${isDone ? 'completed' : ''}`;
        li.dataset.questId = id;

        let typeClass = 'daily-type';
        if (type === 'WEEKLY') typeClass = 'weekly-type';
        else if (type === 'MONTHLY') typeClass = 'monthly-type';
        li.classList.add(typeClass);

        // HTML Content
        let html = `<span class="quest-text">${title}</span>`;

        // Buttons (One Check or Multi-Steps)
        if (targetCount > 1) {
            html += `<div class="multi-check-container">`;
            for (let i = 1; i <= targetCount; i++) {
                const isChecked = i <= currentCount;
                html += `<button class="mini-check-btn ${isChecked ? 'checked' : ''}" data-step="${i}"></button>`;
            }
            html += `</div>`;
        } else {
            html += `<button class="check-btn"></button>`;
        }

        li.innerHTML = html;

        // Listeners
        if (targetCount > 1) {
            const btns = li.querySelectorAll('.mini-check-btn');
            btns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const step = parseInt(btn.dataset.step);
                    this.handleMultiValidation(id, step);
                });
            });
        } else {
            const checkBtn = li.querySelector('.check-btn');
            checkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isCurrentlyDone = li.classList.contains('completed');
                const newCount = isCurrentlyDone ? 0 : 1;
                this.updateQuestProgress(id, newCount);
            });
        }

        li.addEventListener('click', (e) => {
            // Prevent edit if clicking valid buttons
            if (e.target.classList.contains('mini-check-btn') || e.target.classList.contains('check-btn')) return;
            this.handleEditClick(id);
        });

        this.elements.questList.appendChild(li);
    },

    /**
     * Core update logic. optimistically updates UI, then writes DB.
     */
    updateQuestProgress: async function (questId, newCount) {
        // 1. Optimistic UI
        const li = this.elements.questList.querySelector(`[data-quest-id="${questId}"]`);
        if (li) {
            // Update Mini Buttons
            const miniBtns = li.querySelectorAll('.mini-check-btn');
            miniBtns.forEach(btn => {
                const step = parseInt(btn.dataset.step);
                if (step <= newCount) btn.classList.add('checked');
                else btn.classList.remove('checked');
            });

            // Update Global Item Status
            const target = miniBtns.length || 1;
            if (newCount >= target) li.classList.add('completed');
            else li.classList.remove('completed');

            // Simple Check Button
            const bigBtn = li.querySelector('.check-btn');
            if (bigBtn) {
                if (newCount > 0) li.classList.add('completed');
                else li.classList.remove('completed');
            }
        }

        this.updateProgress();

        // 2. Data Persistence (Firestore)
        const dateToSave = new Date(this.viewDate);
        dateToSave.setHours(0, 0, 0, 0);
        const currentTimestamp = firebase.firestore.Timestamp.fromDate(dateToSave);

        try {
            const instanceQuery = await this.db.collection('quest_instances')
                .where('template_id', '==', questId)
                .where('date', '==', currentTimestamp)
                .limit(1)
                .get();

            if (newCount > 0) {
                // UPSERT
                const data = {
                    template_id: questId,
                    date: currentTimestamp,
                    count: newCount,
                    is_completed: true,
                    updated_at: firebase.firestore.FieldValue.serverTimestamp()
                };

                if (!instanceQuery.empty) {
                    await this.db.collection('quest_instances').doc(instanceQuery.docs[0].id).update(data);
                } else {
                    data.created_at = firebase.firestore.FieldValue.serverTimestamp();
                    await this.db.collection('quest_instances').add(data);
                }
            } else {
                // DELETE (Count 0 means removed)
                if (!instanceQuery.empty) {
                    await this.db.collection('quest_instances').doc(instanceQuery.docs[0].id).delete();
                }
            }

            // --- RECURRING/WEEKLY LOGIC ---
            // Update the template's 'last_completed_at' field if completed
            const template = this.templatesCache[questId];
            if (template) {
                const target = template.completion_target || 1;
                const isCompleted = newCount >= target;

                if (isCompleted) {
                    await this.db.collection('quest_templates').doc(questId).update({
                        last_completed_at: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    template.last_completed_at = new Date(); // Cache update
                } else {
                    await this.db.collection('quest_templates').doc(questId).update({
                        last_completed_at: null
                    });
                    template.last_completed_at = null;
                }
            }

            // 3. Update Stats Calculation
            await this.updateDailyStats(this.viewDate);

        } catch (error) {
            console.error("Error updating progress:", error);
        }
    },

    handleMultiValidation: function (id, step) {
        // UI Check Logic
        const li = this.elements.questList.querySelector(`[data-quest-id="${id}"]`);
        if (!li) return;

        const activeBtns = li.querySelectorAll('.mini-check-btn.checked');
        const currentVisualCount = activeBtns.length;

        // Toggle: if clicking active step, decrement. Else set to step.
        let newCount = step;
        if (currentVisualCount === step) {
            newCount = step - 1;
        }

        this.updateQuestProgress(id, newCount);
    },

    updateProgress: function (completed, total) {
        if (total === undefined) {
            const allQuests = this.elements.questList.querySelectorAll('.quest-item');
            total = allQuests.length;
            completed = this.elements.questList.querySelectorAll('.quest-item.completed').length;
        }

        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        this.elements.progressBarFill.style.width = `${percentage}%`;

        let emoji = '💧';
        if (total === 0) emoji = '😴';
        else if (percentage === 100) emoji = '🏆';
        else if (percentage >= 80) emoji = '🚀';
        else if (percentage >= 60) emoji = '💪';
        else if (percentage >= 40) emoji = '🔥';
        else if (percentage >= 20) emoji = '🌱';

        this.elements.progressEmoji.innerText = emoji;
    },

    // --- FORM HANDLING ---

    toggleForm: function () {
        const el = this.elements;
        el.taskForm.classList.toggle('open');
        const isOpen = el.taskForm.classList.contains('open');

        el.desktopToggleFormBtn.innerText = isOpen ? 'Close Form' : 'New Quest';
        if (!isOpen) el.desktopAddBtnArea.style.opacity = '1';
    },

    resetFormToCreateMode: function () {
        this.currentEditTemplateId = null;
        this.currentEditTemplateData = null;
        this.elements.questAddForm.reset();

        this.elements.questDate.value = this.toLocalYMD(this.viewDate);

        document.querySelector('.task-form-content h2').innerText = 'Add New Quest';
        this.elements.submitQuestBtn.innerText = 'Add Quest';
        this.elements.deleteQuestBtn.classList.add('hidden-action-btn');
        this.elements.questNotes.value = '';

        this.elements.editScopeContainer.classList.add('hidden-scope');
        this.elements.editScopeCheckbox.checked = false;

        document.getElementById('typeDaily').checked = true;

        // Reset Advanced Options
        if (this.elements.advancedOptions) {
            this.elements.advancedOptions.classList.add('hidden-advanced');
            this.elements.advancedOptions.classList.remove('visible-advanced');
            this.elements.toggleAdvancedBtn.classList.remove('open');
        }

        this.elements.questTarget.value = 1;
        if (this.elements.targetValue) this.elements.targetValue.innerText = "1";

        this.handleRecurrenceToggle();
    },

    handleRecurrenceToggle: function () {
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

        el.submitQuestBtn.className = `new-quest-btn submit-form-btn ${colorClass}`;
    },

    handleEditClick: async function (templateId) {
        try {
            let template = this.templatesCache[templateId];
            if (!template) {
                const doc = await this.db.collection('quest_templates').doc(templateId).get();
                if (!doc.exists) return;
                template = doc.data();
            }

            this.currentEditTemplateId = templateId;
            this.currentEditTemplateData = template;

            const el = this.elements;
            el.questTitle.value = template.title;
            el.questNotes.value = template.notes || '';

            if (template.start_date && template.start_date.toDate) {
                el.questDate.value = this.toLocalYMD(template.start_date.toDate());
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

            const val = template.completion_target || 1;
            el.questTarget.value = val;
            if (el.targetValue) el.targetValue.innerText = val;

            this.toggleForm();
        } catch (error) { console.error("Error loading edit:", error); }
    },

    handleDelete: async function () {
        if (!this.currentEditTemplateId) return;
        try {
            await this.db.collection('quest_templates').doc(this.currentEditTemplateId).delete();
            this.toggleForm();
            await this.loadAndDisplayQuests();
            await this.updateDailyStats(this.viewDate);
        } catch (error) { console.error("Error delete:", error); }
    },

    handleSubmit: async function (e) {
        e.preventDefault();
        const el = this.elements;

        const title = el.questTitle.value;
        const type = document.querySelector('input[name="questType"]:checked').value;
        const dateString = el.questDate.value;
        const notes = el.questNotes.value;
        const targetCount = parseInt(el.questTarget.value) || 1;

        const targetDate = new Date(dateString);
        targetDate.setHours(0, 0, 0, 0);

        let targetPeriod = null;
        if (type === 'WEEKLY') targetPeriod = this.getPeriodID(targetDate, 'WEEKLY');
        else if (type === 'MONTHLY') targetPeriod = this.getPeriodID(targetDate, 'MONTHLY');

        const recurrenceDays = Array.from(document.querySelectorAll('.day-selector input[type="checkbox"]:checked'))
            .map(cb => parseInt(cb.value));

        const templateData = {
            title: title, notes: notes, type: type, is_active: true,
            start_date: isNaN(targetDate.getTime()) ? null : firebase.firestore.Timestamp.fromDate(targetDate),
            target_period: targetPeriod,
            completion_target: targetCount,
            recurrence_rule: { daysOfWeek: type === 'RECURRING' ? recurrenceDays : [] },
            exception_dates: this.currentEditTemplateData ? this.currentEditTemplateData.exception_dates || [] : []
        };

        try {
            if (this.currentEditTemplateId) {
                // UPDATE
                const isRecurringOriginal = this.currentEditTemplateData && this.currentEditTemplateData.type === 'RECURRING';
                const editScope = el.editScopeCheckbox.checked ? 'SERIES' : 'SINGLE';

                if (isRecurringOriginal && editScope === 'SINGLE') {
                    const viewDateStr = this.toLocalYMD(this.viewDate);
                    await this.db.collection('quest_templates').doc(this.currentEditTemplateId).update({
                        exception_dates: firebase.firestore.FieldValue.arrayUnion(viewDateStr)
                    });

                    const newQuestData = { ...templateData };
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

            await this.loadAndDisplayQuests();
            this.toggleForm();
            this.updateDailyStats(this.viewDate).catch(err => console.error("Stats update warning:", err));
        } catch (error) {
            console.error("Error submit:", error);
            alert("Error saving quest. See console.");
        }
    }
};
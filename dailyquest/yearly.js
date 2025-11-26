// ==========================================
// MODULE YEARLY (CALENDAR HEATMAP)
// Gère l'affichage du calendrier et des stats
// ==========================================

const YearlyLogic = {
    db: null,
    currentDate: new Date(), // Le mois actuellement affiché
    
    // Cache pour éviter de re-fetcher si on revient sur le même mois (optionnel, simple pour l'instant)
    cache: {}, 

    init: function(database) {
        this.db = database;
        console.log("Yearly Logic Initialized");
    },

    // Point d'entrée appelé par script.js quand on clique sur "Yearly"
    renderSummary: function() {
        if (!this.db) return;
        
        // On construit la structure HTML de base si elle n'existe pas encore
        const container = document.getElementById('summary-panel');
        if (!container.querySelector('.calendar-header')) {
            this.buildSkeleton(container);
        }

        // On charge les données du mois courant
        this.loadMonthData();
    },

    // Crée le squelette HTML (Header + Grille vide)
    buildSkeleton: function(container) {
        container.innerHTML = `
            <div class="calendar-wrapper">
                
                <div class="calendar-header">
                    <button id="prevMonthBtn" class="nav-arrow-btn">←</button>
                    <h2 id="currentMonthLabel">Month Year</h2>
                    <button id="nextMonthBtn" class="nav-arrow-btn">→</button>
                </div>

                <div class="weekdays-grid">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>

                <div id="daysGrid" class="days-grid">
                    </div>
                
                <div class="calendar-legend">
                    <span class="legend-item"><span class="dot legend-perfect"></span> Perfect</span>
                    <span class="legend-item"><span class="dot legend-good"></span> Good</span>
                    <span class="legend-item"><span class="dot legend-bad"></span> Missed</span>
                </div>
            </div>
        `;

        // Listeners navigation
        document.getElementById('prevMonthBtn').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonthBtn').addEventListener('click', () => this.changeMonth(1));
    },

    changeMonth: function(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.loadMonthData();
    },

    // Récupère les données et génère l'affichage
    loadMonthData: async function() {
        const grid = document.getElementById('daysGrid');
        const label = document.getElementById('currentMonthLabel');
        
        // Mise à jour du Label (ex: "November 2025")
        const options = { month: 'long', year: 'numeric' };
        label.innerText = this.currentDate.toLocaleDateString('en-US', options);
        
        // Loader visuel
        grid.innerHTML = '<div class="loading-spinner">✨ Computing stars...</div>';

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // 1. Définir les bornes du mois
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        // Timestamp Firestore pour la requête
        const startTs = firebase.firestore.Timestamp.fromDate(firstDayOfMonth);
        const endTs = firebase.firestore.Timestamp.fromDate(new Date(year, month + 1, 1)); // Le 1er du mois suivant à 00:00

        try {
            // 2. Récupérer TOUS les Templates (pour savoir ce qu'on devait faire)
            // Note: Idéalement on filtrerait ceux créés après la fin du mois, mais pour simplifier on prend tout
            const templatesSnap = await this.db.collection('quest_templates').get();
            const templates = templatesSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));

            // 3. Récupérer TOUTES les Instances complétées ce mois-ci
            const instancesSnap = await this.db.collection('quest_instances')
                .where('date', '>=', startTs)
                .where('date', '<', endTs)
                .get();
            
            // Mapper les instances par jour : "2025-11-24" -> [Instance, Instance]
            const instancesByDate = {};
            instancesSnap.forEach(doc => {
                const data = doc.data();
                const dateStr = data.date.toDate().toISOString().split('T')[0];
                if (!instancesByDate[dateStr]) instancesByDate[dateStr] = [];
                instancesByDate[dateStr].push(data);
            });

            // 4. Construire la grille
            this.renderGrid(year, month, templates, instancesByDate);

        } catch (error) {
            console.error("Error loading monthly data:", error);
            grid.innerHTML = '<div class="error-msg">Error loading data.</div>';
        }
    },

    renderGrid: function(year, month, templates, instancesByDate) {
        const grid = document.getElementById('daysGrid');
        grid.innerHTML = '';

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayObj = new Date(year, month, 1);
        
        // Ajustement pour commencer Lundi (JS getDay: Dimanche=0, on veut Lundi=0 pour l'affichage CSS, mais Lundi=1 en réalité)
        // Mon=1, ... Sun=7. 
        let startDay = firstDayObj.getDay(); 
        if (startDay === 0) startDay = 7; // Dimanche devient 7

        // Créer les cases vides avant le 1er du mois
        for (let i = 1; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day-cell', 'empty');
            grid.appendChild(emptyCell);
        }

        const todayStr = new Date().toISOString().split('T')[0];

        // Boucle sur chaque jour du mois
        for (let day = 1; day <= daysInMonth; day++) {
            const currentLoopDate = new Date(year, month, day);
            // Force l'heure à midi pour éviter les problèmes de fuseau horaire lors de la conversion string
            currentLoopDate.setHours(12, 0, 0, 0); 
            
            const dateStr = currentLoopDate.toISOString().split('T')[0];
            const dayOfWeek = currentLoopDate.getDay() === 0 ? 7 : currentLoopDate.getDay(); // 1-7

            // --- CALCUL DU SCORE ---
            // A. Combien de quêtes complétées ce jour-là ?
            const completedCount = instancesByDate[dateStr] ? instancesByDate[dateStr].length : 0;

            // B. Combien de quêtes POUVAIT-ON faire ce jour-là ? (Dénominateur)
            let totalPossible = 0;
            
            // Si c'est dans le futur, on ne calcule pas
            const isFuture = dateStr > todayStr;
            const isToday = dateStr === todayStr;

            if (!isFuture) {
                templates.forEach(t => {
                    // La quête doit avoir été créée avant ou ce jour là
                    let startDateStr = "";
                    if (t.start_date) startDateStr = t.start_date.toDate().toISOString().split('T')[0];
                    if (startDateStr > dateStr) return; // Quête pas encore née

                    // Vérifier Exception (si ce jour a été annulé/modifié pour ce template)
                    if (t.exception_dates && t.exception_dates.includes(dateStr)) return;

                    let isActiveToday = false;
                    if (t.type === 'DAILY_ONLY') isActiveToday = true; // (Simplification: devrait vérifier la date exacte si c'est une unique)
                    else if (t.type === 'WEEKLY' || t.type === 'MONTHLY') isActiveToday = true; // Simplification
                    else if (t.type === 'RECURRING' && t.recurrence_rule.daysOfWeek.includes(dayOfWeek)) {
                        isActiveToday = true;
                    }

                    if (isActiveToday) totalPossible++;
                });
            }

            // --- DETERMINER LA CLASSE CSS ---
            let statusClass = 'future';
            if (!isFuture) {
                if (totalPossible === 0) {
                    statusClass = 'no-quest'; // Pas de quête ce jour là
                } else {
                    const ratio = completedCount / totalPossible;
                    if (ratio >= 1) statusClass = 'perfect';
                    else if (ratio >= 0.5) statusClass = 'good';
                    else statusClass = 'bad';
                }
            }
            if(isToday) statusClass += ' today-pulse'; // Petit effet pour aujourd'hui

            // Création de l'élément DOM
            const dayCell = document.createElement('div');
            dayCell.className = `day-cell`;
            
            dayCell.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="day-orb ${statusClass}"></div>
            `;
            
            grid.appendChild(dayCell);
        }
    }
};
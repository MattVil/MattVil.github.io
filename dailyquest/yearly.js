// ==========================================
// MODULE YEARLY (OPTIMIZED SNAPSHOT READER)
// ==========================================

const YearlyLogic = {
    db: null,
    currentDate: new Date(),

    init: function (database) {
        this.db = database;
        console.log("Yearly Logic Initialized (Reader Mode)");
    },

    getColorForRatio: function (ratio) {
        const start = { r: 234, g: 67, b: 53 };   // Rouge (#EA4335)
        const middle = { r: 251, g: 188, b: 5 };  // Jaune (#FBBC05)
        const end = { r: 52, g: 168, b: 83 };     // Vert (#34A853)

        let r, g, b;

        if (ratio < 0.5) {
            const t = ratio * 2;
            r = Math.round(start.r + (middle.r - start.r) * t);
            g = Math.round(start.g + (middle.g - start.g) * t);
            b = Math.round(start.b + (middle.b - start.b) * t);
        } else {
            const t = (ratio - 0.5) * 2;
            r = Math.round(middle.r + (end.r - middle.r) * t);
            g = Math.round(middle.g + (end.g - middle.g) * t);
            b = Math.round(middle.b + (end.b - middle.b) * t);
        }
        return `rgb(${r}, ${g}, ${b})`;
    },

    renderSummary: function () {
        if (!this.db) return;
        this.currentDate = new Date(); // Reset à aujourd'hui à l'ouverture

        const container = document.getElementById('summary-panel');
        if (!container.querySelector('.calendar-header')) {
            this.buildSkeleton(container);
        }
        this.loadMonthData();
    },

    buildSkeleton: function (container) {
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
                <div id="daysGrid" class="days-grid"></div>
                <div class="calendar-legend-gradient">
                    <div class="gradient-bar"></div>
                    <div class="emoji-labels"><span>💀</span><span>🌱</span><span>💪</span><span>🏆</span></div>
                </div>
            </div> <!-- End of calendar-wrapper (White Tile) -->
            
            <!-- DOWN ARROW: Go to Achievements (Outside the tile) -->
            <div id="nav-arrow-down" class="nav-arrow down" title="Go to Achievements">
                <span class="chevron"></span>
            </div>
        `;

        // Re-attach event listeners for arrow (since it was re-created)
        // Wait, the arrow listener is in script.js and attached on init.
        // If we re-render this HTML, we lose the listener attached in script.js!
        // We must re-attach the listener here or delegate it.
        // Strategy: Delegate or re-attach. 
        // For simplicity, let's verify if script.js attaches it once or if we need to expose a re-attach method.
        // Actually script.js runs ONCE. If we overwrite HTML, the element is new, the listener is gone.
        // Fix: Use Event Delegation on the container or re-bind.

        document.getElementById('prevMonthBtn').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonthBtn').addEventListener('click', () => this.changeMonth(1));
    },

    changeMonth: function (delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.loadMonthData();
    },

    toLocalYMD: function (date) {
        const d = new Date(date);
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    },

    loadMonthData: async function () {
        const grid = document.getElementById('daysGrid');
        const label = document.getElementById('currentMonthLabel');
        const options = { month: 'long', year: 'numeric' };
        // label.innerText = this.currentDate.toLocaleDateString('en-US', options);

        // Wrap Month in span for styling
        const monthName = this.currentDate.toLocaleDateString('en-US', { month: 'long' });
        const yearNum = this.currentDate.getFullYear();
        label.innerHTML = `<span class="highlight-month">${monthName}</span> ${yearNum}`;
        grid.innerHTML = '<div class="loading-spinner">✨ Reading Logs...</div>';

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startStr = this.toLocalYMD(firstDay);
        const nextMonthStr = this.toLocalYMD(new Date(year, month + 1, 1));

        try {
            // Lecture optimisée : on ne lit que les logs existants
            const snapshot = await this.db.collection('daily_logs')
                .where('date', '>=', startStr)
                .where('date', '<', nextMonthStr)
                .get({ source: 'server' });

            const logsByDate = {};
            snapshot.forEach(doc => { logsByDate[doc.id] = doc.data(); });
            this.renderGrid(year, month, logsByDate);
        } catch (error) {
            console.error("Error loading yearly:", error);
            grid.innerHTML = '<div class="error-msg">Error loading data.</div>';
        }
    },

    renderGrid: function (year, month, logsByDate) {
        const grid = document.getElementById('daysGrid');
        grid.innerHTML = '';
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayObj = new Date(year, month, 1);
        let startDay = firstDayObj.getDay();
        if (startDay === 0) startDay = 7;

        for (let i = 1; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day-cell', 'empty');
            grid.appendChild(emptyCell);
        }

        const todayStr = this.toLocalYMD(new Date());

        for (let day = 1; day <= daysInMonth; day++) {
            const currentLoopDate = new Date(year, month, day);
            const dateStr = this.toLocalYMD(currentLoopDate);
            const log = logsByDate[dateStr];

            let orbClass = 'day-orb';
            let orbStyle = '';
            const isFuture = dateStr > todayStr;
            const isToday = dateStr === todayStr;

            if (isFuture) {
                orbClass += ' future';
            } else if (!log) {
                orbClass += ' no-quest';
            } else {
                const stats = log.stats || { ratio: 0, score: 0 };
                const ratio = stats.ratio !== undefined ? stats.ratio : (stats.score / 100);
                if (stats.total === 0) orbClass += ' no-quest';
                else {
                    const color = this.getColorForRatio(ratio);
                    // Randomize animation to desynchronize blobs
                    const randomDelay = (Math.random() * -10).toFixed(1); // Start at random point
                    const randomDuration = (6 + Math.random() * 4).toFixed(1); // Different speeds (6s-10s)

                    orbStyle = `background-color: ${color}; box-shadow: 0 0 10px ${color}66; animation-delay: ${randomDelay}s; animation-duration: ${randomDuration}s;`;
                    if (ratio >= 1) orbClass += ' perfect-glow';
                }
            }

            if (isToday) orbClass += ' today-pulse';

            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            if (isToday) {
                dayCell.classList.add('today');
                if (log && log.stats && log.stats.total > 0) {
                    const stats = log.stats;
                    const ratio = stats.ratio !== undefined ? stats.ratio : (stats.score / 100);
                    // Use the EXACT same color function as the blob
                    const borderColor = this.getColorForRatio(ratio);
                    dayCell.style.setProperty('--today-borderColor', borderColor);
                } else {
                    // Default Purple
                    dayCell.style.setProperty('--today-borderColor', '#9B72CB');
                }
            }
            dayCell.style.cursor = "pointer";

            // Interaction : Clic pour aller à la vue Daily
            dayCell.onclick = () => {
                if (typeof window.switchToDailyDate === 'function') {
                    window.switchToDailyDate(currentLoopDate);
                }
            };

            dayCell.innerHTML = `
                <div class=\"day-number\">${day}</div>
                <div class=\"${orbClass}\" style=\"${orbStyle}\"></div>
            `;
            grid.appendChild(dayCell);
        }
    }
};
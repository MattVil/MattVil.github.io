// ==========================================
// MODULE ACHIEVEMENTS
// Handles calculation, storage, and display of user statistics,
// gamification elements (streaks), and visualization charts.
// ==========================================

/**
 * Main Logic Object for Achievements
 * @namespace AchievementsLogic
 */
const AchievementsLogic = {
    db: null,

    // Cache for stats to avoid unnecessary reads
    statsCache: {
        currentStreak: 0,
        bestStreak: 0
    },

    /**
     * Initialize the module
     * @param {Object} database - Firebase Firestore instance
     */
    init: function (database) {
        this.db = database;
    },

    // --- MAIN RENDER ---

    /**
     * Orchestrates the rendering of the entire Achievements panel.
     */
    renderPanel: async function () {
        const container = document.querySelector('.achievements-grid');
        if (!container) return;

        // Fetch latest stats from DB (user_stats collection)
        await this.loadStats();

        this.updateStreakTile();
    },

    // --- DB OPERATIONS ---
    loadStats: async function () {
        try {
            const doc = await this.db.collection('user_stats').doc('main').get();
            if (doc.exists) {
                this.statsCache = { ...this.statsCache, ...doc.data() };
            } else {
                await this.recalculateAll();
            }
        } catch (e) {
            console.error("Error loading stats:", e);
        }
    },

    saveStats: async function () {
        try {
            await this.db.collection('user_stats').doc('main').set(this.statsCache, { merge: true });
        } catch (e) {
            console.error("Error saving stats:", e);
        }
    },

    // --- RECALCULATE LOGIC ---
    recalculateAll: async function () {
        const newStreak = await this.calculateCurrentStreak();
        this.statsCache.currentStreak = newStreak;
        await this.saveStats();
    },

    /**
     * Calculates the current continuous streak of perfect days (100% completion).
     * Iterates backwards from today (or yesterday if today is pending).
     * @returns {number} The streak count in days.
     */
    calculateCurrentStreak: async function () {
        const logsSnap = await this.db.collection('daily_logs')
            .orderBy('date', 'desc')
            .limit(100)
            .get();

        if (logsSnap.empty) return 0;

        let streak = 0;
        let todayStr = new Date().toISOString().split('T')[0];

        const dateList = [];
        logsSnap.forEach(doc => {
            dateList.push(doc.data());
        });

        const todayLog = dateList.find(l => l.date === todayStr);
        let streakBroken = false;

        let checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);

        // Check last 365 days (max streak cap logical)
        for (let i = 0; i < 365; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const log = dateList.find(l => l.date === dateStr);

            if (i === 0) {
                // TODAY: If 100%, it counts. If not, it doesn't break streak yet.
                if (log && log.stats && log.stats.score === 100) {
                    streak++;
                }
            } else {
                // PAST DAYS: Must be 100% or streak ends.
                if (log && log.stats && log.stats.score === 100) {
                    streak++;
                } else {
                    streakBroken = true;
                }
            }

            if (streakBroken) break;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        if (streak > (this.statsCache.bestStreak || 0)) {
            this.statsCache.bestStreak = streak;
            this.saveStats();
        }

        return streak;
    },

    // --- GLOBAL STATS CALCULATION ---
    calculateGlobalStats: async function () {
        // 1. Average Score
        const logsSnap = await this.db.collection('daily_logs').get();
        let totalScoreSum = 0;
        let daysCount = 0;

        logsSnap.forEach(doc => {
            const data = doc.data();
            if (data.stats && data.stats.score !== undefined) {
                totalScoreSum += data.stats.score;
                daysCount++;
            }
        });

        const avgScore = daysCount > 0 ? Math.round(totalScoreSum / daysCount) : 0;

        // 2. Total Counts by Type
        const instancesSnap = await this.db.collection('quest_instances').get();
        let total = 0;
        let daily = 0;
        let weekly = 0;
        let monthly = 0;

        const templatesSnap = await this.db.collection('quest_templates').get();
        const typeMap = {};
        templatesSnap.forEach(doc => {
            typeMap[doc.id] = doc.data().type;
        });

        instancesSnap.forEach(doc => {
            total++;
            const tId = doc.data().template_id;
            const type = typeMap[tId] || 'DAILY_ONLY';

            if (type === 'WEEKLY') weekly++;
            else if (type === 'MONTHLY') monthly++;
            else daily++;
        });

        return { total, daily, weekly, monthly, avgScore };
    },

    // --- CHART LOGIC ---
    calculateWeeklyAverages: async function () {
        const logsSnap = await this.db.collection('daily_logs')
            .orderBy('date', 'desc')
            .limit(60)
            .get();

        const sums = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 }; // Mon->Sun
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };

        logsSnap.forEach(doc => {
            const data = doc.data();
            const date = new Date(data.date);
            const day = date.getDay();

            if (data.stats && data.stats.score !== undefined) {
                sums[day] += data.stats.score;
                counts[day]++;
            }
        });

        // Compute averages. Order: Mon(1) ... Sat(6), Sun(0)
        const result = [];
        const order = [1, 2, 3, 4, 5, 6, 0];

        order.forEach(d => {
            const avg = counts[d] > 0 ? Math.round(sums[d] / counts[d]) : 0;
            result.push(avg);
        });

        return result;
    },

    renderWeeklyChart: async function () {
        const svg = document.getElementById('weeklyWaveChart');
        if (!svg) return;

        const data = await this.calculateWeeklyAverages();

        const width = 100;
        const height = 50;
        const step = width / 6;

        const mapY = (val) => 50 - (val / 100 * 40);

        const points = data.map((val, i) => {
            return { x: i * step, y: mapY(val) };
        });

        let d = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];

            const cX1 = p0.x + step / 2;
            const cY1 = p0.y;
            const cX2 = p1.x - step / 2;
            const cY2 = p1.y;

            d += ` C ${cX1} ${cY1}, ${cX2} ${cY2}, ${p1.x} ${p1.y}`;
        }

        const fillD = d + ` L ${width} ${height} L 0 ${height} Z`;

        svg.innerHTML = `
            <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#9B72CB;stop-opacity:0.6" />
                    <stop offset="100%" style="stop-color:#9B72CB;stop-opacity:0.0" />
                </linearGradient>
            </defs>
            
            <!-- Grid Lines & Y-Axis Labels -->
            <line x1="0" y1="10" x2="100" y2="10" class="chart-grid-line" />
            
            <line x1="0" y1="30" x2="100" y2="30" class="chart-grid-line" />
            
            <!-- Area Fill -->
            <path d="${fillD}" class="wave-path" style="stroke:none;" />
            
            <!-- Stroke Line -->
            <path d="${d}" fill="none" stroke="#9B72CB" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" />
        `;
    },

    // --- HABITS (PERIODIC) LOGIC ---
    /**
     * Calculates streaks for Recurring Tasks (Habits).
     * @returns {Array} List of habit objects with {id, title, streak, emoji}
     */
    calculateHabitStreaks: async function () {
        try {
            // 1. Get all RECURRING templates
            const templatesSnap = await this.db.collection('quest_templates')
                .where('type', '==', 'RECURRING')
                .get();

            if (templatesSnap.empty) {
                return [];
            }

            const habits = [];

            // Parallel processing for each habit
            const promises = templatesSnap.docs.map(async (doc) => {
                const temp = doc.data();
                const tId = doc.id;
                const recurrence = temp.recurrence || []; // Array of day indices [0, 1...] 0=Sun

                // If no recurrence specified, assume all days
                const targetDays = recurrence.length > 0 ? recurrence : [0, 1, 2, 3, 4, 5, 6];

                // 2. Get completed instances for this template
                const instancesSnap = await this.db.collection('quest_instances')
                    .where('template_id', '==', tId)
                    .where('status', '==', 'COMPLETED')
                    .get();

                const completedDates = new Set();
                instancesSnap.forEach(i => completedDates.add(i.data().date));

                // 3. Calculate Streak
                let streak = 0;
                let checkDate = new Date();
                checkDate.setHours(0, 0, 0, 0);

                let safety = 365; // Extended check range
                let streakBroken = false;

                while (safety > 0 && !streakBroken) {
                    const dayIndex = checkDate.getDay();
                    const dateStr = checkDate.toISOString().split('T')[0];

                    // Psuedo-recurrence match
                    const isTarget = targetDays.some(d => parseInt(d) === dayIndex);

                    if (isTarget) {
                        if (completedDates.has(dateStr)) {
                            streak++;
                        } else {
                            // Missing!
                            const isToday = (dateStr === new Date().toISOString().split('T')[0]);
                            if (!isToday) {
                                streakBroken = true;
                            }
                        }
                    }

                    if (!streakBroken) {
                        checkDate.setDate(checkDate.getDate() - 1);
                        safety--;
                    }
                }

                habits.push({
                    id: tId,
                    title: temp.title,
                    streak: streak,
                    emoji: temp.emoji || '📅'
                });
            });

            await Promise.all(promises);

            // Sort logic: Ongoing (Streak < 30) first, then Achieved (Streak >= 30)
            habits.sort((a, b) => {
                const aAchieved = a.streak >= 30;
                const bAchieved = b.streak >= 30;

                if (aAchieved && !bAchieved) return 1;
                if (!aAchieved && bAchieved) return -1;

                return b.streak - a.streak;
            });

            return habits;

        } catch (e) {
            console.error("Error calculating habit streaks:", e);
            throw e;
        }
    },

    renderHabitsTile: async function () {
        // Parent container
        const grid = document.querySelector('.achievements-grid');
        if (!grid) return;

        // Check/Create Tile
        let tile = document.querySelector('.habits-tile');
        if (!tile) {
            tile = document.createElement('div');
            tile.className = 'stat-tile tile-wide habits-tile';
            tile.innerHTML = `
                <div class="chart-header">
                    <h3>Habit Building</h3>
                    <span class="chart-subtitle">Target: 30 Days</span>
                </div>
                <div class="habits-list">
                    <div class="loading-spinner">Loading...</div>
                </div>
             `;
            grid.appendChild(tile);
        }

        const listContainer = tile.querySelector('.habits-list');
        if (!listContainer) return;

        try {
            const habits = await this.calculateHabitStreaks();

            if (habits.length === 0) {
                listContainer.innerHTML = `<div class="empty-state">No periodic habits found.</div>`;
                return;
            }

            let html = '';
            habits.forEach(h => {
                const isAchieved = h.streak >= 30;
                const percent = Math.min(100, (h.streak / 30) * 100);
                const statusClass = isAchieved ? 'habit-achieved' : '';

                // Emoji Logic: 🌱 for ongoing, 🏆 for completed
                const displayEmoji = isAchieved ? '🏆' : '🌱';

                html += `
                    <div class="habit-item ${statusClass}">
                        <div class="habit-info">
                            <span class="habit-name">${displayEmoji} ${h.title}</span>
                            <span class="habit-count">${h.streak}/30</span>
                        </div>
                        <div class="habit-progress-bg">
                            <div class="habit-progress-fill" style="width: ${percent}%;"></div>
                        </div>
                    </div>
                 `;
            });

            listContainer.innerHTML = html;
        } catch (e) {
            console.error("Habits Render Error:", e);
            listContainer.innerHTML = `<div class="empty-state" style="color:#d93025;">Error loading habits. Check console.</div>`;
        }
    },

    // --- UI UPDATES ---
    updateStreakTile: async function () {
        // TILE 1: Current Streak
        const tile1 = document.querySelector('.achievements-grid .stat-tile:nth-child(1)');
        if (tile1) {
            tile1.innerHTML = `
                <h3>Current Streak</h3>
                <div class="streak-value" style="font-size: 3rem; font-weight: 800; color: #FFD700;">
                    ${this.statsCache.currentStreak} <span style="font-size: 1.5rem;">days</span>
                </div>
                <div class="streak-fire" style="font-size: 2rem;">🔥</div>
            `;
        }

        // TILE 2: Best Streak
        const tile2 = document.querySelector('.achievements-grid .stat-tile:nth-child(2)');
        if (tile2) {
            tile2.innerHTML = `
                <h3>Best Streak</h3>
                <div class="streak-value" style="font-size: 3rem; font-weight: 800; color: #4285F4;">
                    ${this.statsCache.bestStreak || 0} <span style="font-size: 1.5rem;">days</span>
                </div>
                <div class="streak-fire" style="font-size: 2rem;">💎</div>
            `;
        }

        // TILE 3: Global Stats
        const globalStats = await this.calculateGlobalStats();

        const totalEl = document.getElementById('totalQuestsValue');
        if (totalEl) totalEl.innerText = globalStats.total;

        const dEl = document.getElementById('totalDaily');
        if (dEl) dEl.innerText = globalStats.daily;

        const wEl = document.getElementById('totalWeekly');
        if (wEl) wEl.innerText = globalStats.weekly;

        const mEl = document.getElementById('totalMonthly');
        if (mEl) mEl.innerText = globalStats.monthly;

        const avgText = document.getElementById('averagePercent');
        const avgFill = document.getElementById('avgProgressFill');

        if (avgText) avgText.innerText = globalStats.avgScore + "%";
        if (avgFill) avgFill.style.width = globalStats.avgScore + "%";

        // TILE 4: Weekly Wave Chart
        this.renderWeeklyChart();

        // TILE 5: Habits (New)
        this.renderHabitsTile();
    }
};

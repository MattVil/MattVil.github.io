// ==========================================
// AUTHENTICATION MODULE
// ==========================================

const ENCRYPTED_CONFIG = "U2FsdGVkX18mZec/cFVYe9asXI38d8kogEDARqxksKvt1xv7SM3K2yPa9OBFjZt0C9R4gd6ElKWawX3lTpFt0d8B3nLMgtibEW/VMawI1vb9EymX/9KqFn+jRCncgVT836j55eif4ItsGHEHMwjoU9WqcIC5jNusMXnt6uNcEF249C+A+KZ9RTPnFrfGmPHOhm7PMUCcZoOcxsiY1fynp+cOdRfInurnC+YAIACwPTqPhJdeHPFHiJyF6H0IP/JURMzwdJagCqYJvgQVa19rBGfcGjLEEOWaj7wN0DxY5wPsHsL96LXxn5LEXIPFFCDHOCDmdLBA3DP2dvDQZ5WMbGqwN42SNUqeZwVpPBKMFl+idGDK8b+1R8uTLgfDx3mQKjo5IcFmNZypUO9K/yfkI624YRJbI/AV7GCisx++8d6fJQXq/XvspjYTtBIdWJu+";

const Auth = {
    elements: {},

    init: function (onSuccess) {
        this.cacheDOM();
        this.bindEvents(onSuccess);

        // Auto-login check
        const savedPassword = localStorage.getItem('dailyQuestKey');
        if (savedPassword) {
            this.tryLogin(savedPassword, onSuccess);
        }
    },

    cacheDOM: function () {
        this.elements = {
            overlay: document.getElementById('loginOverlay'),
            input: document.getElementById('passwordInput'),
            btn: document.getElementById('loginBtn'),
            error: document.getElementById('loginError')
        };
    },

    bindEvents: function (onSuccess) {
        const tryLoginWrapper = () => {
            if (this.elements.input.value) {
                this.tryLogin(this.elements.input.value, onSuccess);
            }
        };

        this.elements.btn.addEventListener('click', tryLoginWrapper);
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') tryLoginWrapper();
        });
    },

    tryLogin: function (password, callback) {
        try {
            const bytes = CryptoJS.AES.decrypt(ENCRYPTED_CONFIG, password);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);

            if (!originalText) throw new Error("Decryption empty");

            const config = JSON.parse(originalText);

            // Success
            localStorage.setItem('dailyQuestKey', password);
            this.hideOverlay();

            if (callback) callback(config);

        } catch (error) {
            console.error("Login failed:", error);
            this.elements.error.style.display = 'block';
            this.elements.input.value = '';

            // Clear bad key if stored
            localStorage.removeItem('dailyQuestKey');
        }
    },

    hideOverlay: function () {
        this.elements.overlay.classList.add('hidden-overlay');
    }
};

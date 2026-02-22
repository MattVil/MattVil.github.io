// ==========================================
// MODULE QUICK NOTES
// Core logic for managing Quick Notes.
// ==========================================

const NotesLogic = {
    db: null,
    elements: {},
    notesCount: 0,
    currentEditNoteId: null,
    unsubscribe: null,

    init: function (database) {
        this.db = database;
        this.cacheDOM();
        this.bindEvents();
        this.loadNotes();
    },

    cacheDOM: function () {
        this.elements = {
            notesList: document.getElementById('notesList'),
            addNoteBtn: document.getElementById('addNoteBtn'),

            noteFormModal: document.getElementById('noteFormModal'),
            closeNoteFormBtn: document.getElementById('closeNoteFormBtn'),
            quickNoteForm: document.getElementById('quickNoteForm'),
            noteFormTitle: document.getElementById('noteFormTitle'),
            saveNoteBtn: document.getElementById('saveNoteBtn'),
            deleteNoteBtn: document.getElementById('deleteNoteBtn'),

            noteIdInput: document.getElementById('noteId'),
            noteContentInput: document.getElementById('noteContentInput'),
        };
    },

    bindEvents: function () {
        const el = this.elements;

        el.addNoteBtn.addEventListener('click', () => this.openForm());
        el.closeNoteFormBtn.addEventListener('click', () => this.closeForm());

        el.quickNoteForm.addEventListener('submit', (e) => this.handleSaveNote(e));
        el.deleteNoteBtn.addEventListener('click', () => this.handleDeleteNote());
    },

    loadNotes: function () {
        // Real-time listener for Quick Notes ordered by update time
        this.unsubscribe = this.db.collection('quick_notes')
            .orderBy('updated_at', 'desc')
            .onSnapshot(snapshot => {
                const notes = [];
                snapshot.forEach(doc => {
                    notes.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) });
                });
                this.renderNotes(notes);
            }, error => {
                console.error("Error loading notes:", error);
            });
    },

    renderNotes: function (notes) {
        this.elements.notesList.innerHTML = '';

        notes.forEach(note => {
            const tile = document.createElement('div');
            tile.className = 'note-tile';

            const dateStr = note.updated_at ? note.updated_at.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';

            tile.innerHTML = `
                <div class="note-excerpt">${note.content ? note.content.replace(/</g, "&lt;").replace(/>/g, "&gt;") : ''}</div>
                <div class="note-footer" style="margin-top: 8px; text-align: right;">
                    <span class="note-date">${dateStr}</span>
                </div>
            `;

            tile.addEventListener('click', () => this.openForm(note));
            this.elements.notesList.appendChild(tile);
        });
    },

    openForm: function (noteData = null) {
        const el = this.elements;

        if (noteData) {
            this.currentEditNoteId = noteData.id;
            el.noteFormTitle.innerText = "Edit Note";
            el.noteIdInput.value = noteData.id;
            el.noteContentInput.value = noteData.content || '';
            el.saveNoteBtn.innerText = "Update Note";
            el.deleteNoteBtn.classList.remove('hidden-action-btn');
        } else {
            this.currentEditNoteId = null;
            el.noteFormTitle.innerText = "Add Quick Note";
            el.quickNoteForm.reset();
            el.noteIdInput.value = '';
            el.saveNoteBtn.innerText = "Save Note";
            el.deleteNoteBtn.classList.add('hidden-action-btn');
        }

        el.noteFormModal.classList.add('open');
    },

    closeForm: function () {
        this.elements.noteFormModal.classList.remove('open');
        this.currentEditNoteId = null;
    },

    handleSaveNote: async function (e) {
        e.preventDefault();
        const el = this.elements;

        const noteData = {
            content: el.noteContentInput.value.trim(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (this.currentEditNoteId) {
                // Update
                await this.db.collection('quick_notes').doc(this.currentEditNoteId).update(noteData);
            } else {
                // Create
                noteData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                await this.db.collection('quick_notes').add(noteData);
            }
            this.closeForm();
        } catch (error) {
            console.error("Error saving note:", error);
            alert("Failed to save note. Check console for details.");
        }
    },

    handleDeleteNote: async function () {
        if (!this.currentEditNoteId) return;

        try {
            await this.db.collection('quick_notes').doc(this.currentEditNoteId).delete();
            this.closeForm();
        } catch (error) {
            console.error("Error deleting note:", error);
            alert("Failed to delete note.");
        }
    }
};

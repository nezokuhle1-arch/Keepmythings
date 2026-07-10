/*
  Note shape:
  {
    id: string,              // from generateId()
    type: "text" | "checklist",
    title: string,
    body: string,             // used when type === "text"
    items: [                  // used when type === "checklist"
      { id: string, text: string, checked: boolean }
    ],
    labelIds: string[],       // e.g. ["id_123", "id_456"]
    color: string,            // e.g. "#faafa8"
    pinned: boolean,
    archived: boolean,
    createdAt: number         // Date.now()
  }

  Label shape:
  {
    id: string,
    name: string
  }
*/


// ---- Storage keys ----
const NOTES_KEY = "keep_notes";
const LABELS_KEY = "keep_labels";

// ---- Notes drawer ----

function getNotes() {
    // Reach into the cabinet drawer and pull out the raw paper (a string).
    const raw = localStorage.getItem(NOTES_KEY);

    // If the drawer has never been filled before, raw will be `null`.
    // In that case, hand back an empty array instead of crashing on JSON.parse(null).
    if (!raw) {
        return [];
    }

    // Translate the paper back into a real array of note objects.
    return JSON.parse(raw);
}

function saveNotes(notes) {
    // Translate the array of note objects into paper (a string)...
    const raw = JSON.stringify(notes);

    // ...and file that paper into the drawer, overwriting whatever was there before.
    localStorage.setItem(NOTES_KEY, raw);
}

// ---- Labels drawer ----

function getLabels() {
    const raw = localStorage.getItem(LABELS_KEY);
    if (!raw) {
        return [];
    }
    return JSON.parse(raw);
}

function saveLabels(labels) {
    localStorage.setItem(LABELS_KEY, JSON.stringify(labels));
}

// ---- Generating IDs ----
function generateId() {
    return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Composer (scratch pad) state ----
let composerOpen = false;
let composerType = "text";
let draftTitle = "";
let draftBody = "";
let draftItems = [];

// ---- Rendering notes ----

function renderNotes() {
  const mainEl = document.querySelector("main");
  const notes = getNotes();

  // Only show notes that are NOT archived on the main board.
  // (Archived notes will get their own view later.)
  const visibleNotes = notes.filter(function (note) {
      return note.archived === false;
  });

  const noteCardsHtml = visibleNotes.map(function (note) {
      // Decide what goes in the "body" area depending on note type.
      const bodyHtml =
          note.type === "checklist"
              ? renderChecklistItems(note.items, note.id)
              : `<p class="note-body">${note.body}</p>`;

      return `
          <div class="note-card" style="background-color: ${note.color};" data-id="${note.id}">
              <h3 class="note-title">${note.title}</h3>
              ${bodyHtml}
              <div class="note-footer">
                  <span class="material-symbols-outlined archive-btn" data-id="${note.id}">
                      archive
                  </span>
                  <span class="material-symbols-outlined pin-btn" data-id="${note.id}">
                      ${note.pinned ? "keep" : "keep_off"}
                  </span>
              </div>
          </div>
      `;
  });

  mainEl.innerHTML = renderComposer() + noteCardsHtml.join("");
}

function renderChecklistItems(items) {
  const itemsHtml = items.map(function (item) {
      return `
          <div class="checklist-item">
              <input type="checkbox" ${item.checked ? "checked" : ""} data-id="${item.id}">
              <span>${item.text}</span>
          </div>
      `;
  });
  return itemsHtml.join("");
}

// ---- Toggling notes ----

function toggleArchive(noteId) {
  const notes = getNotes();
  const note = notes.find(function (n) {
      return n.id === noteId;
  });
  note.archived = !note.archived;
  saveNotes(notes);
  renderNotes();
}

function togglePin(noteId) {
  const notes = getNotes();
  const note = notes.find(function (n) {
      return n.id === noteId;
  });
  note.pinned = !note.pinned;
  saveNotes(notes);
  renderNotes();
}

function toggleChecklistItem(noteId, itemId) {
  const notes = getNotes();
  const note = notes.find(function (n) {
      return n.id === noteId;
  });
  const item = note.items.find(function (i) {
      return i.id === itemId;
  });
  item.checked = !item.checked;
  saveNotes(notes);
  renderNotes();
}

// ---- Handling clicks ----

function handleMainClick(event) {

    const checklistTrigger = event.target.closest("[data-action='expand-checklist']");
    if (checklistTrigger) {
        composerOpen = true;
        composerType = "checklist";
        renderNotes();
        return;
    }

    const textTrigger = event.target.closest("[data-action='expand-text']");
    if (textTrigger) {
        composerOpen = true;
        composerType = "text";
        renderNotes();
        document.querySelector("#composer-title").focus();
        return;
    }

    const closeBtn = event.target.closest("[data-action='close-composer']");
    if (closeBtn) {
        saveComposerNote();
        return;
    }

    const archiveBtn = event.target.closest(".archive-btn");
    if (archiveBtn) {
        toggleArchive(archiveBtn.dataset.id);
        return;
    }

    const pinBtn = event.target.closest(".pin-btn");
    if (pinBtn) {
        togglePin(pinBtn.dataset.id);
        return;
    }

    const checkbox = event.target.closest(".checklist-item input[type='checkbox']");
    if (checkbox) {
        toggleChecklistItem(checkbox.dataset.noteId, checkbox.dataset.id);
        return;
    }
}

document.querySelector("main").addEventListener("click", handleMainClick);

// ---- Rendering checklist items ----
function renderChecklistItems(items, noteId) {
    const itemsHtml = items.map(function (item) {
        return `
            <div class="checklist-item">
                <input type="checkbox" ${item.checked ? "checked" : ""} data-id="${item.id}" data-note-id="${noteId}">
                <span>${item.text}</span>
            </div>
        `;
    });
    return itemsHtml.join("");
}

// ---- Rendering composer ----

function renderComposer() {
    if (!composerOpen) {
        return `
            <div class="composer collapsed" id="composer">
                <span data-action="expand-text">Take a note...</span>
                <span class="material-symbols-outlined" data-action="expand-checklist">checklist</span>
            </div>
        `;
    }

    const bodyFieldHtml =
        composerType === "checklist"
            ? renderComposerChecklist()
            : `<textarea id="composer-body" data-field="body" placeholder="Take a note...">${draftBody}</textarea>`;

    return `
        <div class="composer expanded" id="composer">
            <input type="text" id="composer-title" data-field="title" placeholder="Title" value="${draftTitle}">
            ${bodyFieldHtml}
            <div class="composer-toolbar">
                <button type="button" data-action="close-composer">Close</button>
            </div>
        </div>
    `;
}

function renderComposerChecklist() {
    const itemsHtml = draftItems.map(function (item) {
        return `<div class="composer-checklist-item">• ${item.text}</div>`;
    });

    return `
        <div class="composer-checklist">
            ${itemsHtml.join("")}
            <input type="text" id="composer-new-item" placeholder="List item">
        </div>
    `;
}

//---- Handling input ----
function handleMainInput(event) {
    const field = event.target.dataset.field;
    if (field === "title") {
        draftTitle = event.target.value;
    } else if (field === "body") {
        draftBody = event.target.value;
    }
}

document.querySelector("main").addEventListener("input", handleMainInput);


function handleMainKeydown(event) {
    if (event.key === "Enter" && event.target.id === "composer-new-item") {
        event.preventDefault();
        const text = event.target.value.trim();
        if (text.length > 0) {
            draftItems.push({ id: generateId(), text: text, checked: false });
        }
        renderNotes();
        document.querySelector("#composer-new-item").focus();
    }
}

document.querySelector("main").addEventListener("keydown", handleMainKeydown);

// ---- Saving composer note ----

function saveComposerNote() {
    const hasContent =
        draftTitle.trim().length > 0 ||
        draftBody.trim().length > 0 ||
        draftItems.length > 0;

    if (hasContent) {
        const notes = getNotes();
        const newNote = {
            id: generateId(),
            type: composerType,
            title: draftTitle.trim(),
            body: composerType === "text" ? draftBody.trim() : "",
            items: composerType === "checklist" ? draftItems : [],
            labelIds: [],
            color: "#ffffff",
            pinned: false,
            archived: false,
            createdAt: Date.now()
        };
        notes.push(newNote);
        saveNotes(notes);
    }

    resetComposer();
    renderNotes();
}

function resetComposer() {
    composerOpen = false;
    composerType = "text";
    draftTitle = "";
    draftBody = "";
    draftItems = [];
}

function handleDocumentClick(event) {
    if (!composerOpen) {
        return;
    }
    const insideComposer = event.target.closest("#composer");
    if (!insideComposer) {
        saveComposerNote();
    }
}

document.addEventListener("click", handleDocumentClick);

renderNotes();

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
              ? renderChecklistItems(note.items)
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

  mainEl.innerHTML = noteCardsHtml.join("");
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

renderNotes();
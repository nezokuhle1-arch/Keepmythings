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
// Think of these as the labels on the two drawers in the cabinet.
// One drawer holds all your notes, the other holds all your labels (paperclips).
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
// Every note and label needs a unique ID, like a serial number stamped
// on a sticky note so you can always find *that specific one* again later,
// even if two notes have identical text.
function generateId() {
    // Date.now() = current timestamp in milliseconds (basically always increasing)
    // Math.random() chunk = extra randomness in case two notes are created in the same millisecond
    return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
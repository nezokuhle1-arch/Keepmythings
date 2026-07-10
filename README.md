# Keepmythings
ZAIO Institute assignment - Google Keep clone

A simplified clone of Google Keep, built with vanilla HTML, CSS, and JavaScript as part of a Zaio Institute assignment.

## Features

- Create notes as plain text or checklists
- Notes persist in the browser via `localStorage`
- Archive notes to remove them from the main view
- Pin notes
- Toggle checklist items on/off
- Search notes by title or body content
- Color-coded note cards
- Responsive, masonry-style note layout

## Project structure
├── index.html      # App shell: nav, sidebar, and main note area
├── style.css       # All styling
├── script.js       # All application logic
└── README.md

## How it works

- Notes and labels are stored in the browser's `localStorage`, so data persists across page refreshes but is specific to the browser/device used.
- The composer (note creation area) expands from a collapsed "Take a note..." bar into a full editor, supporting both plain text and checklist note types.
- Clicking outside the composer automatically saves the note (if it has content) and collapses the editor.

## Known limitations

- Labels, reminders, and collaborators (present in the real Google Keep) are out of scope for this version.
- Data is local to the browser and is not synced across devices.

## Author

Built by Nezokuhle Tshukulwana for the Zaio Institute Google Keep Clone assignment.

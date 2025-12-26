# Accessibility Plan — WCAG 2.1 AA Compliance

**Goal:** Make Story Cards fully accessible for blind and visually impaired users, meeting or exceeding WCAG 2.1 AA standards.

**Target:** Screen reader users (NVDA, JAWS, VoiceOver), keyboard-only users, and users with low vision.

**Status:** Phases 1-3 complete (December 25, 2025)

---

## Current Issues (Audit Summary)

| Issue | WCAG Criterion | Severity |
|-------|----------------|----------|
| No semantic landmarks | 1.3.1, 2.4.1 | High |
| Missing ARIA labels on buttons | 1.1.1, 4.1.2 | High |
| Custom controls lack ARIA roles | 4.1.2 | High |
| No visible focus indicators | 2.4.7 | High |
| Modals lack focus trapping | 2.4.3 | High |
| Drag-and-drop only (no keyboard alternative) | 2.1.1 | Critical |
| Color-only status indicators | 1.4.1 | Medium |
| No skip link | 2.4.1 | Medium |
| Context menus not keyboard accessible | 2.1.1 | High |
| Dynamic content not announced | 4.1.3 | Medium |
| Low contrast in some areas | 1.4.3 | Medium |

---

## Phase 1: Semantic Structure ✅ COMPLETE

Add proper HTML5 landmarks so screen readers can navigate.

### Tasks

- [x] **1.1 Add landmark roles**
  ```html
  <header role="banner">
  <nav role="navigation" aria-label="Main toolbar">
  <main role="main" id="main-content">
  <footer role="contentinfo"> (for status bar)
  ```

- [x] **1.2 Add skip link**
  ```html
  <a href="#main-content" class="skip-link">Skip to main content</a>
  ```
  Style to be visible only on focus.

- [x] **1.3 Use semantic elements for views**
  - Wrap each view in `<section aria-labelledby="...">`
  - Add `<h2>` headings for each view (can be visually hidden)

- [x] **1.4 Cards as articles or list items**
  - Story beat cards: `<article>` or `<li role="listitem">`
  - Acts: `<section aria-labelledby="act-title-{id}">`
  - Shots: `<article>` with proper headings

---

## Phase 2: ARIA Labels & Roles ✅ COMPLETE

### Tasks

- [x] **2.1 Label all buttons**
  ```html
  <button aria-label="Add new story beat card">+ Card</button>
  <button aria-label="Toggle dark mode">☀️</button>
  <button aria-label="Open settings">⚙️</button>
  <button aria-label="Zoom out">−</button>
  <button aria-label="Zoom in">+</button>
  ```

- [x] **2.2 Label view toggle buttons as tabs**
  ```html
  <div role="tablist" aria-label="View options">
    <button role="tab" aria-selected="true" aria-controls="actsView">Acts</button>
    <button role="tab" aria-selected="false" aria-controls="swimlaneView">Swimlanes</button>
    <button role="tab" aria-selected="false" aria-controls="storyboardView">Storyboard</button>
  </div>
  <div role="tabpanel" id="actsView" aria-labelledby="acts-tab">
  ```

- [x] **2.3 Label zoom slider**
  ```html
  <input type="range" aria-label="Zoom level" aria-valuemin="25" aria-valuemax="200" aria-valuenow="100" aria-valuetext="100%">
  ```

- [x] **2.4 Custom toggle switches**
  ```html
  <div role="switch" aria-checked="true" aria-label="Dark mode" tabindex="0">
  ```

- [ ] **2.5 Status indicators with text** (remaining)
  ```html
  <span class="status-badge status-draft" aria-label="Status: Draft">Draft</span>
  ```

---

## Phase 3: Keyboard Navigation ✅ COMPLETE

### Tasks

- [x] **3.1 Add tabindex to all interactive elements**
  - Cards: `tabindex="0"`
  - Acts (draggable): `tabindex="0"`
  - Shots: `tabindex="0"`
  - Toggle switches: `tabindex="0"`

- [x] **3.2 Keyboard handlers for cards**
  ```javascript
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openEditModal(card);
    if (e.key === 'Delete') deleteCard(card);
    if (e.key === 'ArrowUp') moveFocusToPrevCard();
    if (e.key === 'ArrowDown') moveFocusToNextCard();
  });
  ```

- [x] **3.3 Keyboard alternative for drag-and-drop**
  - Ctrl+Arrow keys to reorder cards (up/down) and shots (left/right)
  - Announce: "Moved to position 3 of 5"

- [ ] **3.4 Context menu keyboard support** (remaining)
  - Open with `Shift+F10` or `Menu` key
  - Arrow keys to navigate
  - `Enter` to select
  - `Escape` to close

- [x] **3.5 Modal focus management**
  - Focus first input on open
  - Return focus to trigger element on close

---

## Phase 4: Screen Reader Announcements ✅ COMPLETE

### Tasks

- [x] **4.1 Add live region for status updates**
  ```html
  <div id="announcer" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  ```

- [x] **4.2 Announce dynamic changes**
  ```javascript
  function announce(message) {
    document.getElementById('announcer').textContent = message;
  }
  // Usage:
  announce('Card "Opening Image" moved to Act II');
  announce('Storyboard view active. 5 shots.');
  announce('File loaded: story-beats.json');
  ```

- [x] **4.3 Announce modal open/close**
  - On open: focus first input, announce "Edit card dialog opened"
  - On close: return focus to trigger element

- [x] **4.4 Card descriptions for screen readers**
  ```html
  <article class="card" aria-label="Opening Image, Draft, Act 1">
    <h3 class="card-title">Opening Image</h3>
    <p class="card-desc">...</p>
    <span class="sr-only">Status: Draft. Subplot: Main.</span>
  </article>
  ```

---

## Phase 5: Visual Accessibility ✅ COMPLETE

### Tasks

- [x] **5.1 Visible focus indicators**
  ```css
  :focus {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  :focus:not(:focus-visible) {
    outline: none; /* Hide for mouse users */
  }
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  ```

- [ ] **5.2 Add text to status indicators (not color only)**
  - Draft: Show "D" or "Draft" badge
  - Review: Show "R" or "Review" badge
  - Done: Show "✓" or "Done" badge

- [ ] **5.3 Ensure 4.5:1 contrast ratio**
  - Audit all text colors against backgrounds
  - Especially: `--text-muted` against dark backgrounds

- [x] **5.4 Add `.sr-only` utility class**
  ```css
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  ```

---

## Phase 6: Forms & Inputs (Priority: MEDIUM)

### Tasks

- [ ] **6.1 Associate labels with inputs**
  ```html
  <label for="cardTitleInput">Title</label>
  <input type="text" id="cardTitleInput">
  ```

- [ ] **6.2 Add aria-describedby for help text**
  ```html
  <input id="authEmail" aria-describedby="authEmailHelp">
  <p id="authEmailHelp">Enter email + password, then Sign Up or Sign In.</p>
  ```

- [ ] **6.3 Error announcements**
  ```html
  <input aria-invalid="true" aria-describedby="emailError">
  <span id="emailError" role="alert">Invalid email format</span>
  ```

- [ ] **6.4 Required field indicators**
  ```html
  <label for="title">Title <span aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
  <input id="title" required aria-required="true">
  ```

---

## Phase 7: Testing & Validation

### Tasks

- [ ] **7.1 Automated testing**
  - Run axe DevTools audit
  - Run WAVE accessibility checker
  - Run Lighthouse accessibility audit

- [ ] **7.2 Manual screen reader testing**
  - Test with NVDA (Windows)
  - Test with VoiceOver (Mac/iOS)
  - Test with TalkBack (Android)

- [ ] **7.3 Keyboard-only navigation test**
  - Tab through entire interface
  - Operate all controls without mouse
  - Test drag-and-drop alternatives

- [ ] **7.4 Create accessibility statement**
  - Document conformance level
  - Known limitations
  - Contact for accessibility issues

---

## Implementation Order

| Phase | Est. Time | Dependencies |
|-------|-----------|--------------|
| Phase 1: Semantic Structure | 2 hours | None |
| Phase 2: ARIA Labels | 2 hours | Phase 1 |
| Phase 3: Keyboard Navigation | 4 hours | Phase 1, 2 |
| Phase 4: Screen Reader Announcements | 2 hours | Phase 1, 2 |
| Phase 5: Visual Accessibility | 1 hour | None |
| Phase 6: Forms & Inputs | 1 hour | None |
| Phase 7: Testing | 2 hours | All phases |

**Total estimated time:** 14 hours

---

## Quick Wins (Can Do Immediately)

1. Add `aria-label` to icon-only buttons (⚙️, ☀️, +, −)
2. Add `.sr-only` class and live region
3. Add visible focus styles
4. Add skip link
5. Label the zoom slider

---

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)
- [axe DevTools](https://www.deque.com/axe/)

---

## Notes

**Drag-and-drop is the biggest challenge.** WCAG requires keyboard alternatives for all mouse interactions. Options:

1. **Arrow keys to reorder** — When card is focused, up/down arrows move it
2. **Menu option** — "Move to..." submenu in context menu
3. **Keyboard shortcuts** — Ctrl+Up/Down to move card

For screen reader users, the reorder action should announce the new position.

---

*Document created December 25, 2025*

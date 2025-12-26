# Cinematic Blueprint — Progress & Status

**Last Updated:** December 26, 2025

---

## Quick Status

| Feature | Status |
|---------|--------|
| Core App | ✅ Complete |
| Cloud Auth & Save | ✅ Complete (Phase 1) |
| MCP Server | ✅ Complete |
| Accessibility (WCAG) | ✅ Complete (Phases 1-5) |
| Netlify Deployment | 🔲 Ready |
| Multi-Project Support | 🔲 Planned (Cloud Phase 2) |
| Image Cloud Storage | 🔲 Planned (Cloud Phase 3) |
| Timeline Visualization | 🔲 Not started |

---

## Completed ✅

### Core Application
- Single-file HTML app (`cinematic-blueprint.html`) — works offline
- **Three views:** Acts (Kanban), Swimlanes, Storyboard
- Drag-and-drop for cards, acts, and shots
- Inline editing, right-click context menus
- Light/dark mode, 17 built-in story templates
- Export to Markdown/JSON, load from local files

### Cloud Features (Phase 1 MVP)
- Firebase Authentication (Email/Password)
- Firestore cloud save/load
- User-specific storage: `users/{userId}/projects/default`
- Auth state persistence across refreshes
- Local fallback still works (Export/Load buttons)

**Known limitations:**
- Images not synced (base64 too large for Firestore)
- Single project per user (multi-project planned)

See [CLOUD_STATUS.md](CLOUD_STATUS.md) for details.

### MCP Server
- Location: `story-cards-mcp/`
- **Resources:** `storyboard://current`, `storyboard://shots`, `storyboard://beats`, `storyboard://acts`
- **Tools:** `add_shot`, `edit_shot`, `delete_shot`, `reorder_shots`, `add_beat`, `edit_beat`, `delete_beat`, `move_beat`, `add_act`, `import_markdown`, `export_storyboard`

**Windsurf config:**
```json
{
  "cinematic-blueprint": {
    "command": "node",
    "args": ["C:/Users/Owen/dev/Story-Cards-Tool/story-cards-mcp/dist/index.js"],
    "env": { "STORYBOARD_PATH": "C:/path/to/storyboard.json" }
  }
}
```

### Accessibility (WCAG 2.1 AA)
- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<section>`)
- Skip link for keyboard users
- ARIA labels on all buttons and controls
- View tabs with `role="tab"` and `aria-selected`
- Cards/shots: `tabindex`, keyboard handlers (Enter/Space/Delete)
- Keyboard reordering: `Ctrl+Arrow` for cards and shots
- Toggle switch: `role="switch"`, `aria-checked`
- Modal focus management and announcements
- Live region for screen reader announcements
- Visible focus indicators (`:focus-visible`)

**Remaining:** Status text badges (not color-only), context menu keyboard support.

See [ACCESSIBILITY.md](ACCESSIBILITY.md) for full plan.

---

## Next Steps

### 1. Deploy to Netlify (Ready Now)
| Task | Time |
|------|------|
| Create Netlify site from GitHub repo | 5 min |
| Add Netlify domain to Firebase Auth authorized domains | 5 min |
| Update Firestore security rules for production | 5 min |
| Restrict API key in Google Cloud Console | 5 min |

### 2. Cloud Phase 2: Multi-Project Support
- [ ] Project list/dashboard modal
- [ ] Create, rename, delete projects
- [ ] Last modified timestamps

### 3. Cloud Phase 3: Image Uploads
- [ ] Enable Firebase Storage
- [ ] Upload images on drop (instead of base64)
- [ ] Store Firebase Storage URLs

### 4. Timeline Visualization (Future)
- Horizontal zoomable timeline view
- Beat markers with act/subplot color coding

---

## Documentation

| File | Description |
|------|-------------|
| [README.md](README.md) | Quick start and features |
| [CLOUD_STATUS.md](CLOUD_STATUS.md) | Cloud implementation details |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | WCAG compliance plan |
| [MCP_SERVER_DESIGN.md](MCP_SERVER_DESIGN.md) | MCP architecture spec |
| [AGENTIC_WORKFLOW_OPTIONS.md](AGENTIC_WORKFLOW_OPTIONS.md) | AI workflow comparison |

---

## Quick Commands

```powershell
# Deploy to Netlify
netlify deploy --prod --dir .

# Start MCP server
cd story-cards-mcp; npm start

# Test MCP locally
npx @anthropic-ai/mcp-inspector story-cards-mcp
```

---

**Immediate Next Action:** Deploy to Netlify.

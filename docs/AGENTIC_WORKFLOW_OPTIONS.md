# Agentic Workflow Options for Story Cards Tool

## Project Overview

The Story Cards & Storyboard Tool is a single-file HTML application that allows users to:
- Create story beats with drag-and-drop organization
- Build visual storyboards with shots and images
- Export/import data as JSON and Markdown files
- Work entirely locally in the browser (no server required)

Current data formats:
- `storyboard.json` - Contains shots, metadata, version info
- `story-beats.md` - Markdown format for story structure and beats

---

## Option 1: File-Based Workflow (Simplest)

**How it works:**
1. AI agent reads `storyboard.json` or `story-beats.md` from project folder
2. Agent edits the JSON/Markdown programmatically
3. User reloads the file in browser via "Load" button

**Pros:**
- Works today with no code changes
- Simple and reliable
- Uses existing export/import functionality

**Cons:**
- Manual reload step required
- No live synchronization
- Potential for version conflicts

**Implementation:** Ready to use immediately

---

## Option 2: Watch Mode with Hot Reload

**How it works:**
Add a file watcher that auto-reloads when JSON/MD file changes:

```javascript
// Poll for file changes every 2 seconds
setInterval(async () => {
  const file = await fetch('storyboard.json');
  const data = await file.json();
  if (data.updated !== lastUpdated) loadFromData(data);
}, 2000);
```

**Pros:**
- Near real-time updates
- AI edits a file, browser auto-updates
- Minimal code changes

**Cons:**
- Requires running from a local server (not `file://`)
- Polling adds overhead
- Potential race conditions

**Implementation effort:** Low (1-2 hours)

---

## Option 3: GitHub Integration + Markdown-First

**How it works:**
Store storyboards as Markdown files in a GitHub repo:
1. Tool connects to GitHub via OAuth
2. Read/write `.md` files directly to the repo
3. AI agents edit Markdown in the IDE
4. Push/pull syncs between browser and repo

**Data format (already supported):**
```markdown
## Act I: Setup
### 1. Opening Scene
- **Status:** draft
- **Subplot:** main
The protagonist wakes up...
```

**Pros:**
- Full version control with Git history
- AI-native Markdown editing
- Collaboration via pull requests
- Branch-based workflows
- Works with any IDE/editor

**Cons:**
- More complex to implement
- Requires GitHub API integration
- Network dependency
- OAuth setup required

**Implementation effort:** Medium (1-2 days)

---

## Option 4: Local WebSocket Server

**How it works:**
A small Node.js server that bridges IDE ↔ Browser:
```
IDE (Cascade) → WebSocket → story-cards.html
```

- Agent sends commands like `{ action: "addShot", data: {...} }`
- Browser receives and updates UI in real-time
- Bidirectional synchronization

**Pros:**
- Real-time updates
- Powerful API for complex operations
- No file I/O limitations
- Can handle multiple simultaneous connections

**Cons:**
- Requires running a local server
- More complex setup
- WebSocket implementation needed
- Potential connection issues

**Implementation effort:** Medium-High (2-3 days)

---

## Option 5: REST API via Firebase

**How it works:**
Once Firebase is set up (as outlined in CLOUD_HOSTING_PROPOSAL.md):
- `GET /projects/{id}` → Returns project JSON
- `PUT /projects/{id}` → Updates project
- AI agent calls the API directly with auth token

**Pros:**
- Works remotely from anywhere
- Integrates with cloud save plans
- Scalable and robust
- Real-time collaboration possible

**Cons:**
- Depends on completing Firebase setup
- Requires authentication handling
- Network latency
- More complex than local options

**Implementation effort:** High (3-5 days, builds on cloud hosting)

---

## Recommended Implementation Path

### Phase 1: Immediate (Today)
**Use Option 1 - File-Based Workflow**
- Export `storyboard.json` or `story-beats.md`
- AI agent reads and edits the file
- User reloads via "Load" button
- Zero development effort required

### Phase 2: Short-term (1-2 days)
**Implement Option 2 - Watch Mode**
- Add file polling to story-cards.html
- Auto-reload when external changes detected
- Serve from local HTTP server
- Significantly improves user experience

### Phase 3: Medium-term (1-2 weeks)
**Build Option 3 - GitHub Integration**
- Implement GitHub OAuth
- Store storyboards as Markdown in repos
- Enable full Git workflow
- Maximum AI compatibility and collaboration

### Phase 4: Long-term (1-2 months)
**Complete Option 5 - Firebase API**
- Finish cloud hosting implementation
- Add REST API endpoints
- Enable remote AI editing
- Full cloud-native solution

---

## Quick Win: Available Now

The file-based workflow (Option 1) can be used immediately:

1. **Export** your storyboard as `storyboard.json` or `story-beats.md`
2. **Tell me** what changes you want (add shots, reorder beats, etc.)
3. **I'll edit** the file programmatically
4. **You reload** in the browser to see changes

This demonstrates the value of agentic editing without any development overhead.

---

## Technical Considerations

### Data Structure (Storyboard JSON)
```javascript
{
  "version": "1.0",
  "updated": "2025-12-12T...",
  "shots": [
    {
      "id": "s_xyz789",
      "shotNumber": "1A",
      "imageUrl": "path/to/image.jpg",
      "description": "Wide establishing shot",
      "camera": "Drone",
      "duration": 5,
      "order": 0
    }
  ]
}
```

### Data Structure (Story Beats Markdown)
```markdown
## Act I: Setup
### 1. Opening Scene
- **Status:** draft
- **Subplot:** main
- **Scene:** scene-001
Description of the opening scene beats...

### 2. Inciting Incident
- **Status:** draft
- **Subplot:** main
What kicks off the story...
```

### Security & Permissions
- Local file access requires user permission
- GitHub integration needs OAuth scopes
- Firebase requires proper security rules
- Consider data validation for AI edits

---

## Next Steps

1. **Try Option 1** - Export a file and let me edit it
2. **Evaluate Option 2** - Decide if watch mode is worth implementing
3. **Plan Option 3** - Consider GitHub integration for long-term strategy
4. **Review cloud proposal** - Align with existing Firebase plans

---

*This document was created on December 12, 2025 to explore agentic workflow options for the Story Cards & Storyboard Tool.*

# Cloud Hosting Proposal: Story Cards & Storyboard Tool

## Overview

Transform the current local-only tool into a cloud-hosted application where users can:
- Sign in with Google (or email/password)
- Save projects to the cloud automatically
- Access their storyboards from any device
- Optionally share/collaborate on projects

---

## Recommended Stack

| Component | Service | Why |
|-----------|---------|-----|
| **Static Hosting** | Netlify | Free, fast, easy deploys from Git |
| **Authentication** | Firebase Auth | Google sign-in in ~10 lines of code |
| **Database** | Firebase Firestore | NoSQL, real-time sync, generous free tier |
| **Image Storage** | Firebase Storage | For uploaded storyboard images |

### Cost Estimate

| Tier | Users | Monthly Cost |
|------|-------|--------------|
| Free | ~100 active users | $0 |
| Light usage | ~500 users | $0-5 |
| Medium | ~2000 users | $10-25 |

Firebase free tier includes:
- 50K document reads/day
- 20K document writes/day  
- 5GB storage
- 1GB image storage

---

## Features by Phase

### Phase 1: Basic Cloud Save (MVP)
- [ ] Google sign-in button
- [ ] Save story beats to Firestore
- [ ] Save storyboard shots to Firestore
- [ ] Load user's projects on sign-in
- [ ] Offline fallback (localStorage) when not signed in

### Phase 2: Multi-Project Support
- [ ] Project list/dashboard
- [ ] Create new project
- [ ] Rename/delete projects
- [ ] Last modified timestamps

### Phase 3: Image Uploads
- [ ] Upload images to Firebase Storage (not just references)
- [ ] Image thumbnails for faster loading
- [ ] Storage quota per user

### Phase 4: Collaboration (Optional)
- [ ] Share project via link
- [ ] View-only vs edit permissions
- [ ] Real-time sync (multiple editors)

---

## Implementation Steps

### Step 1: Firebase Project Setup (15 min)
1. Create Firebase project at console.firebase.google.com
2. Enable Authentication → Google sign-in
3. Create Firestore database
4. Get config keys

### Step 2: Add Firebase SDK to HTML (30 min)
1. Add Firebase script tags
2. Initialize Firebase with config
3. Add auth state listener

### Step 3: Build Auth UI (1 hour)
1. Add sign-in/sign-out buttons to toolbar
2. Show user avatar when signed in
3. Handle auth state changes

### Step 4: Cloud Save/Load Functions (2 hours)
1. Create Firestore data structure:
   ```
   users/{userId}/projects/{projectId}
   ├── metadata (name, updated, created)
   ├── beats[] 
   ├── acts[]
   └── shots[]
   ```
2. Replace `exportFile()` with cloud save
3. Add auto-save on changes (debounced)
4. Load projects on sign-in

### Step 5: Project Selector (1 hour)
1. Add "My Projects" modal
2. List user's projects with timestamps
3. Create/rename/delete projects

### Step 6: Deploy to Netlify (15 min)
1. Connect GitHub repo to Netlify
2. Configure build (none needed - static HTML)
3. Set up custom domain (optional)

### Step 7: Image Storage (2 hours) - Phase 3
1. Add Firebase Storage
2. Upload dropped images to cloud
3. Store download URLs in shot data
4. Add upload progress indicator

---

## Data Structure

### Firestore Schema

```javascript
// Collection: users/{userId}/projects/{projectId}
{
  name: "My Video Project",
  created: Timestamp,
  updated: Timestamp,
  
  acts: [
    { id: "act1", name: "Act I: Setup" },
    { id: "act2", name: "Act II: Confrontation" }
  ],
  
  cards: [
    { 
      id: "c_abc123", 
      title: "Opening Scene", 
      description: "...",
      act: "act1",
      status: "draft",
      order: 0
    }
  ],
  
  shots: [
    {
      id: "s_xyz789",
      shotNumber: "1A",
      imageUrl: "https://firebasestorage.googleapis.com/...",
      imagePath: "images/shot-001.jpg", // original filename
      description: "Wide establishing shot",
      camera: "Drone",
      duration: 5,
      order: 0
    }
  ]
}
```

---

## Security Rules

```javascript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/projects/{projectId} {
      // Users can only read/write their own projects
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Migration Path

Users with existing local files can:
1. Sign in to cloud version
2. Use existing "Load" button to import .md or .json files
3. Data automatically saves to cloud

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Firebase costs spike | Set budget alerts, implement rate limiting |
| User loses work | Auto-save every 30 seconds, keep localStorage backup |
| Firebase outage | Offline mode with localStorage, sync when back |
| Large images fill storage | Compress on upload, set per-user quota |

---

## Timeline Estimate

| Phase | Effort | 
|-------|--------|
| Phase 1 (MVP) | 4-6 hours |
| Phase 2 (Multi-project) | 2-3 hours |
| Phase 3 (Image uploads) | 3-4 hours |
| Phase 4 (Collaboration) | 8-12 hours |

**MVP to deployed**: ~1 day of focused work

---

## Next Steps

1. **Decision**: Confirm Firebase as the backend choice
2. **Setup**: Create Firebase project, get API keys
3. **Implement**: Start with Phase 1 (auth + basic save/load)
4. **Test**: Verify with 2-3 test users
5. **Deploy**: Push to Netlify, share URL

---

## Decisions Made

- **Auth method**: Google sign-in only (simpler, no password management)
- **Collaboration**: Yes, sharing with other users is a goal (Phase 4)
- **Local mode**: Keep working without sign-in, cloud sync when signed in

---

## Firebase Setup Checklist

Go to [console.firebase.google.com](https://console.firebase.google.com):

1. **Create Project**
   - Click "Add project"
   - Name it (e.g., "story-cards-tool")
   - Disable Google Analytics (optional, not needed)

2. **Enable Authentication**
   - Go to Build → Authentication → Get started
   - Click "Sign-in method" tab
   - Enable "Google" provider
   - Add your email as support email

3. **Create Firestore Database**
   - Go to Build → Firestore Database → Create database
   - Start in "test mode" (we'll add security rules later)
   - Choose region (us-central1 is fine)

4. **Register Web App**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" → Click web icon (`</>`)
   - Register app (nickname: "story-cards-web")
   - Copy the `firebaseConfig` object — looks like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123...",
     appId: "1:123...:web:abc..."
   };
   ```

5. **Share the config** — Paste it here when ready and I'll integrate it.

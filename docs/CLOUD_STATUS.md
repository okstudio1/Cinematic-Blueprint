# Cloud Hosting Implementation Status

**Last Updated:** December 11, 2025

---

## Current Status: Phase 1 MVP Complete ✅

The app now supports:
- **Email/Password Authentication** via Firebase Auth
- **Cloud Save/Load** of story beats, acts, and shots to Firestore
- **Local fallback** still works (Export/Load buttons for .md/.json files)

---

## What's Working

### Authentication
- [x] Sign In / Sign Up modal with email + password
- [x] Sign Out button (replaces Sign In when logged in)
- [x] Auth state persists across page refreshes
- [x] Cloud Save/Load buttons disabled until signed in

### Cloud Storage (Firestore)
- [x] Save acts, cards, and shots to Firestore
- [x] Load project data from Firestore
- [x] Data stored under `users/{userId}/projects/default`
- [x] Sanitization to handle Firestore data requirements

### Local Storage
- [x] Export to .md (story beats) and .json (storyboard) still works
- [x] Load from local files still works
- [x] localStorage session restore on page load

---

## Known Limitations

### Images Not Synced to Cloud
- **Issue:** Dropped images are stored as base64 data URLs locally, but these are too large for Firestore (1MB doc limit)
- **Current behavior:** Images show "Local path - not synced to cloud" after Cloud Load
- **Solution:** Phase 3 - Firebase Storage integration

### Single Project Only
- Currently saves to a single "default" project per user
- **Solution:** Phase 2 - Multi-project support with project selector

---

## Next Steps

### Phase 2: Multi-Project Support
- [ ] Project list/dashboard modal
- [ ] Create new project
- [ ] Rename/delete projects
- [ ] Last modified timestamps

### Phase 3: Image Uploads
- [ ] Enable Firebase Storage
- [ ] Upload images on drop
- [ ] Store Firebase Storage URLs instead of base64
- [ ] Image thumbnails for faster loading

### Phase 4: Collaboration (Optional)
- [ ] Share project via link
- [ ] View-only vs edit permissions
- [ ] Real-time sync

### Deployment
- [ ] Deploy to Netlify
- [ ] Add authorized domain to Firebase Auth
- [ ] Set up Firestore security rules for production

---

## Firebase Configuration

**Project:** story-cards-a3cf6

**Services Enabled:**
- Authentication (Email/Password)
- Firestore Database

**Services Not Yet Enabled:**
- Firebase Storage (needed for Phase 3)

### API Key Security Note

The Firebase API key in `story-cards.html` is **designed to be public** for client-side web apps. GitHub may flag it as a "leaked secret" but this is expected behavior.

**To secure your Firebase project:**

1. **Restrict the API key** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Application restrictions → HTTP referrers → add `localhost:*`, `*.netlify.app`
   - API restrictions → Restrict to Firebase APIs only

2. **Add Firestore Security Rules** in Firebase Console → Firestore → Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/projects/{projectId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

3. **Close the GitHub alert** as "Won't fix" or "Revoked" (after adding restrictions)

---

## Files Changed

- `story-cards.html` - Added Firebase SDK, auth UI, cloud save/load functions
- `CLOUD_HOSTING_PROPOSAL.md` - Original planning document
- `CLOUD_STATUS.md` - This status document
- `.gitignore` - Added to exclude node_modules

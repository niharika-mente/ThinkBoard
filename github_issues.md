# ThinkBoard Identified GitHub Issues

Below are 5 high-priority bugs, architectural flaws, and UX issues identified in the ThinkBoard codebase.

---

## 1. 📁 Missing Backend Routes and Controllers for Note Reordering and Stack Grouping

* **Title**: `[BUG/API-MISMATCH] Missing backend routes and controllers for note reordering and stack grouping`
* **Type**: Bug / API Mismatch
* **Description**:
  The React frontend in `HomePage.jsx` contains full drag-and-drop code to move notes (`handleMoveNote` / `handleReorderNotes`) and combine notes into stack groups (`handleCombineNotes` / `handleCreateGroup`). These methods perform API requests to:
  * `PATCH /api/notes/:id/reorder`
  * `POST /api/notes/group`
  
  However, the Express backend defines no routes or controllers matching these paths, resulting in permanent `404 Not Found` responses when dragging cards.
* **Suggested Fix**:
  Implement controllers for `reorder` and `group` in `backend/src/controllers/notesController.js` and mount them in `backend/src/routes/notesRoutes.js`.
* **GitHub Link**: 
  👉 [Create Issue on GitHub](https://github.com/niharika-mente/ThinkBoard/issues/new?title=%5BBUG%2FAPI-MISMATCH%5D%20Missing%20backend%20routes%20and%20controllers%20for%20note%20reordering%20and%20stack%20grouping&body=%23%23%20Description%0AThe%20React%20frontend%20in%20%60HomePage.jsx%60%20contains%20full%20drag-and-drop%20code%20to%20move%20notes%20%28%60handleMoveNote%60%20%2F%20%60handleReorderNotes%60%29%20and%20combine%20notes%20into%20stack%20groups%20%28%60handleCombineNotes%60%20%2F%20%60handleCreateGroup%60%29.%20These%20methods%20perform%20API%20requests%20to%3A%0A-%20%60PATCH%20%2Fapi%2Fnotes%2F%3Aid%2Freorder%60%0A-%20%60POST%20%2Fapi%2Fnotes%2Fgroup%60%0A%0AHowever%2C%20the%20Express%20backend%20defines%20no%20routes%20or%20controllers%20matching%20these%20paths%2C%20resulting%20in%20permanent%20%60404%20Not%20Found%60%20responses%20when%20dragging%20cards.)

---

## 2. 🧹 Deleting a Parent Note Leaves Child Notes Orphaned in Database

* **Title**: `[BUG/DATA-INTEGRITY] Deleting a parent note leaves child notes orphaned in the database`
* **Type**: Bug / Data Integrity
* **Description**:
  In `backend/src/controllers/notesController.js`, `deleteNote` only deletes the target note using `Note.findOneAndDelete({ _id: id, userId: req.user._id })`.
  Since sub-notes store a reference to their parent note container via `parentId`, deleting a parent note leaves its child notes orphaned in MongoDB. These children cannot be rendered because their parent node is missing, causing database bloat.
* **Suggested Fix**:
  Modify `deleteNote` to fetch the note first and recursively delete all nested child notes whose `parentId` matches the deleted note's ID, or set up a Mongoose pre-hook.
* **GitHub Link**: 
  👉 [Create Issue on GitHub](https://github.com/niharika-mente/ThinkBoard/issues/new?title=%5BUG%2FDATA-INTEGRITY%5D%20Deleting%20a%20parent%20note%20leaves%20child%20notes%20orphaned%20in%20the%20database&body=%23%23%20Description%0AIn%20%60backend%2Fsrc%2Fcontrollers%2FnotesController.js%60%2C%20%60deleteNote%60%20only%20deletes%20the%20target%20note%20using%20%60Note.findOneAndDelete%60.%0ASince%20sub-notes%20store%20a%20reference%20to%20their%20parent%20note%20container%20via%20%60parentId%60%2C%20deleting%20a%20parent%20note%20leaves%20its%20child%20notes%20orphaned%20in%20MongoDB.%20These%20children%20cannot%20be%20rendered%20because%20their%20parent%20node%20is%20missing%2C%20causing%20database%20bloat.)

---

## 3. ✍️ Inability to Save Empty Content or Clear Note Text

* **Title**: `[BUG/UX] Users are unable to save empty content or clear notes`
* **Type**: Bug / UX
* **Description**:
  Both the frontend (`CreatePage.jsx` and `NoteDetailPage.jsx`) and backend controllers enforce validation that both `title` and `content` must be present and non-empty.
  This prevents users from creating a note containing only a title (with blank content), or editing a note to wipe out its text content, showing "All fields are required" validation errors.
* **Suggested Fix**:
  Allow `content` to be empty. Validate only that the `title` is non-empty.
* **GitHub Link**: 
  👉 [Create Issue on GitHub](https://github.com/niharika-mente/ThinkBoard/issues/new?title=%5BUG%2FUX%5D%20Users%20are%20unable%20to%20save%20empty%20content%20or%20clear%20notes&body=%23%23%20Description%0ABoth%20the%20frontend%20%28%60CreatePage.jsx%60%20and%20%60NoteDetailPage.jsx%60%29%20and%20backend%20controllers%20enforce%20validation%20that%20both%20%60title%60%20and%20%60content%60%20must%20be%20present%20and%20non-empty.%0AThis%20prevents%20users%20from%20creating%20a%20note%20containing%20only%20a%20title%20%28with%20blank%20content%29%2C%20or%20editing%20a%20note%20to%20wipe%20out%20its%20text%20content%2C%20showing%20%22All%20fields%20are%20required%22%20validation%20errors.)

---

## 4. 🚦 Middleware Ordering Bug Disables User-Specific Rate Limiting

* **Title**: `[BUG/ARCHITECTURE] Middleware ordering bug disables user-specific rate limiting`
* **Type**: Bug / Architecture
* **Description**:
  In `backend/src/server.js`, the middleware registration order is:
  ```javascript
  app.use("/api", rateLimiter);
  app.use("/api", optionalAuthenticateUser);
  ```
  Since Express executes middlewares sequentially, the rate limiter runs *before* user authentication runs. Because `req.user` is not yet populated by the auth parser, `req.user?._id` inside `rateLimiter.js` is always `undefined`, causing the rate limiter to fall back to IP-based limits for all clients.
* **Suggested Fix**:
  Reverse the registration order so that `optionalAuthenticateUser` executes first:
  ```javascript
  app.use("/api", optionalAuthenticateUser);
  app.use("/api", rateLimiter);
  ```
* **GitHub Link**: 
  👉 [Create Issue on GitHub](https://github.com/niharika-mente/ThinkBoard/issues/new?title=%5BUG%2FARCHITECTURE%5D%20Middleware%20ordering%20bug%20disables%20user-specific%20rate%20limiting&body=%23%23%20Description%0AIn%20%60backend%2Fsrc%2Fserver.js%60%2C%20the%20middleware%20registration%20order%20is%3A%0A%60%60%60javascript%0Aapp.use%28%22%2Fiapi%22%2C%20rateLimiter%29%3B%0Aapp.use%28%22%2Fiapi%22%2C%20optionalAuthenticateUser%29%3B%0A%60%60%60%0ASince%20Express%20executes%20middlewares%20sequentially%2C%20the%20rate%20limiter%20runs%20%2Abefore%2A%20user%20authentication%20runs.%20Because%20%60req.user%60%20is%20not%20yet%20populated%2C%20%60req.user%3F._id%60%20is%20always%20%60undefined%60%2C%20causing%20the%20rate%20limiter%20to%20fall%20back%20to%20IP-based%20limits.)

---

## 5. 🔑 Inconsistent JWT Token Extraction in Optional Authentication Middleware

* **Title**: `[BUG/SECURITY] Inconsistent JWT token extraction in optional authentication middleware`
* **Type**: Bug / Security
* **Description**:
  The main `authenticateUser` middleware extracts JWT tokens from both cookies and the `Authorization` header. However, the `optionalAuthenticateUser` middleware defined inside `backend/src/server.js` only checks cookies (`req.cookies?.token`).
  This means clients authenticating using standard `Authorization: Bearer <token>` headers are not recognized as authenticated during the optional auth phase, resulting in them being subject to global/IP rate limits rather than user-specific rate limits.
* **Suggested Fix**:
  Update `optionalAuthenticateUser` to check both cookies and `req.headers.authorization`.
* **GitHub Link**: 
  👉 [Create Issue on GitHub](https://github.com/niharika-mente/ThinkBoard/issues/new?title=%5BUG%2FSECURITY%5D%20Inconsistent%20JWT%20token%20extraction%20in%20optional%20authentication%20middleware&body=%23%23%20Description%0AThe%20main%20%60authenticateUser%60%20middleware%20extracts%20JWT%20tokens%20from%20both%20cookies%20and%20the%20%60Authorization%60%20header.%20However%2C%20the%20%60optionalAuthenticateUser%60%20middleware%20defined%20inside%20%60backend%2Fsrc%2Fserver.js%60%20only%20checks%20cookies%20%28%60req.cookies%3F.token%60%29.%0AThis%20means%20clients%20authenticating%20using%20headers%20are%20not%20recognized%20during%20optional%20auth%2C%20subjecting%20them%20to%20global%2FIP%20limits.)

# Candidate Bug Report

**Candidate Name:** Paarthibah
**Date:** July 1, 2026
**Position:** Software Engineer (Assessment Completion)

---

## Completed Bug Report (19 Bugs Identified and Fixed)

Here is the complete report of all identified bugs across the frontend, API, and database layers, with their symptoms, root causes, and fixes.

---

### Bug #1: `Movie.findById` Queried by Wrong Column

- **Feature/Page Affected:** View Movie & Edit Movie Pages
- **Symptom (Plain English):** Opening any movie to view its details or edit it resulted in a blank page or a "Movie not found" error, despite the movie existing in the database.
- **Fix Summary (Plain English):** Corrected the database query to look for the movie by its own `id` instead of searching by `producer_id`.
- **Code/Technical Details:** In `src/models/Movie.js` inside `findById(id)`, changed `.where({ producer_id: id })` to `.where({ id: id })`.

---

### Bug #2: Incorrect Pagination Offset Calculation

- **Feature/Page Affected:** Movie List & Pagination
- **Symptom (Plain English):** When paginating through the list of movies, the first page was skipped, and selecting any page offset always loaded the data meant for the subsequent page (e.g., page 1 loaded page 2's data).
- **Fix Summary (Plain English):** Adjusted the offset math so that the first page starts at offset 0 instead of skipping the first page's worth of movies.
- **Code/Technical Details:** In `src/controllers/movieController.js` inside `getAllMovies`, changed `const offset = page * limit` to `const offset = (page - 1) * limit`.

---

### Bug #3: Soft-Deleted Movies Displayed in List

- **Feature/Page Affected:** Movie List Page
- **Symptom (Plain English):** Deleting a movie from the admin interface removed it momentarily, but refreshing the page brought it back.
- **Fix Summary (Plain English):** Added a database filter to exclude movies that have a deletion timestamp from the listing results.
- **Code/Technical Details:** In `src/models/Movie.js` inside `find()`, changed the knex query to chain `.whereNull("deleted_at")`.

---

### Bug #4: Uncommitted Database Transaction in Movie Creation

- **Feature/Page Affected:** Add Movie Page / Backend Database
- **Symptom (Plain English):** Creating a new movie appeared to succeed but could lock database resources or occasionally fail to persist relation links because the transaction was left hanging.
- **Fix Summary (Plain English):** Wrapped database inserts in structured transaction blocks that explicitly commit on success and roll back on error.
- **Code/Technical Details:** In `src/models/Movie.js` inside `create(data)`, wrapped inserting inside a try-catch block executing `await trx.commit()` and `await trx.rollback()`.

---

### Bug #5: Movie Plot Could Not Be Edited

- **Feature/Page Affected:** Edit Movie Page
- **Symptom (Plain English):** Updating a movie's description (plot summary) and saving did not save the changes. The old description remained.
- **Fix Summary (Plain English):** Enabled updating the `plot` column by uncommenting the line of code that copies the plot input to the database update package.
- **Code/Technical Details:** In `src/controllers/movieController.js` inside `updateMovie`, uncommented `if (plot !== undefined) dataToUpdate.plot = plot;`.

---

### Bug #6: Wrong Poster Directory Path on Edit

- **Feature/Page Affected:** Edit Movie / Upload Image
- **Symptom (Plain English):** Updating a movie's poster image successfully saved the file, but rendered a broken image placeholder on the frontend.
- **Fix Summary (Plain English):** Aligned the URL construction so that it builds the resource path using `/uploads/images/` instead of the non-existent `/uploads/posters/` folder.
- **Code/Technical Details:** In `src/controllers/movieController.js` inside `updateMovie`, changed `/uploads/posters/` to `/uploads/images/`.

---

### Bug #7: Missing Auth Middleware for Deleting Producers

- **Feature/Page Affected:** Producers Admin Panel / API
- **Symptom (Plain English):** Anyone (even logged-out guests) could send delete requests to the backend API and delete movie producers from the database.
- **Fix Summary (Plain English):** Protected the producer deletion route with the standard authentication check middleware.
- **Code/Technical Details:** In `src/routes/producerRoutes.js`, added the `protect` middleware to `router.delete("/:id", protect, producerController.deleteProducer)`.

---

### Bug #8: Incorrect JWT Expiry Timezone Math

- **Feature/Page Affected:** User Authentication / Session Expiration
- **Symptom (Plain English):** Users residing in timezones with a positive UTC offset (e.g., GMT+5:30) were logged out immediately or got "session expired" errors immediately after successfully logging in.
- **Fix Summary (Plain English):** Removed a redundant manual token expiry check that applied timezone offsets incorrectly, and relied on the library's built-in token validation mechanism which handles expiration correctly.
- **Code/Technical Details:** In `src/middleware/authMiddleware.js`, removed the custom date offset calculation block and let `jwt.verify` manage expiry checks natively.

---

### Bug #9: Typos in Producer Search Service Payload

- **Feature/Page Affected:** Producer Listing & Search Page
- **Symptom (Plain English):** Searching/filtering producers by name yielded no results or ignored the search term.
- **Fix Summary (Plain English):** Fixed a spelling typo in the frontend request builder (`naame` instead of `name`) and removed unnecessary deletion logic that was erasing the search term.
- **Code/Technical Details:** In `client/src/services/Index.js` inside `GetProducers`, simplified the payload conversion to pass search criteria directly.

---

### Bug #10: Spinner Stuck on Server Errors (500)

- **Feature/Page Affected:** Frontend API Fetch Utility
- **Symptom (Plain English):** If the server encountered an error (like a database glitch), the website would get stuck forever showing a loading spinner, forcing the user to manually refresh.
- **Fix Summary (Plain English):** Corrected the error-handling logic to stop the loading state (set spinner to false) even if the server returns a 500 error status.
- **Code/Technical Details:** In `client/src/common/common.js` inside `handleFetch` and `fetchMovies`, changed `setLoading(true)` on 500 status to `setLoading(false)`.

---

### Bug #11: Axios Interceptor Overwriting Request Headers

- **Feature/Page Affected:** Image Uploads & Form Submissions
- **Symptom (Plain English):** Submitting forms with uploaded image files failed or resulted in network errors because the server did not receive the upload boundaries.
- **Fix Summary (Plain English):** Modified the axios request interceptor to merge the authentication token with existing headers instead of wiping out default headers (like Content-Type).
- **Code/Technical Details:** In `client/src/services/httpServices.js`, changed `headers: { ... }` to `headers: { ...config.headers, Authorization: ... }`.

---

### Bug #12: Malformed Store List after Adding Movie

- **Feature/Page Affected:** Add Movie Page
- **Symptom (Plain English):** After successfully adding a new movie, the user was redirected back to the home page, but the new movie displayed as empty/broken cards or crashed the client until refreshed.
- **Fix Summary (Plain English):** Ensured only the clean movie object (`res.data`) is added to the Redux store list rather than the full wrapper response object (`res`).
- **Code/Technical Details:** In `client/src/pages/movie/AddMovie.jsx`, changed `[res, ...movies]` to `[res.data, ...movies]`.

---

### Bug #13: Redux Store Never Updated on Movie Update

- **Feature/Page Affected:** Edit Movie Page
- **Symptom (Plain English):** Editing a movie redirected the user back, but the UI list still showed the old outdated information.
- **Fix Summary (Plain English):** Uncommented the action dispatcher that informs the global app state to update the modified movie details.
- **Code/Technical Details:** In `client/src/pages/movie/EditMovie.jsx`, uncommented `updateMovies(list)`.

---

### Bug #14: Login Toast Call Had Incorrect Arguments

- **Feature/Page Affected:** User Login Page
- **Symptom (Plain English):** Logging in successfully did not show any confirmation notification (toast banner) to the user.
- **Fix Summary (Plain English):** Corrected the arguments passed to the toast function to use a single configuration object instead of individual values.
- **Code/Technical Details:** In `client/src/pages/auth/Login.jsx`, changed `showToast(message, type)` to `showToast({ message, type })`.

---

### Bug #15: Register Navigated to Login on Failure

- **Feature/Page Affected:** Register Page
- **Symptom (Plain English):** If registration failed (e.g. duplicate email), the screen briefly flashed an error but navigated the user away to the login screen anyway, preventing them from fixing mistakes.
- **Fix Summary (Plain English):** Added a condition to only navigate to the login page when the registration response returns a success status.
- **Code/Technical Details:** In `client/src/pages/auth/Register.jsx`, wrapped `navigate("/login")` inside a check for `res.status === "success"`.

---

### Bug #16: AddActor Navigated to Actors List on Failure

- **Feature/Page Affected:** Add Actor Page
- **Symptom (Plain English):** Attempting to save a new actor with invalid fields triggered an error notification, but immediately threw the user back to the list page before they could fix the input.
- **Fix Summary (Plain English):** Removed navigation from the `finally` block of the request handler so it only redirects on success.
- **Code/Technical Details:** In `client/src/pages/actor/AddActor.jsx`, removed `navigate("/actors")` from `finally`.

---

### Bug #17: Inefficient Search Handler Re-fetching and Delaying UI

- **Feature/Page Affected:** Movie Search Page
- **Symptom (Plain English):** Searching for movies was laggy (with a noticeable random delay) and occasionally refreshed the list with outdated data.
- **Fix Summary (Plain English):** Removed an artificial random timeout and redundant server fetch, updating the filter instantly for fast client-side searching.
- **Code/Technical Details:** In `client/src/pages/movie/Movie.jsx`, replaced the async database reload in `handleSearch` with synchronous client-side filter updating.

---

### Bug #18: TokenRefreshedModal Crashed App

- **Feature/Page Affected:** Token Expiry / Session Flow
- **Symptom (Plain English):** Whenever a session expired, the application completely crashed with a scripting error rather than logging the user out.
- **Fix Summary (Plain English):** Mapped `TokenRefreshedModal` to the active `LogoutModal` function and fixed an undefined helper reference to ensure clean redirects.
- **Code/Technical Details:** In `client/src/common/common.js`, set `TokenRefreshedModal` to return `LogoutModal` and resolved the missing `handleTokenExpired` reference.

---

### Bug #19: ReferenceError in AddProducer.jsx Catch Block

- **Feature/Page Affected:** Add Producer Page
- **Symptom (Plain English):** When failing to add a producer, the fields did not highlight validation errors and the app console logged a scripting error.
- **Fix Summary (Plain English):** Corrected a typo in the catch block variable (`error` vs `err`) to allow proper validation error parsing.
- **Code/Technical Details:** In `client/src/pages/producer/AddProducer.jsx`, changed `error.response` to `err.response`.

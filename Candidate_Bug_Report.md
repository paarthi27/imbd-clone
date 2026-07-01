# Candidate Bug Report

**Candidate Name:** Paarthibah
**Date:** July 1, 2026
**Position:** Software Engineer (Assessment Completion)

---

## Completed Bug Report (20 Bugs Identified and Fixed)

Here is the complete report of all identified bugs across the frontend, API, and database layers, with their symptoms, root causes, and fixes.

---

Bug Report
BUG‑01
Symptom:
The front‑end attempted to call the API at http://localhast:3000/... and the browser console showed a “Network error / DNS not found” message. No data was displayed and the UI stayed empty.
Root Cause:
The base URL string contained a typo – localhast instead of localhost – and the client had no .env file to override the default. Because the wrong host was used, every request failed.
Fix Description:
Created a client/.env file and set the correct variables:
env
VITE_APP_API_URL=http://localhost:4000/api
VITE_APP_ASSET_URL=http://localhost:4000
Updated the typo in any hard‑coded reference to localhast to localhost. Vite automatically reads this file, so the API calls now reach the back‑end correctly.

BUG‑02
Symptom:
Even after adding the .env file, the front‑end still could not reach the back‑end because the environment variables were missing entirely; the API base URL was undefined, leading to failed requests.
Root Cause:
The client project did not contain a .env file at all, so Vite fell back to empty values and the base URL remained unset.
Fix Description:
Added a new client/.env file (as shown in BUG‑01) containing the required variables. This ensured the Vite dev server loads the correct API endpoint and asset URL at start‑up.

BUG‑03
Symptom:
Editing a movie never loaded the existing data – the “Edit” page showed a blank form and saved changes failed because the movie could not be found.
Root Cause:
Movie.findById queried the database using the column producer_id instead of the primary key id, so a lookup by a movie’s own ID always returned nothing.
Fix Description:
Updated the query in src/models/Movie.js to use where({ id }) instead of where({ producer_id: id }). After this change the correct movie record is returned and the edit UI works.

BUG‑04
Symptom:
Pagination on the movies list displayed the wrong page of results; clicking “next” showed duplicate or missing items.
Root Cause:
The controller read pagination parameters from req.body (which is empty for a POST /get-all request) and calculated the offset as page * limit instead of (page‑1) * limit.
Fix Description:
Modified src/controllers/movieController.js to read { name, page = 1, limit = 10 } from req.body, and fixed the offset calculation to (page - 1) * limit. This yields the correct slice of movies for each page.

BUG‑05
Symptom:
Soft‑deleted movies still appeared in the movies list after being marked as deleted.
Root Cause:
The find() method did not filter out rows where deleted_at is not NULL; it returned every row in the movies table.
Fix Description:
Added whereNull('deleted_at') to the query in src/models/Movie.js. Now only movies that have not been soft‑deleted are returned.

BUG‑06
Symptom:
Adding a new movie did not persist to the database; after submitting the form the movie disappeared from the list.
Root Cause:
The create() function started a transaction (trx = await db.transaction()) but never called trx.commit(), so the insert was never finalized.
Fix Description:
Inserted await trx.commit() after the successful insert operation in src/models/Movie.js. The transaction now commits and the new movie is saved.

BUG‑07
Symptom:
When editing a movie, the “plot” field was never saved; the backend ignored any changes to the plot description.
Root Cause:
The plot property was commented out in the update payload inside movieController.updateMovie.
Fix Description:
Uncommented the plot field in the payload and ensured it is passed to the database update. The edited plot now persists.

BUG‑08
Symptom:
Poster images uploaded when creating a movie were saved to a non‑existent folder, causing a “file not found” error and no image displayed.
Root Cause:
The upload path constant pointed to /uploads/posters while the server only serves the /uploads directory.
Fix Description:
Updated the upload path in src/controllers/movieController.js to uploads/ (the served static folder). Poster files are now stored correctly and displayed.

BUG‑09
Symptom:
Any user could delete a producer by sending a request to /api/producers/:id – the operation succeeded without authentication.
Root Cause:
The route definition for DELETE /:id lacked the protect middleware that checks the JWT token.
Fix Description:
Added protect as the second argument in src/routes/producerRoutes.js:
js
router.delete('/:id', protect, producerController.deleteProducer);
Now only authenticated users can delete producers.

BUG‑10
Symptom:
Users with positive UTC offsets received “Token expired” errors even though the token was still valid.
Root Cause:
A manual expiry check added the local timezone offset (new Date().getTimezoneOffset() * 60000) to the decoded expiration timestamp, causing premature expiry.
Fix Description:
Removed the manual check entirely and relied on jwt.verify(token, secret), which correctly handles expiration based on the token’s exp claim.

BUG‑11
Symptom:
Searching for producers never filtered by name; the request always returned all producers.
Root Cause:
In client/src/services/Index.js the helper GetProducers built a payload with a typo: naame: data.name and then deleted name, so the name filter never reached the server.
Fix Description:
Simplified the function to:
js
export const GetProducers = async (data) => {
 return await requests.post(`producers/get-all`, data);
};
The correct name field is now sent and the search works.

BUG‑12
Symptom:
When fetching actors, the Redux action creator threw a runtime error because it received the whole actions object instead of the specific setActors function.
Root Cause:
fetchActors called handleFetch(actorActions, ...); inside handleFetch the code attempted to invoke actorActions(list), which is not a function.
Fix Description:
Updated fetchActors to pass the concrete action creator setActors:
js
handleFetch(setActors, ...);
The actors are now stored correctly in the Redux store.

BUG‑13
Symptom:
On any API error the UI spinner never stopped, leaving the page permanently in a loading state.
Root Cause:
In client/src/common/common.js the error block called setLoading(true) instead of turning it off.
Fix Description:
Changed the line to if (setLoading) setLoading(false); so the spinner disappears when an error occurs.

BUG‑14
Symptom:
After successfully adding a movie, the Redux movie list received the entire Axios response object (res) instead of just the newly created movie data (res.data). This produced a malformed entry and broke UI rendering.
Root Cause:
The code in AddMovie.jsx pushed res onto the list instead of res.data.
Fix Description:
Modified the success block to:
js
const list = [res.data, ...movies];
updateMovies(list);
The list now contains only proper movie objects.

BUG‑15
Symptom:
Editing a movie never reflected the changes in the UI; the page had to be refreshed manually to see the updated data.
Root Cause:
The line updateMovies(list); was commented out in EditMovie.jsx, so the Redux store never received the new data.
Fix Description:
Uncommented the line, allowing the store to be updated and the UI to re‑render automatically.

BUG‑16
Symptom:
After a successful login, no toast notification appears, leaving the user unsure whether the login succeeded.
Root Cause:
showToast was invoked as showToast(message, type) while the function expects a single object { message, type }.
Fix Description:
Updated the call to:
js
showToast({ message: res?.message || "Login successful", type: res.status });
The toast now displays correctly.

BUG‑17
Symptom:
The Register page always redirects to the login screen even when registration fails, so the user sees the login form without any error message.
Root Cause:
navigate('/login') was executed immediately after the API call, regardless of the response status.
Fix Description:
Wrapped the navigation inside a success check:
js
if (res.status === "success") {
 showToast({ message: res?.message, type: res.status });
 navigate("/login");
}
Navigation now only occurs on successful registration.

BUG‑18
Symptom:
Every request sent from the client lost the Content-Type: application/json header (or the multipart/form-data header for file uploads), causing 400 errors from the server.
Root Cause:
The Axios request interceptor replaced the entire headers object with only Authorization and a CORS header, discarding any existing headers.
Fix Description:
Re‑wrote the interceptor to merge the existing headers:
js
instance.interceptors.request.use((config) => {
 const token = localStorage.getItem("accessToken");
 return {
   ...config,
   headers: {
     ...config.headers,
     Authorization: token ? `Bearer ${token}` : undefined,
   },
 };
});
All original headers are now preserved.

BUG‑19
Symptom:
Submitting the “Add Actor” form always redirected to the actors list, even when the API call failed, so the user never saw the error.
Root Cause:
The navigation to /actors was placed inside a finally block, which runs regardless of success or failure.
Fix Description:
Removed the unconditional navigate('/actors') from the finally block and kept navigation only on successful creation.

BUG‑20
Symptom:
While typing in the movie search bar, the UI introduced a random 500‑1500 ms delay and performed an extra full API request on every keystroke, making the search feel sluggish.
Root Cause:
handleSearch used setTimeout with a random delay and called fetchMovies twice.
Fix Description:
Deleted the artificial timeout and the duplicate call, leaving a single debounced (but fast) request that updates the filter state.


### Bug #19: ReferenceError in AddProducer.jsx Catch Block

- **Feature/Page Affected:** Add Producer Page
- **Symptom (Plain English):** When failing to add a producer, the fields did not highlight validation errors and the app console logged a scripting error.
- **Fix Summary (Plain English):** Corrected a typo in the catch block variable (`error` vs `err`) to allow proper validation error parsing.
- **Code/Technical Details:** In `client/src/pages/producer/AddProducer.jsx`, changed `error.response` to `err.response`.

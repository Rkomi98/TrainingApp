import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProgressTable from './ProgressTable';
import ProgressChart from './ProgressChart';
import Timer from './Timer';
// Import an icon for the sync button
import { FiRefreshCw } from 'react-icons/fi';

// --- Configuration ---
// Use environment variables, fallback to your LAN IP for development across devices
// MAKE SURE your Node.js server is accessible at this IP and port from other devices
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.107:5000/api';
// Timeout for initially showing cache if server fetch is slow (e.g., 3-5 seconds)
const FETCH_TIMEOUT_MS = 4000;

// --- Helper Function to Transform OLD Cache Format ---
// Converts OLD format: { date: "...", scores: { "1": { score1: ..., score2: ... }, ... } }
// Converts to NEW format: { date: "...", exercises: [{ id: 1, score1: ..., score2: ... }, ...] }
const transformOldCacheEntry = (oldEntry) => {
    // Basic validation of the old entry structure
    if (!oldEntry || !oldEntry.date || typeof oldEntry.scores !== 'object' || oldEntry.scores === null) {
        console.warn("Skipping invalid/malformed old cache entry structure:", oldEntry);
        return null;
    }
    try {
        // Convert the scores object into an array of exercises
        const newExercisesArray = Object.entries(oldEntry.scores).map(([idStr, scoreObj]) => {
            // Validate the inner score object part
            if (typeof scoreObj !== 'object' || scoreObj === null || typeof scoreObj.score1 === 'undefined' || typeof scoreObj.score2 === 'undefined') {
                console.warn(`Skipping invalid score structure within old cache entry for ID ${idStr}:`, scoreObj);
                return null; // Skip this specific exercise if its score part is invalid
            }
            // Ensure the ID is a valid number
            const id = parseInt(idStr, 10);
            if (isNaN(id)) {
                console.warn(`Skipping score with non-numeric ID key in old cache entry: ${idStr}`);
                return null;
            }

            // Create the exercise object in the new format
            return {
                id: id,
                score1: typeof scoreObj.score1 === 'number' ? scoreObj.score1 : null,
                score2: typeof scoreObj.score2 === 'number' ? scoreObj.score2 : null
                // We don't have 'name' in the old cache format typically
            };
        }).filter(ex => ex !== null); // Filter out any skipped/invalid exercise scores

        // Only return a valid entry if it has a date and at least one valid exercise score was extracted
        if (newExercisesArray.length > 0) {
            return {
                date: oldEntry.date, // Keep the original date string (ISO format expected)
                exercises: newExercisesArray // Use the correct key 'exercises'
            };
        } else {
            // Entry had a date and scores object, but no valid scores were extracted
            console.warn("Old cache entry resulted in no valid exercises after transformation:", oldEntry);
            return null;
        }
    } catch (error) {
        console.error("Error transforming old cache entry:", oldEntry, error);
        return null; // Return null if any error occurs during transformation
    }
};


function Exercises({ userName }) {
    // --- State Variables ---
    const [scores, setScores] = useState({}); // Form input state
    const [exerciseHistory, setExerciseHistory] = useState([]); // Displayed history (merged server + unsynced cache)
    const [exercises, setExercises] = useState([]); // Available exercises list
    const [isLoading, setIsLoading] = useState(true); // Initial data load state
    const [error, setError] = useState(null); // General fetch/submit error
    const [isSubmitting, setIsSubmitting] = useState(false); // Form submission state
    // Sync specific state
    const [isSyncing, setIsSyncing] = useState(false); // Sync button state
    const [syncError, setSyncError] = useState(null); // Sync specific error
    const [unsyncedEntries, setUnsyncedEntries] = useState([]); // Old cache entries not found on server

    // --- Refs ---
    const timeoutIdRef = useRef(null);
    const fetchCompletedRef = useRef(false); // Track if server fetch finished (for timeout logic)

    // --- Fetch Data Logic (Exercises List and History) ---
    const fetchData = useCallback(async (isInitialLoad = true) => {
        // Reset states on initial load or user change
        if (isInitialLoad) {
            setIsLoading(true);
            setUnsyncedEntries([]);
            setSyncError(null);
            setError(null); // Clear general errors too
            fetchCompletedRef.current = false;
            if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        } else {
            // For refresh calls (e.g., after sync), don't show main loading indicator
            setError(null);
            setSyncError(null);
        }

        let serverHistoryData = []; // Data from GET /api/history (NEW format)
        let transformedOldCacheData = []; // Old cache data converted to NEW format

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found.');

            // 1. Fetch Exercises List (Always required)
            console.log("Fetching exercises list...");
            const exercisesResponse = await fetch(`${API_BASE_URL}/exercises`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            });
            if (!exercisesResponse.ok) throw new Error(`Failed to fetch exercises (${exercisesResponse.status})`);
            const exercisesData = await exercisesResponse.json();
            if (!Array.isArray(exercisesData)) throw new Error("Invalid format for exercises list.");
            setExercises(exercisesData);
            console.log("Exercises fetched successfully.");

            // 2. Read and Transform OLD Cache Data (for comparison and potential sync)
            try {
                const oldCacheRaw = localStorage.getItem(`${userName}-history`); // Read OLD key
                if (oldCacheRaw) {
                    const oldCacheParsed = JSON.parse(oldCacheRaw);
                    if (Array.isArray(oldCacheParsed)) {
                        transformedOldCacheData = oldCacheParsed
                            .map(transformOldCacheEntry) // Convert format
                            .filter(entry => entry !== null); // Remove invalid entries
                        console.log(`Read and transformed ${transformedOldCacheData.length} valid entries from OLD cache.`);
                    }
                } else { console.log("No data found in OLD cache key."); }
            } catch (parseError) { console.error("Error parsing OLD cache data:", parseError); }

            // 3. Fetch History from Server (NEW endpoint) with Timeout Visual Aid
            fetchCompletedRef.current = false; // Reset fetch status for this specific fetch
            const fetchServerHistoryPromise = fetch(`${API_BASE_URL}/history/${userName}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            }).then(async (response) => {
                fetchCompletedRef.current = true; // Mark as completed
                if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

                if (response.status === 404) return []; // No history is okay
                if (!response.ok) throw new Error(`Failed to fetch server history (${response.status})`);

                const data = await response.json();
                console.log("History fetched successfully from server.");
                if (!Array.isArray(data) || !data.every(item => item && item.date && Array.isArray(item.scores))) { // Validate format
                    console.warn("Server history data has unexpected structure:", data);
                    throw new Error("Invalid history format received from server.");
                }
                 // Ensure correct key 'exercises' for consistency, map if needed
                 return data.map(session => ({
                    ...session,
                    exercises: session.scores // Assuming server returns 'scores', map to 'exercises'
                 }));
            });

            // Setup timeout only for initial visual cue (doesn't stop the fetch)
            if (isInitialLoad) {
                 timeoutIdRef.current = setTimeout(() => {
                    if (!fetchCompletedRef.current) {
                        console.log(`Fetch timeout (${FETCH_TIMEOUT_MS}ms) expired. Will proceed when fetch completes.`);
                        // We don't set state here anymore, just log. Display relies on final merge.
                    }
                 }, FETCH_TIMEOUT_MS);
            }

            // Wait for the server fetch to complete
            serverHistoryData = await fetchServerHistoryPromise;

            // 4. Compare Server Data with Transformed Cache, Identify Unsynced
            console.log("Comparing server history with transformed old cache...");
            const serverDates = new Set(serverHistoryData.map(entry => entry.date)); // Use date string as unique key
            const localOnlyEntries = transformedOldCacheData.filter(cacheEntry => !serverDates.has(cacheEntry.date));
            console.log(`Found ${localOnlyEntries.length} entries potentially missing from server.`);
            setUnsyncedEntries(localOnlyEntries);

            // 5. Merge Server Data + Unsynced Cache Data for Display
            const displayHistoryMap = new Map();
            // Add server entries first (higher priority)
            serverHistoryData.forEach(entry => displayHistoryMap.set(entry.date, entry));
            // Add unsynced cache entries only if date doesn't exist
            localOnlyEntries.forEach(entry => {
                if (!displayHistoryMap.has(entry.date)) {
                    displayHistoryMap.set(entry.date, entry);
                }
            });
            const finalDisplayHistory = Array.from(displayHistoryMap.values());
            finalDisplayHistory.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort descending

            setExerciseHistory(finalDisplayHistory); // Update the state used for rendering

        } catch (err) {
            console.error('Error in fetchData:', err);
            setError(`Error loading data: ${err.message}`);
            setUnsyncedEntries([]); // Clear sync items on load error
            // Don't clear history on error, might want to show cache? Depends on desired UX.
        } finally {
            setIsLoading(false); // Stop loading indicator
            if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current); // Final cleanup
            console.log("fetchData sequence complete.");
        }
    }, [userName]); // useCallback dependency

    // --- Effects ---

    // Initial data fetch and refetch on user change
    useEffect(() => {
        if (userName) {
            fetchData(true); // Initial load
        } else {
            // Clear all state if user logs out / userName becomes null
            setIsLoading(false); setError(null); setExercises([]); setExerciseHistory([]);
            setScores({}); setUnsyncedEntries([]); setSyncError(null);
        }
        // Cleanup timeout on unmount
        return () => { if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current); };
    }, [userName, fetchData]); // Include fetchData due to useCallback

    // Load/Save unsaved form scores (separate from history cache)
    useEffect(() => {
        if (userName) {
            const unsubmitted = JSON.parse(localStorage.getItem(`${userName}-unsavedScores`)) || {};
            setScores(unsubmitted);
        } else { setScores({}); }
    }, [userName]);
    useEffect(() => {
        if (userName && Object.keys(scores).length > 0) {
            localStorage.setItem(`${userName}-unsavedScores`, JSON.stringify(scores));
        } else if (userName) {
            localStorage.removeItem(`${userName}-unsavedScores`);
        }
    }, [scores, userName]);

    // --- Event Handlers ---

    // Handle form input changes
    const handleScoreChange = (id, field, value) => {
        console.log(`handleScoreChange - ID: ${id}, Field: ${field}, Raw Value: "${value}"`);
        const finalValue = value === '' ? '' : parseFloat(value);
        console.log(`handleScoreChange - Parsed Value (finalValue):`, finalValue);

        // Prevent state update only if input is not empty AND not a valid number string
        if (value !== '' && isNaN(parseFloat(value))) {
            console.warn("Invalid number input detected, preventing state update:", value);
            return;
        }

        console.log(`handleScoreChange - Updating state for ${id}.${field} with:`, finalValue);
        setScores(prevScores => ({
            ...prevScores,
            [id]: { ...(prevScores[id] || {}), [field]: finalValue }
        }));
    };

    // Handle form submission (Creates NEW session)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isConfirmed = window.confirm("Submit these scores?");
        if (!isConfirmed) return;
        if (isSubmitting) return;

        setIsSubmitting(true); setError(null); setSyncError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No auth token');

            const scoresToSubmit = Object.entries(scores)
                .map(([idStr, scoreData]) => {
                    const id = Number(idStr);
                    const score1 = (scoreData && typeof scoreData.score1 === 'number') ? scoreData.score1 : null;
                    const score2 = (scoreData && typeof scoreData.score2 === 'number') ? scoreData.score2 : null;
                    if (!isNaN(id) && (score1 !== null || score2 !== null)) {
                        const exercise = exercises.find(ex => ex.id === id); // Find name for context
                        return { id, name: exercise?.name, score1, score2 };
                    }
                    return null;
                }).filter(score => score !== null);

            if (scoresToSubmit.length === 0) throw new Error("No valid scores entered.");

            // Payload for POST /api/history
            const payload = { scores: scoresToSubmit }; // Server sets the date
            console.log("Submitting NEW session:", JSON.stringify(payload));

            const response = await fetch(`${API_BASE_URL}/history/${userName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();
            console.log("Submit Response Status:", response.status);
            console.log("Submit Response Text:", responseText);

            if (!response.ok || response.status !== 201) {
                let errorMessage = `Failed to save session (${response.status})`;
                try { errorMessage += `: ${(JSON.parse(responseText)).message || responseText}`; }
                catch { errorMessage += `: ${responseText}`; }
                throw new Error(errorMessage);
            }

            // Success! Use the response (newly created session) for UI update
            const newSessionData = JSON.parse(responseText);
            // Map 'scores' to 'exercises' if needed for consistency with fetched data
             const displaySession = { ...newSessionData, exercises: newSessionData.scores };

            setExerciseHistory(prevHistory => {
                // Add new session and re-sort
                const updatedHistory = [displaySession, ...prevHistory];
                updatedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
                return updatedHistory;
            });

            setScores({}); // Clear form
            localStorage.removeItem(`${userName}-unsavedScores`);
            alert('Session submitted successfully!');

        } catch (error) {
            console.error('Detailed submission error:', error);
            setError(`Failed to submit scores: ${error.message}`);
            alert(`Failed to submit scores. Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Sync Button Click
    const handleSyncCache = async () => {
        if (isSyncing || unsyncedEntries.length === 0) return;

        const token = localStorage.getItem('token');
        if (!token) { setSyncError("Cannot sync: Auth token missing."); return; }

        setIsSyncing(true); setSyncError(null);
        let successes = 0, errors = 0;
        const totalToSync = unsyncedEntries.length;
        console.log(`Starting sync for ${totalToSync} entries...`);

        for (const entry of unsyncedEntries) {
            try {
                // Use the transformed structure and original date for payload
                const payload = { date: entry.date, scores: entry.exercises };
                console.log("Syncing entry for date:", entry.date);

                const response = await fetch(`${API_BASE_URL}/history/${userName}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload),
                });

                if (!response.ok || response.status !== 201) {
                    const responseText = await response.text();
                    console.error(`Failed sync for ${entry.date} (${response.status}): ${responseText}`);
                    errors++;
                    // Optional: break here if one error should stop the whole sync
                } else {
                    console.log(`Successfully synced entry for ${entry.date}`);
                    successes++;
                }
            } catch (error) {
                console.error(`Network/other error syncing ${entry.date}:`, error);
                errors++;
            }
        }

        console.log(`Sync finished. Success: ${successes}, Errors: ${errors}`);
        setIsSyncing(false);

        if (errors > 0) {
            setSyncError(`Sync completed with ${errors} error(s). ${successes} succeeded. Check console.`);
        } else if (successes > 0) {
            alert(`Successfully synced ${successes} historical entries!`);
            // Clear the old cache key ONLY on full success
            localStorage.removeItem(`${userName}-history`);
            console.log("Removed old cache key after successful sync.");
            setUnsyncedEntries([]); // Clear the list
        } else {
            // No errors, but also nothing succeeded (e.g., if list was somehow empty)
             console.log("Sync finished, but no entries were successfully synced.");
        }

        // Refresh data from server after sync attempt
        fetchData(false); // false = don't show main loading indicator
    };

    // --- Render Logic ---
    let mainContent = null;
    if (isLoading) {
        mainContent = <p>Loading initial data...</p>;
    } else if (error) {
        mainContent = null; // Error is displayed separately
    } else {
        mainContent = (
            <>
                {/* Input Form */}
                {exercises.length > 0 ? (
                     <form onSubmit={handleSubmit}>
                        <table>
                           <thead><tr><th>Exercise</th><th>Score 1</th><th>Score 2</th></tr></thead>
                            <tbody>
                                {exercises.map((exercise) => (
                                    <tr key={exercise.id || exercise._id}>
                                        <td>{exercise.name}</td>
                                        <td><input type="number" step="any" value={scores[exercise.id]?.score1 ?? ''} onChange={(e) => handleScoreChange(exercise.id, 'score1', e.target.value)} min="0" disabled={isSubmitting} /></td>
                                        <td><input type="number" step="any" value={scores[exercise.id]?.score2 ?? ''} onChange={(e) => handleScoreChange(exercise.id, 'score2', e.target.value)} min="0" disabled={isSubmitting} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button type="submit" disabled={isSubmitting || isLoading}>
                            {isSubmitting ? 'Submitting...' : 'Submit Scores'}
                        </button>
                    </form>
                ) : ( <p>No exercises defined for training yet.</p> )}

                {/* Progress Display */}
                <h3>Your Progress</h3>
                {exerciseHistory.length > 0 && exercises.length > 0 ? (
                    <>
                        <ProgressTable history={exerciseHistory} exercises={exercises} />
                        <ProgressChart history={exerciseHistory} exercises={exercises} />
                    </>
                ) : ( <p>No progress history found. Submit scores or sync cache.</p> )}
            </>
        );
    }

    return (
        <div>
            {userName ? <h2>Exercises for {userName}</h2> : <h2>Exercises</h2>}
            <Timer />

            {/* Sync Section */}
            <div style={{ margin: '15px 0', padding: '10px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <button
                    onClick={handleSyncCache}
                    disabled={isSyncing || unsyncedEntries.length === 0}
                    title={unsyncedEntries.length > 0 ? `Sync ${unsyncedEntries.length} unsaved entries from old local cache` : "No entries found in old cache to sync"}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: (isSyncing || unsyncedEntries.length === 0) ? 'not-allowed' : 'pointer', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: (isSyncing || unsyncedEntries.length === 0) ? '#eee' : 'white' }}
                >
                    <FiRefreshCw style={{ verticalAlign: 'middle' }} />
                    {isSyncing ? 'Syncing...' : `Sync Cache (${unsyncedEntries.length})`}
                </button>
                {syncError && <p style={{ color: 'red', marginTop: '5px', fontSize: '0.9em' }}>Sync Error: {syncError}</p>}
                {!isLoading && !isSyncing && !syncError && unsyncedEntries.length === 0 && <p style={{ color: 'green', marginTop: '5px', fontSize: '0.9em' }}>Old local cache is synced or empty.</p>}
            </div>

            {/* General Fetch Error Display */}
            {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', margin: '10px 0' }}>Error: {error}</p>}

            {/* Main Content Area */}
            {mainContent}
        </div>
    );
}

export default Exercises;
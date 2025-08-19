
interface InteractionData {
    timestamp: string;
    sessionId: string;
    type: 'question' | 'audio_overview' | 'resume_tailoring';
    source: 'modal_suggestion' | 'modal_custom' | 'header_audio' | 'tailor_resume_modal';
    prompt: string;
    response?: string | object;
}

// ===================================================================================
// ACTION REQUIRED: Paste your Google Sheet Web App URL here.
// ===================================================================================
// To get this URL:
// 1. Open your Google Sheet.
// 2. Go to Extensions > Apps Script.
// 3. Paste the provided script code, save, and click "Deploy" > "New Deployment".
// 4. For "Who has access", select "Anyone".
// 5. Click "Deploy" and copy the "Web app URL" here.
// ===================================================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwRrBYob2LpHdN5T14aUdua1xamSeEjwXm-3LkFOswjcVD9sFbmz4UtPA42HQLFFaAF/exec";

/**
 * Generates or retrieves a unique anonymous ID for the current user session.
 * The ID is stored in sessionStorage to persist across page reloads within the same tab.
 * @returns {string} The session ID.
 */
export const getSessionId = (): string => {
    const SESSION_KEY = 'anonymous_session_id';
    try {
        let sessionId = window.sessionStorage.getItem(SESSION_KEY);
        if (!sessionId) {
            sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            window.sessionStorage.setItem(SESSION_KEY, sessionId);
        }
        return sessionId;
    } catch (error) {
        // Fallback for environments where sessionStorage is not available
        return 'session-storage-not-available';
    }
};


/**
 * Logs user interaction data to a configured Google Sheet Web App.
 * If the URL is not provided or is still the placeholder, it logs to the console as a fallback.
 * @param data The interaction data to log.
 */
export const logInteraction = async (data: Omit<InteractionData, 'sessionId' | 'timestamp'> & { response?: string | object }) => {
    const interactionData: InteractionData = {
        ...data,
        sessionId: getSessionId(),
        timestamp: new Date().toISOString(),
    };

    if (!SCRIPT_URL || SCRIPT_URL.includes("YOUR_GOOGLE_SHEET_WEB_APP_URL_HERE")) {
        console.log("Tracking service not configured. Please add your Google Sheet Web App URL in services/trackingService.ts. Logging to console instead:", interactionData);
        return;
    }

    try {
        // 'no-cors' mode allows sending "fire-and-forget" data to a Google Apps Script
        // from a different origin without requiring complex CORS setup in the script.
        // The client-side will not be able to read the response from the server,
        // but the server will still receive the data. This is ideal for logging.
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(interactionData),
            // The request is sent as 'keepalive' to increase the chance of it
            // completing successfully, even if the user navigates away from the page.
            keepalive: true,
        });
    } catch (error) {
        console.error("Failed to log interaction to Google Sheet:", error);
    }
};

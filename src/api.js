import { GOOGLE_SCRIPT_URL } from './config';

// Helper to handle CORS issues with Google Apps Script
// Usually 'no-cors' mode is opaque, but GAS can return JSONP or we can use the 'text/plain' Content-Type hack with 'POST' always.
// Standard trick: Use POST for everything if GET has issues, or just standard fetch if published correctly as "Anyone, even anonymous".

export const fetchRequests = async () => {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

export const submitRequest = async (formData) => {
    // We use POST with 'no-cors' if we don't need response, but we DO need response.
    // The best way for GAS: content-type: text/plain to avoid preflight options check which GAS fails on.

    const payload = {
        action: 'create',
        ...formData
    };

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
            // Do NOT set Content-Type to application/json, or it triggers CORS preflight options which GAS doesn't handle.
            // Default (text/plain) works best.
        });

        // With text/plain, we might get a response.
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error submitting request:", error);
        return { status: 'error', message: error.message };
    }
};

export const updateRequest = async (id, status, remarks) => {
    const payload = {
        action: 'update',
        id,
        status,
        remarks
    };

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating request:", error);
        return { status: 'error', message: error.message };
    }
};

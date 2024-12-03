let aiSession = null;

// Initialize AI session
async function initializeAISession() {
    try {
        const capabilities = await chrome.aiOriginTrial.languageModel.capabilities();
        if (capabilities.available !== "readily") {
            console.warn(`Model not readily available (status: ${capabilities.available}).`);
            return null;
        }
        aiSession = await chrome.aiOriginTrial.languageModel.create();
        console.log("AI Session Initialized");
    } catch (err) {
        console.error("Failed to initialize AI session:", err);
        aiSession = null;
    }
}

// Generate AI suggestions using streaming
async function generateAISuggestionsFromSummaryStreaming(summary, onUpdate) {
    if (!aiSession) await initializeAISession();
    if (!aiSession) throw new Error("AI session not initialized.");

    const prompt = `
You are a travel assistant. Based on the following saved flight data, identify the full trip duration and generate a concise, optimized travel itinerary for each day of the trip. 
The itinerary should:
- Include flights mentioned in the data as fixed events.
- Suggest reasonable activities or plans for the remaining part of each day.
- Avoid unnecessary information, keeping descriptions short and actionable.
- When generating activities, consider the location, time of day, and typical tourist interests.

Saved Flight Data:
${summary}

Example response format:
Day 1:
- Morning: Short description of activities (e.g., sightseeing, breakfast at a local café)
- Afternoon: Short description of activities (e.g., visit a popular attraction)
- Evening: Short description of activities (e.g., dinner at a recommended restaurant)

Day 2:
- Morning: Short description of activities
- Afternoon: Short description of activities
...

Continue generating itineraries for all days of the trip duration, ensuring clarity and focus. Avoid verbose or overly generic suggestions.

Generate the itinerary:
`;

    try {
        const stream = await aiSession.promptStreaming(prompt);
        let fullResponse = "";
        for await (const chunk of stream) {
            fullResponse += chunk;
            if (onUpdate) onUpdate(chunk.trim()); // Update the full response
        }
    } catch (err) {
        console.error("Error generating AI suggestions via streaming:", err);
        throw err;
    }
}


// Destroy AI session
async function destroyAISession() {
    if (aiSession) {
        await aiSession.destroy();
        aiSession = null;
        console.log("AI Session Destroyed");
    }
}

export { initializeAISession, generateAISuggestionsFromSummaryStreaming, destroyAISession };

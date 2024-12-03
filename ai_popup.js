import { generateAISuggestionsFromSummaryStreaming, initializeAISession, destroyAISession } from "./ai.js";
import { generateSummary, markdownToHTML } from "./ai_helpers.js";

document.addEventListener("DOMContentLoaded", async () => {
    const aiInput = document.getElementById("ai-input");
    const aiSubmit = document.getElementById("ai-submit");
    const downloadBtn = document.getElementById("download-btn");
    const aiSuggestions = document.getElementById("ai-suggestions");
    const progressIndicator = document.getElementById("progress-indicator");
    const debugSection = document.getElementById("debug-section");
    const debugToggle = document.getElementById("debug-toggle");
    const summarySection = document.getElementById("summary-section");

    let itineraryData = await new Promise((resolve) => {
        chrome.storage.local.get(["currentItineraryData"], (result) => {
            resolve(result.currentItineraryData || []);
        });
    });

    let previousResponse = ""; // Tracks the previous AI response
    let firstRequest = true;  // Tracks if this is the first request

    await initializeAISession();

    // Display the summary
    const displaySummary = () => {
        try {
            const summary = generateSummary(itineraryData);
            summarySection.innerHTML = `<pre>${summary}</pre>`;
        } catch (error) {
            console.error("Error generating summary:", error);
            summarySection.innerHTML = "<p>An error occurred while generating the summary.</p>";
        }
    };

    // Generate and display AI suggestions
    const displayAISuggestions = async (userInput = null) => {
        try {
            progressIndicator.classList.remove("hidden");

            if (!itineraryData || itineraryData.length === 0) {
                aiSuggestions.innerHTML = `<div class="text-gray-500">No data available for this itinerary.</div>`;
                return;
            }

            let prompt;
            if (firstRequest) {
                // First request uses the trip summary
                const summaryPrompt = generateSummary(itineraryData)
                    .replace(/<[^>]*>/g, "")
                    .replace(/\n/g, " ");
                prompt = summaryPrompt;
                firstRequest = false; // Mark first request as completed
            } else {
                // Subsequent requests use the previous response as context
                prompt = `
Previous AI Response:
${previousResponse}

User Query:
${userInput}

Generate an updated itinerary or response based on the above. Be concise and actionable.
                `;
            }

            aiSuggestions.innerHTML = ""; // Clear suggestions before generating a new response

            // Stream the response
            await generateAISuggestionsFromSummaryStreaming(prompt, (chunk) => {
                previousResponse = chunk.trim(); // Update previous response with the latest chunk
                aiSuggestions.innerHTML = `
                    <div class="p-2 bg-white shadow rounded mb-2">
                        ${markdownToHTML(previousResponse)}
                    </div>`;
            });
        } catch (error) {
            aiSuggestions.innerHTML = `<div class="text-red-500">Error generating suggestions: ${error.message}</div>`;
        } finally {
            progressIndicator.classList.add("hidden");
        }
    };

    // Download the summary and suggestions as a text file
    const downloadContent = () => {
        const summaryContent = summarySection.innerText;
        const suggestionsContent = aiSuggestions.innerText;

        const content = `Summary:\n${summaryContent}\n\nItinerary Suggestions:\n${suggestionsContent}`;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "travel_summary.txt";
        link.click();

        URL.revokeObjectURL(url); // Clean up the URL object
    };

    // Toggle debug section
    debugToggle.addEventListener("click", () => {
        debugSection.classList.toggle("hidden");
        debugSection.innerHTML = !debugSection.classList.contains("hidden")
            ? `<h4>Raw Itinerary Data:</h4><pre>${JSON.stringify(itineraryData, null, 2)}</pre>`
            : "";
    });

    // Handle user query submission
    aiSubmit.addEventListener("click", async () => {
        const userQuery = aiInput.value.trim();
        if (userQuery) {
            aiInput.value = ""; // Clear the input field
            await displayAISuggestions(userQuery);
        }
    });

    // Handle download button click
    downloadBtn.addEventListener("click", () => {
        downloadContent();
    });

    // Cleanup AI session on window close
    window.addEventListener("beforeunload", async () => {
        await destroyAISession();
    });

    // Initialize UI
    displaySummary();
    await displayAISuggestions(); // Start with the initial request
});

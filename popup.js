// DOM Elements
const saveButton = document.getElementById("save-data");
const clearButton = document.getElementById("clear-data");
const openTabButton = document.getElementById("open-tab");
const status = document.getElementById("status");
const dataList = document.getElementById("data-list");

// Save Current Page Info
saveButton.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
        });
        status.innerText = "Data extraction in progress...";
    }
});

// Load and Display Stored Data
function loadData() {
    chrome.runtime.sendMessage({ type: "getData" }, (response) => {
        if (response.status === "success") {
            const data = response.data;
            dataList.innerHTML = ""; // Clear existing content

            if (data.length > 0) {
                data.forEach((item, index) => {
                    const card = document.createElement("div");
                    card.className = "border border-gray-300 rounded p-4 mb-4";

                    // Safely handle missing data
                    const segments = item.segments?.join(", ") || "No segments available";
                    const airlines =
                        item.airlineInfo?.join(", ") || "No airline information available";

                    // Booking Options
                    const bookingOptions = item.bookingOptions || [];
                    const bookingList = bookingOptions
                        .map(
                            (option) => `
                                <li>
                                    Agent: ${option.agentName} (${option.agentBadge})<br>
                                    Rating: ${option.agentRating}<br>
                                    Price: ${option.totalPrice}<br>
                                    <a href="${option.bookingLink}" target="_blank" class="text-blue-500">Book Now</a>
                                </li>`
                        )
                        .join("");

                    // Collapsible content
                    const collapsedContent = `
                        <p class="text-sm text-gray-600">From: ${item.origin}</p>
                        <p class="text-sm text-gray-600">To: ${item.destination}</p>
                        <p class="text-sm text-gray-600">Outbound: ${item.outboundDate}</p>
                    `;

                    const fullContent = `
                        ${collapsedContent}
                        <p class="text-sm text-gray-600">Inbound: ${item.inboundDate}</p>
                        <p class="text-sm text-gray-600">Segments: ${segments}</p>
                        <p class="text-sm text-gray-600">Airlines: ${airlines}</p>
                        <h4 class="text-sm font-medium text-gray-700 mt-2">Booking Options</h4>
                        <ul class="list-disc ml-4 text-sm text-gray-600">${bookingList}</ul>
                    `;

                    card.innerHTML = `
                        <h3 class="text-sm font-medium text-gray-800 mb-2">Flight</h3>
                        <div class="entry-content">${collapsedContent}</div>
                        <button class="toggle-btn text-blue-500 text-xs mt-2">Show More</button>
                        <div class="mt-2 flex justify-end space-x-2">
                            <button class="delete-btn bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600" data-index="${index}">
                                Delete
                            </button>
                            <button class="add-itinerary-btn bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600" data-index="${index}">
                                Add to Itinerary
                            </button>
                        </div>
                    `;

                    // Add functionality to toggle button
                    card.querySelector(".toggle-btn").addEventListener("click", (e) => {
                        const contentDiv = card.querySelector(".entry-content");
                        const toggleBtn = e.target;

                        if (toggleBtn.textContent === "Show More") {
                            contentDiv.innerHTML = fullContent;
                            toggleBtn.textContent = "Show Less";
                        } else {
                            contentDiv.innerHTML = collapsedContent;
                            toggleBtn.textContent = "Show More";
                        }
                    });

                    dataList.appendChild(card);
                });

                // Add event listeners for buttons
                document.querySelectorAll(".delete-btn").forEach((btn) => {
                    btn.addEventListener("click", (e) => {
                        const index = e.target.dataset.index;
                        deleteEntry(index);
                    });
                });

                document.querySelectorAll(".add-itinerary-btn").forEach((btn) => {
                    btn.addEventListener("click", (e) => {
                        const index = e.target.dataset.index;
                        addToItinerary(index);
                    });
                });
            } else {
                dataList.innerHTML = `<p class="text-sm text-gray-600">No data available.</p>`;
            }

            status.innerText = ""; // Clear the "in progress" status
        }
    });
}

// Delete an individual entry
function deleteEntry(index) {
    chrome.runtime.sendMessage({ type: "deleteData", index: parseInt(index) }, (response) => {
        if (response.status === "success") {
            loadData(); // Refresh data after deletion
        }
    });
}

// Add an entry to an itinerary
function addToItinerary(index) {
    const itineraryName = prompt("Enter itinerary name:");
    if (itineraryName) {
        chrome.runtime.sendMessage(
            { type: "addToItinerary", index: parseInt(index), itinerary: itineraryName },
            (response) => {
                if (response.status === "success") {
                    loadData(); // Refresh data after adding to itinerary
                }
            }
        );
    }
}

// Clear All Stored Data
clearButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "clearData" }, (response) => {
        if (response.status === "success") {
            dataList.innerHTML = `<p class="text-sm text-gray-600">No data available.</p>`;
        }
    });
});

// Open Persistent Tab
openTabButton.addEventListener("click", () => {
    chrome.tabs.create({ url: "persistent.html" });
});

// Refresh data when notified that data has been saved
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "dataSaved") {
        loadData(); // Refresh the data
    }
});

// Load data on popup open
document.addEventListener("DOMContentLoaded", loadData);

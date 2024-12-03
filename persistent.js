
const dataList = document.getElementById("data-list");
const itineraryList = document.getElementById("itinerary-list");

// Load and Display Stored Data
function loadData() {
  chrome.runtime.sendMessage({ type: "getData" }, (response) => {
    if (response.status === "success") {
      const data = response.data;
      renderItineraries(data);
      renderDataList(data);
    }
  });
}

// Render the Saved Data List (Right Column)
function renderDataList(data) {
  dataList.innerHTML = ""; // Clear existing content

  if (data.length > 0) {
    data.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "entry-card border border-gray-300 rounded p-4 mb-4";

      const segments = item.segments?.join(", ") || "No segments available";
      const airlines = item.airlineInfo?.join(", ") || "No airline information available";

      const bookingOptions = item.bookingOptions || [];
      const bookingList = bookingOptions
        .map(
          (option) => `
            <li>
              Agent: ${option.agentName} (${option.agentBadge})<br>
              Rating: ${option.agentRating}<br>
              Price: ${option.totalPrice}<br>
              <a href="${option.bookingLink}" target="_blank" class="text-blue-500">Book Now</a>
            </li>
          `
        )
        .join("");

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
}

// Render the Itineraries (Left Column)
function renderItineraries(data) {
  itineraryList.innerHTML = ""; // Clear existing content

  const itineraries = {};

  // Group entries by itinerary
  data.forEach((entry) => {
      if (entry.itinerary) {
          if (!itineraries[entry.itinerary]) {
              itineraries[entry.itinerary] = [];
          }
          itineraries[entry.itinerary].push(entry);
      }
  });

  if (Object.keys(itineraries).length > 0) {
      Object.entries(itineraries).forEach(([itinerary, entries]) => {
          const itineraryCard = document.createElement("div");
          itineraryCard.className = "itinerary-card border border-gray-300 rounded p-4 mb-4";

          const entryList = entries
              .map((entry, index) => {
                  const collapsedContent = `
                      <p class="text-sm text-gray-600">From: ${entry.origin}</p>
                      <p class="text-sm text-gray-600">To: ${entry.destination}</p>
                      <p class="text-sm text-gray-600">Outbound: ${entry.outboundDate}</p>
                  `;

                  const fullContent = `
                      ${collapsedContent}
                      <p class="text-sm text-gray-600">Inbound: ${entry.inboundDate}</p>
                      <p class="text-sm text-gray-600">Segments: ${entry.segments?.join(", ") || "No segments available"}</p>
                      <p class="text-sm text-gray-600">Airlines: ${entry.airlineInfo?.join(", ") || "No airline information available"}</p>
                  `;

                  return `
                      <li class="entry-item border-t mt-2 pt-2">
                          <div class="entry-content" data-index="${index}" data-itinerary="${itinerary}">
                              ${collapsedContent}
                          </div>
                          <button class="toggle-btn text-blue-500 text-xs mt-2" data-index="${index}" data-itinerary="${itinerary}">
                              Show More
                          </button>
                      </li>
                  `;
              })
              .join("");

          itineraryCard.innerHTML = `
              <h3 class="text-sm font-medium text-gray-800">${itinerary}</h3>
              <div class="action-buttons">
                  <button class="rename-itinerary-btn bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600" data-itinerary="${itinerary}">
                      Rename
                  </button>
                  <button class="delete-itinerary-btn bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600" data-itinerary="${itinerary}">
                      Delete
                  </button>
                  <button class="ai-btn bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600" data-itinerary="${itinerary}">
                      AI
                  </button>
              </div>
              <ul class="list-disc ml-4 mt-2 text-sm text-gray-600">${entryList}</ul>
          `;

          // Add event listeners for Rename and Delete buttons
          itineraryCard.querySelector(".rename-itinerary-btn").addEventListener("click", (e) => {
              const itinerary = e.target.dataset.itinerary;
              const newName = prompt("Enter a new name for this itinerary:", itinerary);
              if (newName && newName !== itinerary) {
                  renameItinerary(itinerary, newName);
              }
          });

          itineraryCard.querySelector(".delete-itinerary-btn").addEventListener("click", (e) => {
              const itinerary = e.target.dataset.itinerary;
              if (confirm(`Are you sure you want to delete the itinerary: ${itinerary}?`)) {
                  deleteItinerary(itinerary);
              }
          });

          itineraryCard.querySelector(".ai-btn").addEventListener("click", () => {
              handleAIButton(itinerary, entries);
          });

          // Add event listeners for the "Show More" toggle buttons
          itineraryCard.querySelectorAll(".toggle-btn").forEach((btn) => {
              btn.addEventListener("click", (e) => {
                  const index = e.target.dataset.index;
                  const itinerary = e.target.dataset.itinerary;
                  const entry = itineraries[itinerary][index];
                  const contentDiv = e.target.previousElementSibling;

                  if (e.target.textContent === "Show More") {
                      const fullContent = `
                          <p class="text-sm text-gray-600">From: ${entry.origin}</p>
                          <p class="text-sm text-gray-600">To: ${entry.destination}</p>
                          <p class="text-sm text-gray-600">Outbound: ${entry.outboundDate}</p>
                          <p class="text-sm text-gray-600">Inbound: ${entry.inboundDate}</p>
                           <p><strong>Segments:</strong></p>
                            <ul class="list-disc ml-4">
                            ${entry.segments
                              ?.map((segment, index) => {
                                  if (index % 3 === 0) {
                                      // Assuming the data follows a "Depart, Time, Location" format every 3 items
                                      const departure = segment;
                                      const time = entry.segments[index + 1] || "Unknown time";
                                      const location = entry.segments[index + 2] || "Unknown location";
                                      return `<li><strong>${departure}</strong> (${time}) at <strong>${location}</strong></li>`;
                                  }
                                  return ""; // Skip intermediate data points
                              })
                              .filter(Boolean)
                              .join("") || "<li>No segments available</li>"}
                      </ul>
                        
                      `;
                      contentDiv.innerHTML = fullContent;
                      e.target.textContent = "Show Less";
                  } else {
                      const collapsedContent = `
                          <p class="text-sm text-gray-600">From: ${entry.origin}</p>
                          <p class="text-sm text-gray-600">To: ${entry.destination}</p>
                          <p class="text-sm text-gray-600">Outbound: ${entry.outboundDate}</p>
                      `;
                      contentDiv.innerHTML = collapsedContent;
                      e.target.textContent = "Show More";
                  }
              });
          });

          itineraryList.appendChild(itineraryCard);
      });
  } else {
      itineraryList.innerHTML = `<p class="text-sm text-gray-600">No itineraries available.</p>`;
  }
}


// Rename an itinerary
function renameItinerary(oldName, newName) {
  chrome.runtime.sendMessage(
    { type: "renameItinerary", oldName, newName },
    (response) => {
      if (response.status === "success") {
        loadData(); // Refresh the data after renaming the itinerary
      } else {
        console.error("Error renaming itinerary:", response.error);
      }
    }
  );
}

// Delete an itinerary
function deleteItinerary(itineraryName) {
  chrome.runtime.sendMessage(
    { type: "unassignItinerary", itinerary: itineraryName },
    (response) => {
      if (response.status === "success") {
        loadData(); // Refresh the data after unassigning the itinerary
      } else {
        console.error("Error deleting itinerary:", response.error);
      }
    }
  );
}


// AI button functionality to handle data saving and popup creation
function handleAIButton(itineraryName, itineraryData) {
  chrome.storage.local.set({ currentItineraryData: itineraryData }, () => {
    const popupUrl = `ai_popup.html?itinerary=${encodeURIComponent(itineraryName)}`;
    chrome.windows.create({
      url: popupUrl,
      type: "popup",
      width: 1200,
      height: 1200,
    });
  });
}


// Open the AI popup
function openAIPopup(itineraryName) {
  const popupUrl = `ai_popup.html?itinerary=${encodeURIComponent(itineraryName)}`;
  chrome.windows.create({
    url: popupUrl,
    type: "popup",
    width: 1200,
    height: 1200,
  });
}


// Delete an individual entry
function deleteEntry(index) {
  chrome.runtime.sendMessage({ type: "deleteData", index: parseInt(index) }, (response) => {
    if (response.status === "success") {
      loadData();
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
          loadData();
        }
      }
    );
  }
}


// Automatically load data on page load
loadData();


// Listener for installation or updates
chrome.runtime.onInstalled.addListener(() => {
  console.log("Travel Planner Assistant installed and ready.");
});

// Listener for messages from content or popup scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "saveData") {
    chrome.storage.local.get(["travelData"], (result) => {
      const travelData = result.travelData || [];
      travelData.push(message.data); // Add new data
      chrome.storage.local.set({ travelData }, () => {
        console.log("Data saved successfully:", message.data);
        sendResponse({ status: "success", message: "Data saved successfully." });
      });
    });
    return true;
  }

  if (message.type === "getData") {
    chrome.storage.local.get(["travelData"], (result) => {
      sendResponse({ status: "success", data: result.travelData || [] });
    });
    return true;
  }

  if (message.type === "clearData") {
    chrome.storage.local.remove("travelData", () => {
      console.log("All data cleared.");
      sendResponse({ status: "success", message: "All data cleared." });
    });
    return true;
  }

  if (message.type === "deleteData") {
    chrome.storage.local.get(["travelData"], (result) => {
      const travelData = result.travelData || [];
      travelData.splice(message.index, 1); // Remove entry at the specified index
      chrome.storage.local.set({ travelData }, () => {
        console.log(`Deleted entry at index ${message.index}`);
        sendResponse({ status: "success", message: "Entry deleted." });
      });
    });
    return true;
  }

  if (message.type === "addToItinerary") {
    chrome.storage.local.get(["travelData"], (result) => {
      const travelData = result.travelData || [];
      if (message.index >= 0 && message.index < travelData.length) {
        travelData[message.index].itinerary = message.itinerary; // Add itinerary name
        chrome.storage.local.set({ travelData }, () => {
          console.log(
            `Entry at index ${message.index} added to itinerary "${message.itinerary}"`
          );
          sendResponse({
            status: "success",
            message: "Entry added to itinerary.",
          });
        });
      } else {
        sendResponse({ status: "error", message: "Invalid index." });
      }
    });
    return true;
  }

  if (message.type === "renameItinerary") {
    chrome.storage.local.get(["travelData"], (result) => {
      const travelData = result.travelData || [];
      travelData.forEach((entry) => {
        if (entry.itinerary === message.oldName) {
          entry.itinerary = message.newName; // Update itinerary name
        }
      });
      chrome.storage.local.set({ travelData }, () => {
        console.log(
          `Renamed itinerary from "${message.oldName}" to "${message.newName}"`
        );
        sendResponse({
          status: "success",
          message: "Itinerary renamed successfully.",
        });
      });
    });
    return true;
  }

  if (message.type === "unassignItinerary") {
    chrome.storage.local.get(["travelData"], (result) => {
      const travelData = result.travelData || [];
      travelData.forEach((entry) => {
        if (entry.itinerary === message.itinerary) {
          delete entry.itinerary; // Remove the itinerary tag
        }
      });
      chrome.storage.local.set({ travelData }, () => {
        console.log(
          `Unassigned entries from itinerary "${message.itinerary}"`
        );
        sendResponse({
          status: "success",
          message: "Itinerary unassigned successfully.",
        });
      });
    });
    return true;
  }
});

// Debugging helper: Log storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.travelData) {
    console.log("Travel data updated:", changes.travelData.newValue);
  }
});

# AI Travel Assistant Chrome Extension

AI Travel Assistant is a Chrome extension designed to streamline travel planning. It saves flight data, generates itineraries using generative AI, and offers exportable summaries for a seamless travel organization experience.

---

## Features
- **Save Flight Information Automatically**: Automatically captures flight details for trip planning.
- **AI-Generated Itineraries**: Creates personalized itineraries based on flight details.
- **Export Reports**: Download detailed trip summaries as text files.
- **Interactive Queries**: Refine itineraries by querying AI for updates.

---

## Requirements
- **Browser**: Google Chrome Canary (latest version).
- **Developer Mode**: Enabled in Chrome Extensions settings.
- **Chrome Flags**: Activation of experimental flags (see below).
- **Origin Trial Registration**: Required to use the Prompt API for Chrome Extensions.

---

## Installation Steps

### 1. Clone or Download the Repository
Download the repository as a ZIP file or clone it:
```bash
git clone https://github.com/yourusername/ai-travel-assistant.git
```
# Travel Itinerary Planning Chrome Extension

## Setup Instructions

### 2. Enable Developer Mode
1. Open Chrome Canary.
2. Navigate to `chrome://extensions/`.
3. Toggle **Developer mode** in the top right corner.

### 3. Load the Extension
1. Click **Load unpacked**.
2. Select the folder where you downloaded or cloned the repository.

### 4. Register for the Origin Trial
1. Go to [Chrome Origin Trials](https://developer.chrome.com/origintrials/#/trials/active).
2. Register the **Extension ID** of the loaded extension.
3. Add the provided token to the extension's `manifest.json` under the `key` field.

### 5. Enable Required Chrome Flags
1. Open Chrome Canary and navigate to `chrome://flags/`.
2. Search for and enable the following flags:
   - `#optimization-guide-on-device-model`
   - **Prompt API for Gemini Nano**
   - *(Optional)* Enable all **Gemini Nano** features for full functionality.
3. Restart the browser.

## How to Use
1. Load the extension and navigate to the popup by clicking on the extension icon.
2. Save flight details from any website directly into the extension.
3. Use the **AI Input** field to refine or generate itineraries.
4. Download trip summaries as `.txt` files for offline use.

## Known Limitations
- **Prompt API:** Limited to experimental use and requires the Canary build.
- **Data Sources:** Currently supports only flight data. Accommodations and additional planning tools are under development.

## Future Enhancements
- Integration with cloud-based AI for faster and more detailed itineraries.
- Accommodation and activity tracking.
- Advanced export options for Word and Excel files.


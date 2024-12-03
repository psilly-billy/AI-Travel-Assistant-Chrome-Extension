(async function () {
    try {
        // Extract details from the page
        function extractFlightDetails() {
            const details = {};

            // Departure and Arrival Cities
            details.origin =
                document
                    .querySelector(".SearchDetails_origin__YzczM")
                    ?.textContent.trim() || "Unknown Origin";
            details.destination =
                document
                    .querySelector(".SearchDetails_destination__NzJiY")
                    ?.textContent.trim() || "Unknown Destination";

            // Dates
            details.outboundDate =
                document.querySelector("#outbound_date")?.value.trim() ||
                "Unknown Outbound Date";
            details.inboundDate =
                document.querySelector("#inbound_date")?.value.trim() ||
                "Unknown Inbound Date";

            // Flight Segments (Departure and Arrival times)
            details.segments = Array.from(
                document.querySelectorAll(".SegmentEndpoint_segmentEndpoint__MDFhM span")
            ).map((segment) => segment.textContent.trim());

            // Airlines and Flight Numbers
            details.airlineInfo = Array.from(
                document.querySelectorAll(".AirlineLogoTitle_container__MmY00 .visually-hidden")
            ).map((airline) => airline.textContent.trim());

            // Booking Options
            details.bookingOptions = Array.from(
                document.querySelectorAll(".PricingItem_container__ODdjZ")
            ).map((option) => {
                const agentName = option.querySelector(".AgentDetails_agentNameContainer__M2Q4M")
                    ?.textContent.trim() || "Unknown Agent";
                const agentRating = option.querySelector(".AgentRating_rating__ZGZiN")
                    ?.textContent.trim() || "No Rating";
                const agentBadge = option.querySelector(".AgentDetails_badge__YjVkM")
                    ?.textContent.trim() || "No Badge";
                const totalPrice = option.querySelector(".TotalPrice_totalPrice__YmQyY")
                    ?.textContent.trim() || "Unknown Price";
                const bookingButton = option.querySelector(".PricingItem_ctaButton__MGRkN");

                return {
                    agentName,
                    agentRating,
                    agentBadge,
                    totalPrice,
                    bookingLink: bookingButton?.href || "No Link"
                };
            });

            return details;
        }

        // Save extracted data to local storage and notify popup.js
        const flightDetails = extractFlightDetails();

        chrome.storage.local.get(["travelData"], (result) => {
            const travelData = result.travelData || [];
            travelData.push(flightDetails);
            chrome.storage.local.set({ travelData }, () => {
                console.log("Flight details saved successfully!");
                chrome.runtime.sendMessage({ type: "dataSaved" });
            });
        });
    } catch (error) {
        console.error("Error extracting flight details:", error);
    }
})();

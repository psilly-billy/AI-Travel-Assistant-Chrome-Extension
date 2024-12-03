export const generateSummary = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
        return "No flight data available to summarize.";
    }

    return data.map((entry, index) => {
        const { segments, bookingOptions, outboundDate, inboundDate, origin, destination } = entry;

        const outboundSegment = segments?.[0]?.match(/Departing from (.+?), .+?, (.+?)\./) || [];
        const outboundDetails = outboundSegment.length > 1
            ? `Departing from ${outboundSegment[1]} (${segments[2]}), ${outboundSegment[2]}`
            : `Departing from ${origin} to ${destination}`;

        const arrivalSegment = segments?.[3]?.match(/Arriving at (.+?), .+?, (.+?)\./) || [];
        const arrivalDetails = arrivalSegment.length > 1
            ? `Arriving at ${arrivalSegment[1]} (${segments[4]}), ${arrivalSegment[2]}`
            : "Unknown arrival details.";

        const isOneWay = inboundDate === "Unknown Inbound Date";
        let returnDetails = null;

        if (!isOneWay && segments.length > 5) {
            const returnSegment = {
                depart: segments[6]?.match(/Departing from (.+?), .+?, (.+?)\./) || [],
                arrive: segments[9]?.match(/Arriving at (.+?), .+?, (.+?)\./) || [],
            };

            returnDetails = returnSegment.depart.length > 1 && returnSegment.arrive.length > 1
                ? `Departing from ${returnSegment.depart[1]} (${segments[7]}), ${returnSegment.depart[2]}. Arriving at ${returnSegment.arrive[1]} (${segments[10]}), ${returnSegment.arrive[2]}.`
                : "Unknown return details.";
        }

        const cheapestOption = bookingOptions.reduce((cheapest, option) =>
            parseFloat(option.totalPrice.split(" ")[0]) < parseFloat(cheapest.totalPrice.split(" ")[0])
                ? option
                : cheapest
        );

        const bestRatedOption = bookingOptions.reduce((bestRated, option) =>
            parseInt(option.agentRating || 0) > parseInt(bestRated.agentRating || 0)
                ? option
                : bestRated
        );

        return `
            Flight ${index + 1}: ${origin} (${segments[2] || "Unknown"}) to ${destination} (${segments[4] || "Unknown"}) (${outboundDate}${isOneWay ? "" : ` to ${inboundDate}`})
            - Outbound: ${outboundDetails}. ${arrivalDetails}.
            ${returnDetails ? `- Return: ${returnDetails}` : ""}
            Booking Options:
            - Cheapest Option: <a href="${cheapestOption.bookingLink}" target="_blank" class="text-blue-500 underline">${cheapestOption.totalPrice} with ${cheapestOption.agentName}</a>.
            - Best Rated Option: <a href="${bestRatedOption.bookingLink}" target="_blank" class="text-blue-500 underline">${bestRatedOption.totalPrice} with ${bestRatedOption.agentName}</a> (Rating: ${bestRatedOption.agentRating || "No Rating"}).
        `;
    }).join("\n\n");
};

export const markdownToHTML = (markdownText) => {
    return markdownText
        .replace(/## (.*?)(\n|$)/g, '<h2 class="font-bold text-lg">$1</h2>') // Format headings
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italics
        .replace(/(?<!>)\n/g, '<br>'); // Replace newlines with <br>, but not if already processed
};


// news.js - Responsible for managing the news ticker

let newsQueue = []; // Array to store news items

/**
 * Add a news item to the ticker queue.
 * @param {string} message - The message to display in the ticker.
 */
function addNewsItem(message) {
    const timestamp = new Date().toLocaleTimeString(); // Current time
    newsQueue.push(`[${timestamp}] ${message}`); // Add the message with a timestamp

    console.log(`News: ${message}`); // Optional: Log the news to the console
}

/**
 * Render the news ticker.
 */
function displayNewsTicker() {
    const tickerContainer = document.getElementById('news-ticker-container');
    if (!tickerContainer) {
        console.warn("News ticker container not found!");
        return;
    }

    // Clear the container
    tickerContainer.innerHTML = "";

    // Create the ticker content
    const tickerContent = document.createElement('div');
    tickerContent.className = 'ticker-content'; // Apply scrolling animation
    tickerContent.innerHTML = newsQueue.map(news => `<span>${news}</span>`).join(" • "); // Add real news

    // Add the ticker content to the container
    tickerContainer.appendChild(tickerContent);

    console.log("News ticker updated:", tickerContent.innerHTML);
}
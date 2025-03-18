let scrollContainer;
document.addEventListener('DOMContentLoaded', () => {
    scrollContainer = document.getElementById('scroll-container');
});
const messageQueue = [];

function addScrollingMessage(newText) {
    // Create a new message element
    const message = document.createElement('div');
    message.className = 'scroll-message';
    message.textContent = newText;

    message.style.animationDuration = `${15}s`;
    scrollContainer.appendChild(message);

    // Remove the message once it has finished scrolling off-screen
    setTimeout(() => {
        scrollContainer.removeChild(message);
    }, 15 * 1000);
}

// Function to process the message queue
function processMessageQueue() {
    if (messageQueue.length > 0) {
        const nextMessage = messageQueue.shift();
        addScrollingMessage(nextMessage);
    }
}

// Function to add a message to the queue
function queueMessage(newText) {
    console.log(`Queuing message: ${newText}`);
    messageQueue.push(newText);
}

// Start processing the queue every 5 seconds
setInterval(() => {
    processMessageQueue();
}, 2500);




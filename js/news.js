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
    //console.log(`Queuing message: ${newText}`);
    messageQueue.push(newText);
}

// Start processing the queue every 5 seconds
setInterval(() => {
    processMessageQueue();
}, 2500);


setInterval(() => {
    let rng = random(0, 100);
    if (rng < 10) {
        queueMessage("<<<<<PEANUT BUTTER>>>>>>");
    }
    else if (rng < 20) {
        queueMessage("<<<<<JELLY>>>>>>");
    }
    else if (rng < 30) {
        queueMessage("MESSI IS THE GOAT");
    }
    else if (rng < 40) {
        queueMessage("Walk up in Saks spend a Fifth");
    }
    else if (rng < 50) {
        queueMessage("The encomomy.....");
    }
    else if (rng < 60) {
        queueMessage("the stock market is sstocking");
    }
    else if (rng < 70) {
        queueMessage("Remeber to harvest your mats");
    }
    else if (rng < 80) {
        queueMessage("!!!!!!HULU!!!!!");
    }
    else if (rng < 90) {
        queueMessage("So many cities, so little time");
    }
    else if (rng < 100) {
        queueMessage("I'm a lumberjack and I'm okay");
    }
}, 7000);

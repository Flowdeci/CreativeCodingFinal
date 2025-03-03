let scheduler = [];

/**
 * Adds an event to the scheduler.
 * @param {string} type - The type of event (e.g., "updateRelationships", "startWar").
 * @param {Object} target - The target of the event (e.g., a city or null for global events).
 * @param {number} delay - Delay in milliseconds before the event executes.
 * @param {boolean} repeat - Whether the event should repeat.
 * @param {Object} data - Optional additional data for the event (e.g., source and target cities for trade).
 */
function scheduleEvent(type, target, delay, repeat, data = {}) {
    scheduler.push({
        type: type,            // Event type (e.g., "updateRelationships", "startWar")
        target: target,        // Target city (or null for global events)
        executeAt: millis() + delay, // Time when the event should execute
        delay: delay,          // Save delay for repeating events
        repeat: repeat,
        data: data
    });

    console.log(`Scheduled event: ${type} for target (${target.x}, ${target.y}) at ${millis() + delay}`);
}

/**
 * Processes the scheduler and executes due events.
 */
function processEvents() {
    let currentTime = millis();
    scheduler = scheduler.filter(event => {
        if (currentTime >= event.executeAt) {
            handleEvent(event); // Execute the event
            if (event.repeat) {
                // Reset the timer for the event using its delay
                event.executeAt = currentTime + event.delay;
                return true; // Keep the event in the queue
            }
            return false; // Remove non-repeating events
        }
        return true; // Keep future events in the queue
    });
}

/**
 * Handles an event.
 * @param {Object} event - The event to handle.
 */
function handleEvent(event) {
    switch (event.type) {
        case "updateRelationships":
            if (event.target && event.target instanceof City) {
                event.target.determineRelationships(cities);
            }
            break;
        case "startWar":
            console.log(`War started involving ${event.target.x}, ${event.target.y}`)
            //Add War logic here
            break;
        case "trade":
            if (event.data.source && event.data.target) {
                console.log("should trade");
                event.data.source.trade(event.data.target);
            }
            break;
        case "statChange":
            if (event.target && event.target instanceof City) {
                // Example: Adjust city technology
                event.target.technology += random(-5, 5);
                event.target.technology = constrain(event.target.technology, 0, 100);
            }
            break;

        default:
            console.warn("Unknown event type:", event.type);
    }
}


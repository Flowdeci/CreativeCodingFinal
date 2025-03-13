//Schedule.js- resposible for executing all the cities events at specific times
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
}


/**
 * Processes the scheduler and executes due events.
 */
function processEvents() {
    let currentTime = millis();

    scheduler = scheduler.filter(event => {
        if (currentTime >= event.executeAt) {
            console.log(`executing event: ${event}`)
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
        case "attack":
            if (event.target && event.target instanceof City) {
                if (event.target.hostiles.length > 0) {
                    let randomHostile = event.target.hostiles[floor(random(event.target.hostiles.length))];
                    event.target.attack(randomHostile);
                }
            }
            break;
        case "trade":
            if (event.target && event.target instanceof City) {
                event.target.trade(); // Call the trade method for the city
            }
            break;
        case "statChange":
            if (event.target && event.target instanceof City) {
                event.target.applyStatChange(); // Apply drastic stat changes
            }
            break;

        default:
            console.warn("Unknown event type:", event.type);
    }
}


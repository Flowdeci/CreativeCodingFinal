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
    //console.log(scheduler)
    let currentTime = millis();

    scheduler = scheduler.filter(event => {
        if (currentTime >= event.executeAt) {
            //console.log(`executing event: ${event}`)
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
    //console.log("Event type: ", event.type);
    switch (event.type) {
        case "updateRelationships":
            if (event.target && event.target instanceof City) {
                event.target.determineRelationships(cities);
            }
            break;
        case "attack":
            if (event.target && event.target instanceof City) {
                if (event.target.hostiles.length > 0) {
                    // Filter valid hostiles
                    let validHostiles = event.target.hostiles.filter(city => city && !city.isDestroyed);

                    for (let city of validHostiles) {
                        if (city && city.technology != null && city.militaryStrength != null) {
                            // Calculate stat differences
                            let techDiff = event.target.technology - city.technology;
                            let strengthDiff = event.target.militaryStrength - city.militaryStrength;
                            let aggressionFactor = map(event.target.aggression, 0, 100, 0, 50);

                            let attackScore =
                                map(techDiff, -100, 100, -20, 20) +
                                map(strengthDiff, -100, 100, -30, 30) +
                                aggressionFactor;


                            let rng = random(0, 100);


                            if (attackScore > rng) {
                                event.target.attack(city); // Execute the attack
                            }
                        }
                    }
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
        case "plague":
            if (event.target && event.target instanceof City) {
                event.target.plague();
            }
        case "respawnCity":
            if (cities.length < citiesSize) {
                spawnNewCity();
            }
            break;

        default:
            console.warn("Unknown event type:", event.type);
    }
}




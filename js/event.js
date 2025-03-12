//event.js - sotres all the events that the user can implement

/**
 * Nuke a city, reducing its population and increasing aggression.
 * @param {City} city - The city to nuke.
 */
function nukeCity(city) {
    if (city) {
        city.population *= 0.5;//Halve population
        city.aggression += 20;//Increase aggresssion 
        city.stability *= 0.5;//Decrease stabilitiy
        console.log(`City ${city.id} has been nuked! Population: ${city.population}, Aggression: ${city.aggression}`);
    }

}

/**
 * Boost a city's technology and population.
 * @param {City} city - The city to boost.
 */
function techBoost(city) {
    if (city) {
        city.technology += 20;
        city.population += 50;
        console.log(`City ${city.id} received a tech boost! Tech: ${city.technology}, Population: ${city.population}`);
    }
}

/**
 * Trigger a plague in a city, reducing population and stability.
 * @param {City} city - The city to plague.
 */
function plague(city) {
    if (city) {
        //Reduce stablity and population
        city.population *= 0.6;
        city.stability *= 0.7;

        //Trigger plague visuals
        city.triggerPlagueEffect();

        //Affect any ally cities with plague
        if (city.allies) {
            for (let i = 0; i < city.allies.length; i++) {
                city.allies[i].population *= 0.7;
                city.allies[i].stability *= 0.8;
            }
        }
    }
}

/**
 * Trigger a meteor strike, affecting all cities.
 * @param {City[]} cities - The list of all cities in the simulation.
 */
function meteorStrike(cities) {
    for (let city of cities) {
        city.population *= 0.7; // Reduce population by 30%
        city.stability *= 0.8; // Decrease stability
    }
    console.log("A meteor strike has affected all cities!");
}


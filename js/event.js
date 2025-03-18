//event.js - sotres all the events that the user can implement
let activeMeteorStrike = null;
/**
 * Nuke a city, reducing its population and increasing aggression.
 * @param {City} city - The city to nuke.
 */
function nukeCity(city) {
    if (city) {
        if (city.nukeEffect == null) {
            city.triggerNukeEffect();
            console.log(`City ${city.id} has been nuked! Population: ${city.population}, Aggression: ${city.aggression}`);
            queueMessage(`City ${city.id} has been nuked!!!!`);
        }
        else if (city.nukeEffect.isActive == false) {
            city.triggerNukeEffect();
            console.log(`City ${city.id} has been nuked! Population: ${city.population}, Aggression: ${city.aggression}`);
            queueMessage(`City ${city.id} has been nuked!!!!`);
        }
    }
}

/**
 * Boost a city's technology and population.
 * @param {City} city - The city to boost.
 */
function techBoost(city) {
    if (city) {
        if (city.techBuilding.isTechBoosted == false) {
            city.technology += 20;
            city.population += 50;

            city.techBuilding.triggerTechBoostEffect();
            //console.log(`City ${city.id} received a tech boost! Tech: ${city.technology}, Population: ${city.population}`);
            queueMessage(`City ${city.id} received a tech boost! SHoutout to the tech brosqn!`);
        }
    }
}

/**
 * Trigger a plague in a city, reducing population and stability.
 * @param {City} city - The city to plague.
 */
function plague(city) {
    if (city) {
        if (city.isPlagued == false) {
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
            queueMessage(`City ${city.id} has been plagued! LOCKDOWN!`);
        }
    }
}

/**
 * Trigger a meteor strike, affecting all cities.
 * @param {City[]} cities - The list of all cities in the simulation.
 */
function meteorStrike(cities) {

    if (activeMeteorStrike == null) {

        activeMeteorStrike = new MeteorStrike(cities);

        console.log("A meteor strike has affected all cities!");
        queueMessage("METTTEOOOOOORSSSSSSSSSSSSS");
    }

}


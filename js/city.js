let era = [
    "village",
    "kingdom",
    "empire",
    "city",
    "society"
]
class City {
    static nextId = 0;

    constructor(x, y, population) {
        this.id = City.nextId++;
        this.x = x;
        this.y = y;
        this.width = random(25, 50);
        this.level = era[0];
        this.height = random(50, 150);
        this.population = population;
        this.citySize = map(this.population, 100, 1000, 40, 100);
        this.stability = this.calculateStability()
        this.hostiles = []
        this.allies = []

        //City Stats
        this.technology = random(0, 100);       // Represents the city's level of advancement
        this.aggression = random(0, 100);      // Determines how likely the city is to attack others
        this.defense = random(0, 100);         // Represents the city's ability to fend off attacks
        this.militaryStrength = random(0, 100); // Determines the strength of the city's army
        this.diplomacy = random(0, 100);       // Determines how likely the city is to form alliances

        // Schedule initial relationship update
        scheduleEvent("updateRelationships", this, 3000, true); // 10 seconds
        scheduleEvent("trade", this, 5000, true);
        scheduleEvent("statChange", this, 7000, true);
        scheduleEvent("attack", this, 10000, true);
    }

    render() {
        //Color based on stability
        let cityColor = lerpColor(color(255, 0, 0), color(0, 255, 0), this.stability);
        //Size based on population
        this.citySize = map(this.population, 100, 1000, 40, 100);
        // Pulsing effect
        let pulse = sin(frameCount * 0.1) * 2;
        let adjustedSize = this.citySize + pulse;
        //Draw City
        fill(cityColor);
        noStroke();
        translate(this.x, this.y, this.height / 2)
        box(this.width, this.width, this.height);

        if (selectedCity === this) {
            stroke(255, 200, 0); // Yellow glow
            strokeWeight(3);
            noFill();
            ellipse(this.x, this.y, adjustedSize + 10); // Slightly larger outline
        }

    }

    update(cities) {
        //Constrain values
        this.technology = constrain(this.technology, 0, 100);
        this.aggression = constrain(this.aggression, 0, 100);
        this.defense = constrain(this.defense, 0, 100);
        this.militaryStrength = constrain(this.militaryStrength, 0, 100);
        this.diplomacy = constrain(this.diplomacy, 0, 100);



        //Update stability
        this.stability = this.calculateStability();
    }

    calculateStability() {
        return map(this.population, 100, 1000, 0, 1);;
    }

    determineRelationships(cities) {
        //Reset all current relationships
        this.hostiles = [];
        this.allies = [];

        for (let city of cities) {
            //Skip self
            if (city === this) {
                continue;
            }

            // Determine relationship based on this city's stats
            if (this.aggression > 80 && this.aggression > city.diplomacy) {
                this.addHostile(city);
                // Ensure the other city also marks this city as hostile
                city.addHostile(this);
            } else if (this.diplomacy > 50 && city.diplomacy > 50) {
                this.addAlly(city);
                // Ensure the other city also marks this city as an ally
                city.addAlly(this);
            }
        }
    }

    trade() {
        for (let ally of this.allies) {
            // Simulate Trading Resources
            let tradeAmount = random(1, 3);
            this.population += tradeAmount;
            ally.population += tradeAmount;

            let techTransfer = random(0.5, 2);
            this.technology += techTransfer;
            ally.technology += techTransfer;

            // Constrain Values
            this.population = constrain(this.population, 100, 1000);
            ally.population = constrain(ally.population, 100, 1000);

            this.technology = constrain(this.technology, 0, 100);
            ally.technology = constrain(ally.technology, 0, 100);

            console.log(`Trade completed between (${this.id}) and (${ally.id})`);
        }
    }

    applyStatChange() {
        //Apply drastic stat changes
        this.population += random(-50, 50);
        this.technology += random(-10, 15);
        this.aggression += random(-10, 10);
        this.defense += random(-10, 20);
        this.militaryStrength += random(-10, 20);
        this.diplomacy += random(-10, 10);

        //Constrain Values
        this.population = constrain(this.population, 100, 1000);
        this.technology = constrain(this.technology, 0, 100);
        this.aggression = constrain(this.aggression, 0, 100);
        this.defense = constrain(this.defense, 0, 100);
        this.militaryStrength = constrain(this.militaryStrength, 0, 100);
        this.diplomacy = constrain(this.diplomacy, 0, 100);

    }

    attack(targetCity) {
        if (this.hostiles.includes(targetCity) && this.militaryStrength > targetCity.defense) {
            //Calculate damage
            let damage = this.militaryStrength - targetCity.defense;
            damage = constrain(damage, 10, 100);

            //Reduce stats 
            targetCity.defense += random(-30, -20);
            this.militaryStrength += random(-40, -30);

            //Apply damage to target city's population
            targetCity.population -= damage;
            targetCity.population = constrain(targetCity.population, 100, 1000);

            //Log Attack
            console.log(`City ${this.id} attacked City ${targetCity.id} for ${damage} damage!`);

            // Check if the target city is destroyed
            if (targetCity.population <= 100) {
                console.log(`City at (${targetCity.id}) has been destroyed!`);
                // Optionally, remove the city from the simulation
                let index = cities.indexOf(targetCity);
                if (index > -1) {
                    cities.splice(index, 1);
                }
            }
        }
        //Apply drastic stat changes
        this.population += random(-50, 50);
        this.technology += random(-10, 15);
        this.aggression += random(-10, 10);
        this.defense += random(-10, 20);
        this.militaryStrength += random(-10, 20);
        this.diplomacy += random(-10, 10);

        //Constrain Values
        this.population = constrain(this.population, 100, 1000);
        this.technology = constrain(this.technology, 0, 100);
        this.aggression = constrain(this.aggression, 0, 100);
        this.defense = constrain(this.defense, 0, 100);
        this.militaryStrength = constrain(this.militaryStrength, 0, 100);
        this.diplomacy = constrain(this.diplomacy, 0, 100);
    }


    addHostile(city) {
        if (city instanceof City && city !== this && !this.hostiles.includes(city)) {
            this.hostiles.push(city);
        }
    }

    addAlly(city) {
        if (city instanceof City && city !== this && !this.allies.includes(city)) {
            this.allies.push(city);
        }
    }

    removeHostile(city) {
        let index = this.hostiles.indexOf(city);
        if (index > -1) {
            this.hostiles.splice(index, 1);
        }
    }

    removeAlly(city) {
        let index = this.allies.indexOf(city);
        if (index > -1) {
            this.allies.splice(index, 1);
        }
    }
}

class City {
    constructor(x, y, population) {
        this.x = x;
        this.y = y;
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
        scheduleEvent("updateRelationships", this, 10000, true); // 10 seconds
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
        ellipse(this.x, this.y, adjustedSize);

    }

    update(cities) {
        //Simulate City State Changes over time
        this.technology += random(-1, 2); // Cities slowly advance in technology
        this.aggression += random(-0.5, 0.5); // Aggression fluctuates slightly
        this.defense += random(-0.5, 1); // Defense improves slowly
        this.militaryStrength += random(-1, 1); // Military strength fluctuates
        this.diplomacy += random(-0.5, 0.5); // Diplomacy fluctuates slightly

        //Constrain values
        this.technology = constrain(this.technology, 0, 100);
        this.aggression = constrain(this.aggression, 0, 100);
        this.defense = constrain(this.defense, 0, 100);
        this.militaryStrength = constrain(this.militaryStrength, 0, 100);
        this.diplomacy = constrain(this.diplomacy, 0, 100);


        //Update Population
        this.population += random(-2, 2);
        this.population = constrain(this.population, 100, 1000);

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

            //Determine relationship
            if (this.aggression > 80 && this.aggression > city.diplomacy) {
                this.addHostile(city);
            } else if (this.diplomacy > 50 && city.diplomacy > 50) {
                this.addAlly(city);
                scheduleEvent("trade", this, 1000, false, { source: this, target: city });
            }
        }
    }

    trade(allyCity) {
        //Simulate Trading Resources
        let tradeAmount = random(1, 5);
        this.population += tradeAmount;
        allyCity.population += tradeAmount;

        let techTransfer = random(1, 3);
        this.technology += techTransfer;
        allyCity.technology += techTransfer;

        //Constrain Values
        this.population = constrain(this.population, 100, 1000);
        allyCity.population = constrain(allyCity.population, 100, 1000);

        this.technology = constrain(this.technology, 0, 100);
        allyCity.technology = constrain(allyCity.technology, 0, 100);

        console.log(`Trade between (${this.x}, ${this.y}) and (${allyCity.x}, ${allyCity.y})`);
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
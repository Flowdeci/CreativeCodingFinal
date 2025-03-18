class City {
    static nextId = 0;
    constructor(x, y, population) {
        this.id = City.nextId++;
        this.x = x;
        this.y = y;

        this.population = random(200, 1000);
        this.citySize = map(this.population, 100, 1000, 40, 100);
        this.stability = this.calculateStability()
        this.hostiles = []
        this.allies = []

        //City Stats
        /** Represents the city's level of advancement*/
        this.technology = random(20, 70);
        /** Determines how likely the city is to attack others*/
        this.aggression = random(20, 70);
        /** Represents the city's ability to fend off attacks*/
        this.defense = random(20, 70);
        /**Determines the strength of the city's army */
        this.militaryStrength = random(20, 70);
        /**Determines how likely the city is to form alliances */
        this.diplomacy = random(20, 70);

        // Schedule initial relationship update
        scheduleEvent("updateRelationships", this, 3000, true);
        scheduleEvent("trade", this, 5000, true);
        scheduleEvent("statChange", this, 7000, true);
        scheduleEvent("attack", this, 10000, true);

        // Initialize building properties
        this.tiers = floor(map(this.technology, 0, 100, 1, 5)); // Tiers based on technology
        this.width = random(25, 50);
        this.target_heights = [];
        this.dimensions = [];
        this.total_height = 0;
        this.previousPopulation = population
        this.initializeBuilding()

        //Particle System for plague
        this.plagueParticles = new PlagueParticleSystem(this.x, this.y, this.total_height, color(0, 255, 0));
        this.isPlagued = false

        this.nukeEffect = null;

        this.techBuilding = new TechBuilding(this);
        this.militaryBuilding = new MilitaryBuilding(this);
        this.supportBuildings = new SupportBuildings(this);
        this.defenseShield = new DefenseShield(this);

        this.pendingDestruction = false; // Whether the city is in the destruction delay phase
        this.destructionTimer = 0; // Timer for the destruction delay
        this.isBeingDestroyed = false; // Whether the city is currently being destroyed
        this.isDestroyed = false;
    }

    render() {
        if (!this.isDestroyed) {
            if (this.isBeingDestroyed) {
                this.playDeathAnimation(); // Render the death animation
            } else {
                //Color based on stability
                let cityColor = lerpColor(color(255, 0, 0), color(0, 255, 0), this.stability);
                //Size based on population
                this.citySize = map(this.population, 100, 1000, 40, 100);
                // Pulsing effect
                let pulse = sin(frameCount * 0.1) * 2;
                let adjustedSize = this.citySize + pulse;

                //Draw City
                push()
                fill(cityColor);
                this.renderBuilding();
                pop()

                //Selected city effect
                if (selectedCity === this) {
                    push();
                    stroke(255, 200, 0); // Yellow glow
                    strokeWeight(3);
                    noFill();
                    ellipse(this.x, this.y, adjustedSize + 10);
                    pop();
                }

                this.techBuilding.renderTechEffects();
                this.militaryBuilding.renderMilitaryStrengthEffect();
                this.supportBuildings.renderSupportingBuildings();
                this.defenseShield.render();

                // Draw the plague particles
                if (this.isPlagued) {
                    this.plagueParticles.update();
                }

                if (this.nukeEffect) {
                    if (this.nukeEffect.isActive) {
                        this.nukeEffect.update(this);
                    }
                }
            }
        }
    }

    update(cities) {
        this.checkForDestruction();
        this.handleDestruction();

        if (!this.pendingDestruction && !this.isBeingDestroyed) {
            // Constrain city stats
            this.technology = constrain(this.technology, 0, 100);
            this.aggression = constrain(this.aggression, 0, 100);
            this.defense = constrain(this.defense, 0, 100);
            this.militaryStrength = constrain(this.militaryStrength, 0, 100);
            this.diplomacy = constrain(this.diplomacy, 0, 100);

            // Update stability
            this.stability = this.calculateStability();

            // Adjust building tiers if technology changes
            this.adjustTiers();

            // Adjust building heights if population changes significantly
            if (abs(this.population - this.previousPopulation) > 10) {
                this.adjustBuildingHeight(this.population);
                this.previousPopulation = this.population; ``
            }

            this.checkForDestruction();

            // Grow or shrink tiers to meet new target heights
            for (let iter = 0; iter < this.tiers; iter++) {
                let targetHeight = this.target_heights[iter];

                // Only grow the current tier if the previous one has reached its target
                if (iter === 0 || this.dimensions[iter - 1].z >= this.target_heights[iter - 1]) {
                    if (this.dimensions[iter].z < targetHeight) {
                        this.dimensions[iter].z += 1;
                    } else if (this.dimensions[iter].z > targetHeight) {
                        this.dimensions[iter].z -= 1;
                    }
                }
            }

            this.techBuilding.updateTechParticles();
            this.militaryBuilding.updateMilitaryTowers();
            this.supportBuildings.updateSupportingBuildings();
        }
    }


    triggerNukeEffect() {
        this.nukeEffect = new NukeEffect(this.x, this.y);

        this.nukeEffect.isActive = true;

        this.nukeEffect.start();

    }

    triggerPlagueEffect() {
        this.isPlagued = true;

        const plagueInterval = setInterval(() => {
            if (this.isPlagued) {
                this.plagueParticles.emit();
            }
        }, 100)// emit particels every 100ms

        //stop the plague effect
        setTimeout(() => {
            this.isPlagued = false
            clearInterval(plagueInterval);
        }, 7000)

        for (let ally of this.allies) {
            if (!ally.isPlagued) { // Avoid re-triggering if the ally is already plagued
                ally.triggerPlagueEffect();
            }
        }
    }

    initializeBuilding() {
        //console.log(`Initializing building for city ${this.id} with ${this.tiers} tiers`);
        let size_val = 1;
        // Base floor height is proportional to population
        let floor_height = map(this.population, 100, 1000, 30, 100);
        this.total_height = 0
        this.dimensions = []; // Reset dimensions
        this.target_heights = []; // Reset target heights
        for (let ctr = 0; ctr < this.tiers; ctr++) {
            this.dimensions.push(createVector(this.width * size_val, this.width * size_val));
            this.target_heights.push(floor_height);

            // Add the height of this tier to the total city height
            this.total_height += floor_height;

            // Reduce height and size for the next tier
            floor_height = (1 - (random() * (1 / 6) + 1 / 6)) * floor_height;
            size_val = (1 - (random() * (1 / 6) + 1 / 6)) * size_val;
        }

        if (this.plagueParticles) {
            this.plagueParticles.updateCityHeight(this.total_height);
        }
        if (this.techParticles) {
            this.techParticles.updateCityHeight(this.total_height);
        }

    }

    renderBuilding() {
        for (let iter = 0; iter < this.tiers; iter++) {
            push();
            // Position each tier on top of the previous one
            translate(this.x, this.y, this.sumHeights(iter) + this.dimensions[iter].z / 2);

            // Apply instability effect
            if (this.stability < 0.5) {
                let tilt = map(this.stability, 0, 0.5, 10, 0); // Tilt buildings if unstable
                rotateX(radians(tilt * random(-1, 1)));
                rotateZ(radians(tilt * random(-1, 1)));
            }

            // Color based on stability
            let stabilityColor = lerpColor(color(255, 0, 0), color(0, 255, 0), this.stability);
            fill(stabilityColor);

            if (this.dimensions[iter].z > 0) {
                box(this.dimensions[iter].x, this.dimensions[iter].y, this.dimensions[iter].z); // Draw the building
            }
            pop();
        }
    }

    destroyBuilding() {
        // Randomly destroy one of the buildings
        let intactBuildings = this.supportBuildings.supportingBuildings.filter(b => !b.destroyed);
        if (intactBuildings.length > 0) {
            let building = random(intactBuildings);
            building.destroyed = true;
        }
    }

    adjustBuildingHeight(newPopulation) {
        let floor_height = map(newPopulation, 100, 1000, 30, 100); // Recalculate base height
        let size_val = 1; // Reset size value for recalculating dimensions
        this.total_height = 0; // Reset total height tracker

        for (let ctr = 0; ctr < this.tiers; ctr++) {
            // Update target heights for each tier
            this.target_heights[ctr] = floor_height;

            // Update dimensions for each tier
            this.dimensions[ctr].x = this.width * size_val;
            this.dimensions[ctr].y = this.width * size_val;

            // Update total height
            this.total_height += floor_height;

            // Reduce height and size for the next tier
            floor_height = (1 - (random() * (1 / 6) + 1 / 6)) * floor_height;
            size_val = (1 - (random() * (1 / 6) + 1 / 6)) * size_val;
        }

        // Update particle effects height to match the new total height
        if (this.plagueParticles) {
            this.plagueParticles.updateCityHeight(this.total_height);
        }
        if (this.techParticles) {
            this.techParticles.updateCityHeight(this.total_height);
        }
    }

    adjustTiers() {
        // Calculate the new number of tiers based on technology
        const newTiers = floor(map(this.technology, 0, 100, 1, 5));

        // If the number of tiers hasn't changed, do nothing
        if (newTiers === this.tiers) return;

        // If the number of tiers has increased, add new tiers
        if (newTiers > this.tiers) {
            let floor_height = this.target_heights[this.tiers - 1]; // Start with the height of the last tier
            let size_val = this.dimensions[this.tiers - 1].x / this.width; // Start with the size of the last tier

            for (let i = this.tiers; i < newTiers; i++) {
                // Add new tier dimensions and target heights
                this.dimensions.push(createVector(this.width * size_val, this.width * size_val, 0)); // New tier starts at height 0
                this.target_heights.push(floor_height);

                // Update height and size for the next tier
                floor_height = (1 - (random() * (1 / 6) + 1 / 6)) * floor_height;
                size_val = (1 - (random() * (1 / 6) + 1 / 6)) * size_val;
            }
        }

        // If the number of tiers has decreased, remove excess tiers
        if (newTiers < this.tiers) {
            this.dimensions = this.dimensions.slice(0, newTiers); // Keep only the first newTiers dimensions
            this.target_heights = this.target_heights.slice(0, newTiers); // Keep only the first newTiers target heights
        }

        // Update the total number of tiers
        this.tiers = newTiers;

        // Recalculate total height
        this.total_height = this.target_heights.reduce((sum, height) => sum + height, 0);

        // Update particle effects height
        if (this.plagueParticles) {
            this.plagueParticles.updateCityHeight(this.total_height);
        }
        if (this.techParticles) {
            this.techParticles.updateCityHeight(this.total_height);
        }
    }

    sumHeights(num_elements) {
        let running_total = 0;
        for (let ctr = 0; ctr < num_elements; ctr++) {
            running_total += this.target_heights[ctr];
        }
        return running_total;
    }

    calculateCurrentHeight() {
        let currentHeight = 0;
        for (let tier of this.dimensions) {
            currentHeight += tier.z;
        }
        return currentHeight;
    }

    calculateStability() {
        return map(this.population, 0, 1000, 0, 1);;
    }

    checkForDestruction() {
        if (this.population <= 100 || this.stability < 0.2) {
            if (!this.pendingDestruction && !this.isBeingDestroyed) {
                this.startDestructionDelay();
            }
        } else if (this.pendingDestruction) {
            // Cancel destruction if the city recovers
            this.cancelDestructionDelay();
        }
    }

    startDestructionDelay() {
        this.pendingDestruction = true;
        this.destructionTimer = millis() + 5000; // 3-second delay
        console.log(`City ${this.id} is pending destruction.`);
    }

    cancelDestructionDelay() {
        this.pendingDestruction = false;
        this.destructionTimer = 0;
        console.log(`City ${this.id} recovered from destruction.`);
    }

    handleDestruction() {
        if (this.pendingDestruction && millis() >= this.destructionTimer) {
            this.isBeingDestroyed = true; // Start the death animation
            this.pendingDestruction = false; // Stop the pending destruction state
            console.log(`City ${this.id} is being destroyed.`);
        }
    }

    playDeathAnimation() {
        if (this.isBeingDestroyed) {
            let shrinkFactor = map(millis(), this.destructionTimer, this.destructionTimer + 3000, 1, -0.1); // Shrinks over 3 seconds

            // Ensure the animation stops at 0
            if (shrinkFactor <= 0) {
                console.log("destroy city")
                this.isDestroyed = true;
                this.destroyCity(); // Signal that the animation is complete
            }

            push();
            translate(this.x, this.y, this.total_height / 2);

            // Shrink the city to nothing
            scale(shrinkFactor);
            fill(255, 50, 50, 150);
            noStroke();
            box(this.citySize, this.citySize, this.total_height * shrinkFactor);

            pop();
        }
    }

    destroyCity() {
        console.log(`Removing City ${this.id} from simulation.`);

        const index = cities.indexOf(this);
        if (index === -1) {
            console.warn(`City ${this.id} not found in cities array.`);
            return;
        }

        // Remove the city from the cities array
        cities.splice(index, 1);

        // Schedule a respawn event if necessary
        if (cities.length < citiesSize) {
            console.log(`Scheduling respawn for a new city in 5000ms.`);
            scheduleEvent("respawnCity", null, 5000, false); // Delay of 5 seconds
        }

        console.log(`City ${this.id} successfully removed.`);
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
                queueMessage(`City ${this.id} formed an alliance with City ${city.id}.`);
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
        // Technology boosts population growth
        this.population += random(-10, 10) + map(this.technology, 0, 100, 0, 5);

        // Aggression reduces stability
        this.stability -= map(this.aggression, 0, 100, 0, 0.1);

        // Diplomacy boosts population and technology
        this.population += map(this.diplomacy, 0, 100, 0, 3);
        this.technology += map(this.diplomacy, 0, 100, 0, 2);

        // Constrain values
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
            //queueMessage(`City ${this.id} attacked City ${targetCity.id} dealing ${damage} damage!`);

        }
        //Apply drastic stat changes
        this.population += random(-50, 50);
        this.technology += random(-10, 15);
        this.aggression += random(-10, 10);
        this.defense += random(-10, 20);
        this.militaryStrength += random(-10, 20);
        this.diplomacy += random(-10, 10);

        //Constrain Values
        //this.population = constrain(this.population, 100, 1000); dont contraisn populaiton so 
        //city can be destroyed
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
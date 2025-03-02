class City {
    constructor(x, y, population) {
        this.x = x;
        this.y = y;
        this.population = population;
        this.citySize = map(this.population, 100, 1000, 40, 100);
        this.stability = this.calculateStability();
        this.hostiles = []
        this.allies = []
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

    update() {
        this.population += random(-2, 2);
        this.population = constrain(this.population, 100, 1000);

        this.stability = this.calculateStability();
    }

    calculateStability() {
        return map(this.population, 100, 1000, 0, 1);;
    }

    addHostile(city) {
        if (city instanceof City && city !== this && !this.hostiles.includes(city)) {
            this.hostiles.push(city);
            console.log(`Added hostile: City (${city.x}, ${city.y})`);
        } else if (city === this) {
            console.warn("Cannot add self as hostile.");
        } else if (this.hostiles.includes(city)) {
            console.warn("City is already marked as hostile.");
        } else {
            console.warn("Invalid hostile attempted to be added:", city);
        }
    }

    addAlly(city) {
        if (city instanceof City && city !== this && !this.allies.includes(city)) {
            this.allies.push(city);
            console.log(`Added ally: City (${city.x}, ${city.y})`);
        } else if (city === this) {
            console.warn("Cannot add self as ally.");
        } else if (this.allies.includes(city)) {
            console.warn("City is already an ally.");
        } else {
            console.warn("Invalid ally attempted to be added:", city);
        }
    }

    removeHostile(city) {
        let index = this.hostiles.indexOf(city);
        if (index > -1) {
            this.hostiles.splice(index, 1);
            console.log(`Removed hostile: City (${city.x}, ${city.y})`);
        } else {
            console.warn("Attempted to remove a city that is not hostile.");
        }
    }

    removeAlly(city) {
        let index = this.allies.indexOf(city);
        if (index > -1) {
            this.allies.splice(index, 1);
            console.log(`Removed ally: City (${city.x}, ${city.y})`);
        } else {
            console.warn("Attempted to remove a city that is not an ally.");
        }
    }
}
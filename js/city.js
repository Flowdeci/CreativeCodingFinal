class City {
    constructor(x, y, population) {
        this.x = x;
        this.y = y;
        this.population = population;
        this.citySize = map(this.population, 100, 1000, 40, 100);
        this.stability = this.calculateStability();

    }

    render() {
        //Color based on stability
        let cityColor = lerpColor(color(255, 0, 0), color(0, 255, 0), this.stability);
        //Size based on population
        this.citySize = map(this.population, 100, 1000, 40, 100);
        let pulse = sin(frameCount * 0.1) * 2; // Pulsing effect
        let adjustedSize = this.citySize + pulse;
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
}
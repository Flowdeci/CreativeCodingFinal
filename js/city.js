class City {
    constructor(x, y, population) {
        this.x = x;
        this.y = y;
        this.population = population;
        this.stability = this.calculateStability();
    }

    render() {
        //Color based on stability
        let cityColor = lerpColor(color(255, 0, 0), color(0, 255, 0), this.stability);
        //Size based on population
        let citySize = map(this.population, 100, 1000, 40, 100);
        fill(cityColor);
        noStroke();
        ellipse(this.x, this.y, citySize);
    }

    update(){
        this.population += random(-1, 0);
        this.population = constrain(this.population, 100, 1000);

        this.stability=this.calculateStability();
    }

    calculateStability(){
        return map(this.population, 100, 1000, 0, 1);;
    }
}
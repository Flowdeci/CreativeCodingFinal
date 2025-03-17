class DefenseShield {
    constructor(city) {
        this.city = city; // Reference to the city
    }

    render() {
        if (this.city.defense > 50) {
            push();


            // Shield height scales with defense and pulses slightly
            let shieldHeight = this.city.calculateCurrentHeight() + 50 + sin(frameCount * 0.05) * 10;

            translate(this.city.x, this.city.y, shieldHeight / 2); // Center the shield on the city

            rotateX(HALF_PI); // Rotate the shield to be flat



            // Shield diameter scales with city size
            let shieldDiameter = this.city.citySize + 20;

            // Transparent blue shield
            fill(0, 0, map(this.city.defense, 50, 100, 100, 255), 100); // Blue with transparency
            noStroke();

            // Draw the cylinder
            cylinder(shieldDiameter, shieldHeight);

            pop();
        }
    }
}
class DefenseShield {
    constructor(city) {
        this.city = city;
        this.currentShieldHeight = 0;
    }

    render() {
        if (this.city.defense > 50) {
            push();

            // Smoothly update shield height using lerp
            let targetHeight = this.city.total_height + 50;
            this.currentShieldHeight = lerp(this.currentShieldHeight, targetHeight, 0.01);

            // Translate the shield to center it on the city
            translate(this.city.x, this.city.y, this.currentShieldHeight / 2);


            rotateX(HALF_PI); // Rotate the shield to be flat

            // Shield diameter scales with city size
            let shieldDiameter = this.city.citySize + 20;

            // Transparent blue shield
            fill(0, 0, map(this.city.defense, 50, 100, 100, 255), 75); 

            // Draw the cylinder
            cylinder(shieldDiameter, this.currentShieldHeight);

            pop();
        }
    }
}
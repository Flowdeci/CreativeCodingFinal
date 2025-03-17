// militaryBuilding.js
class MilitaryBuilding {
    constructor(city) {
        this.city = city; // Reference to the city for position, stats, etc.
        this.militaryTowers = this.initializeMilitaryBuildings();
    }

    initializeMilitaryBuildings() {
        let towers = [];
        let numTowers = floor(map(this.city.militaryStrength, 50, 100, 4, 8));
        let radius = map(this.city.width, 25, 50, 50, 70);

        for (let i = 0; i < numTowers; i++) {
            let angle = (TWO_PI / numTowers) * i;
            let distance = radius;
            let x = this.city.x + cos(angle) * distance;
            let y = this.city.y + sin(angle) * distance;

            let heightProportion = random(0.3, 0.4);
            let maxHeight = this.city.total_height * heightProportion;

            towers.push({
                x,
                y,
                width: 10,
                depth: 10,
                height: 0,
                targetHeight: maxHeight,
                heightProportion: heightProportion,
                destroyed: false,
                grown: false,
                needsUpdate: true, // New flag to track if height update is needed
            });
        }
        return towers;
    }

    renderMilitaryStrengthEffect() {
        if (this.city.militaryStrength > 50) {
            for (let tower of this.militaryTowers) {
                let height = tower.height;
                push();
                translate(tower.x, tower.y, height / 2);
                stroke(0);
                strokeWeight(1);
                fill('brown');
                box(tower.width, tower.depth, height);
                pop();

                if (tower.grown) {
                    push();
                    translate(tower.x, tower.y, height + 5);
                    rotateX(HALF_PI);
                    stroke(50); // Gray stroke
                    strokeWeight(1);
                    fill('yellow');
                    let turretRadius = map(this.city.militaryStrength, 50, 100, 10, 15);
                    let turretHeight = map(this.city.militaryStrength, 50, 100, 10, 20);
                    rotateY(frameCount * 0.01);
                    cylinder(turretRadius, turretHeight);
                    pop();
                }
            }
        }
    }

    updateMilitaryTowers() {
        for (let tower of this.militaryTowers) {
            if (tower.destroyed) {
                // Handle destroyed towers
                if (random() < 0.001 && tower.height === 0) {
                    tower.destroyed = false;
                    tower.needsUpdate = true; 
                }
            } else if (tower.needsUpdate) {
                // Only update height if needed
                if (tower.height < tower.targetHeight) {
                    tower.height += 0.5;
                } else {
                    tower.height = tower.targetHeight; // Snap to target height
                    tower.grown = true; 
                    tower.needsUpdate = false;
                }
            }
        }
    }
}
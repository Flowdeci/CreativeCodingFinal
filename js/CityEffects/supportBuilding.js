// supportBuildings.js
class SupportBuildings {
    constructor(city) {
        this.city = city; // Reference to the city
        this.supportingBuildings = this.initializeSupportingBuildings();
    }

    initializeSupportingBuildings() {
        let buildings = [];
        let numBuildings = floor(map(this.city.population, 100, 1000, 2, 7));
        let radius = this.city.width;

        for (let i = 0; i < numBuildings; i++) {
            let angle = (TWO_PI / numBuildings) * i;
            let distance = radius;
            let x = this.city.x + cos(angle) * distance;
            let y = this.city.y + sin(angle) * distance;

            let heightProportion = random(0.3, 0.7);
            let maxHeight = this.city.total_height * heightProportion;

            buildings.push({
                x,
                y,
                width: random(10, 20),
                depth: random(10, 20),
                height: 0,
                targetHeight: maxHeight,
                heightProportion: heightProportion,
                destroyed: false,
                needsUpdate: true, // New flag to track if height update is needed
            });
        }
        return buildings;
    }

    renderSupportingBuildings() {
        for (let building of this.supportingBuildings) {
            if (!building.destroyed) {
                let height = building.height;
                push();
                translate(building.x, building.y, height / 2);
                fill('grey');
                box(building.width, building.depth, height);
                pop();
            }
        }
    }

    updateSupportingBuildings() {
        for (let building of this.supportingBuildings) {
            if (building.destroyed) {
                // Handle destroyed buildings
                if (random() < 0.001 && building.height === 0) {
                    building.destroyed = false;
                    building.needsUpdate = true; // Mark for growth
                }
            } else if (building.needsUpdate) {
                // Only update height if needed
                if (building.height < building.targetHeight) {
                    building.height += 0.5;
                } else {
                    building.height = building.targetHeight; 
                    building.needsUpdate = false;
                }
            }
        }
    }
}
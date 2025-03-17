// techBuilding.js
class TechBuilding {
    constructor(city) {
        this.city = city;
        this.techParticles = new TechBoostParticleSystem(city.x, city.y, city.total_height, color(0, 0, 255));
        this.isTechBoosted = false;
    }

    renderTechEffects() {
        if (this.city.technology > 50) {
            push();
            noFill();
            let shieldPulse = sin(frameCount * 0.1) * 10;
            for (let i = 0; i < 3; i++) {
                stroke(0, 200, 255, 80 - i * 20);
                ellipse(this.city.x, this.city.y, this.city.citySize + 50 + shieldPulse + i * 10);
            }

            if (this.city.technology > 60) {
                push();
                translate(this.city.x, this.city.y);
                rotate(frameCount * 0.02);
                stroke(0, 255, 255, 150);
                ellipse(0, 0, this.city.citySize + 50, this.city.citySize + 50);
                pop();

                if (this.city.technology > 70) {
                    push();
                    translate(this.city.x, this.city.y, this.city.total_height + 20);
                    rotateX(frameCount * 0.02);
                    rotateY(frameCount * 0.02);
                    let cubeScale = sin(frameCount * 0.05) * 5 + 20;
                    noFill();
                    stroke(0, 255, 255, 150);
                    box(cubeScale);
                    pop();
                }
            }
            pop();
        }
    }

    updateTechParticles() {
        this.techParticles.update();
    }

    triggerTechBoostEffect() {
        this.isTechBoosted = true;

        const techInterval = setInterval(() => {
            if (this.isTechBoosted) {
                this.techParticles.emit();
            }
        }, 100);

        setTimeout(() => {
            this.isTechBoosted = false;
            clearInterval(techInterval);
        }, 4000);
    }
}
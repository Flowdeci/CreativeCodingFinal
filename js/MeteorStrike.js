class MeteorStrike {
    constructor(cities) {
        this.meteors = [];

        for (let city of cities) {
            this.meteors.push({
                x: random(-earthWidth / 2, earthWidth / 2),
                y: random(-earthHeight / 2, earthHeight / 2),
                z: 500,
                targetZ: 0,
                speed: random(5, 10),
                explosionTriggered: false,
                explosionParticles: [],
                shockwaveRadius: 0,
                isActive: true
            })
        }
    }


    /** Update the meteors positions and explosions */
    update(cities) {
        for (let meteor of this.meteors) {
            if (!meteor.explosionTriggered) {
                //Move the metor to target
                meteor.z -= meteor.speed;

                // Check if metor is on the ground
                if (meteor.z <= 0) {
                    meteor.z = 0;
                    meteor.explosionTriggered = true;
                    console.log("metor hit ground")

                    for (let city of cities) {
                        let distance = dist(city.x, city.y, meteor.x, meteor.y);
                        if (distance < 100) { 
                            city.destroyBuilding();
                            console.log(`Meteor destroyed a building in City ${city.id}`);
                        }
                    }


                    // Create explosion particles
                    for (let i = 0; i < 150; i++) {
                        meteor.explosionParticles.push({
                            x: meteor.x,
                            y: meteor.y,
                            z: 0,
                            vx: random(-3, 3),
                            vy: random(-3, 3),
                            vz: random(0, 3),
                            lifespan: random(100, 200),
                        });
                    }

                }
            } else {
                // Update explosion particles
                for (let i = meteor.explosionParticles.length - 1; i >= 0; i--) {
                    let particle = meteor.explosionParticles[i];
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.z += particle.vz;
                    particle.lifespan -= 2;

                    // Remove dead particles
                    if (particle.lifespan <= 0) {
                        meteor.explosionParticles.splice(i, 1);
                    }
                }

                // Expand the shockwave
                meteor.shockwaveRadius += 3;

                // Deactivate the meteor when particles and shockwave are done
                if (meteor.explosionParticles.length === 0 && meteor.shockwaveRadius > 300) {
                    meteor.isActive = false;
                }
            }
        }

    }

    /** Render the meteors and explosions */
    render() {
        for (let meteor of this.meteors) {
            if (!meteor.explosionTriggered) {
                // Render the falling meteor
                push();
                translate(meteor.x, meteor.y, meteor.z);
                fill(255, 100, 0);
                noStroke();
                sphere(10);
                pop();
            } else {
                // Render explosion particles
                for (let particle of meteor.explosionParticles) {
                    push();
                    translate(particle.x, particle.y, particle.z);
                    noStroke();
                    fill(255, 150, 0, map(particle.lifespan, 0, 200, 0, 255));
                    sphere(map(particle.lifespan, 0, 200, 0, 5));
                    pop();
                }

                // Render shockwave
                if (meteor.shockwaveRadius < 300) {
                    push();
                    noFill();
                    stroke(255, 200, 0, map(meteor.shockwaveRadius, 0, 300, 255, 0));
                    strokeWeight(2);
                    ellipse(meteor.x, meteor.y, meteor.shockwaveRadius * 2);
                    pop();
                }
            }
        }
    }

    /** Check if all meteors are inactive */
    isComplete() {
        return this.meteors.every(meteor => !meteor.isActive);
    }
}
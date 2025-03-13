class NukeEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.z = 500;
        this.explosionParticles = [];
        this.shockwaveRadius = 0;
        this.isActive = false;
        this.hasExploded = false;
    }

    start() {
        for (let i = 0; i < 250; i++) {
            this.explosionParticles.push({
                x: this.x,
                y: this.y,
                z: random(0, 10),
                vx: random(-2, 2),
                vy: random(-2, 2),
                vz: random(0, 5),
                lifesan: random(250, 400)
            });
        }
    }

    /** Update the eplostion particels and shockwave*/
    update() {
        this.render();
        if (!this.hasExploded) {
            this.z -= 10;
            if (this.z <= 0) {
                this.z = 0;
                this.hasExploded = true;
            }
        } else {
            //Particles
            for (let i = 0; i < this.explosionParticles.length; i++) {
                let particle = this.explosionParticles[i];
                //Updaate velocity and lifespan
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.z += particle.vz;
                particle.lifesan -= random(1, 3);

                //Remove dead particles
                if (particle.lifesan <= 0) {
                    this.explosionParticles.splice(i, 1)
                }
            }

            //Shockwave
            this.shockwaveRadius += 1;

            //End the effect
            if (this.explosionParticles.length === 0 && this.shockwaveRadius > 500) {
                this.isActive = false;
            }
        } 
    }

    /** Draw the nuke effect on screen */
    render() {
        if (!this.hasExploded) {
            // Render the falling nuke
            push();
            translate(this.x, this.y, this.z + 40);
            rotateX(radians(270));
            fill(150);
            noStroke();
            cylinder(10, 40);
            pop();

            push();
            translate(this.x, this.y, this.z);
            rotateX(radians(270));
            fill(255, 0, 0);
            noStroke();
            cone(10, 30);
            pop();
        } else {
            //Render explostion particles
            for (let particle of this.explosionParticles) {
                push();
                noStroke();
                translate(particle.x, particle.y, particle.z);
                fill(255, 100, 0, map(particle.lifesan, 0, 100, 0, 255))//Fiery color
                sphere(map(particle.lifesan, 0, 400, 0, 3));
                pop();
            }

            //Render shockwave
            if (this.shockwaveRadius < 500) {
                push();
                noFill();
                stroke(255, 200, 0, map(this.shockwaveRadius, 0, 500, 255, 0));//Fades as it expands
                strokeWeight(2);
                ellipse(this.x, this.y, this.shockwaveRadius * 2);
                pop();
            }
        }

    }
}